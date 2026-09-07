# MVP Backend Foundation Implementation Plan

> **For agentic workers:** Use the host's available task-by-task implementation workflow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an independently runnable Express backend foundation using PostgreSQL through Prisma and Redis through BullMQ, while preserving the existing Next.js frontend.

**Architecture:** The repository keeps the existing frontend at its root and adds a self-contained `backend/` Node.js service. Express owns liveness and readiness endpoints; Prisma owns the PostgreSQL schema; BullMQ owns the named monitoring and notification queues. Infrastructure addresses are injected through validated environment variables so Laragon-managed PostgreSQL and Redis can be used without Docker.

**Tech Stack:** Node.js, Express, Prisma ORM, PostgreSQL, Redis, BullMQ, Node test runner.

## Global Constraints

- Do not modify files under `app/`, `components/`, or `lib/`.
- Use PostgreSQL, not the locally installed MySQL service.
- Connect to locally managed PostgreSQL on port `5432` and Redis on port `6379` by default; credentials remain outside version control in `backend/.env`.
- Do not implement authentication, application CRUD, HTTP checking, scheduling, notifications, or frontend API integration in this foundation phase.
- Every behavior added to runtime code is introduced with a focused failing test, then implemented until green.

---

### Task 1: Express service with liveness endpoint

**Files:**
- Create: `backend/package.json`
- Create: `backend/src/app.js`
- Create: `backend/src/server.js`
- Create: `backend/test/health.test.js`

**Interfaces:**
- Consumes: `PORT` from the process environment, defaulting to `3001`.
- Produces: `createApp({ readiness }?)`, an Express application exposing `GET /api/health/live`.

- [ ] **Step 1: Add the test runner and focused failing test**

Create the backend package test script using Node's built-in test runner. Write an HTTP request against `createApp()` asserting that `GET /api/health/live` responds with HTTP 200 and JSON `{ status: "ok", service: "monitoring-api" }`.

- [ ] **Step 2: Verify the relevant failure**

Run: `npm test -- --test-name-pattern="liveness"`

Expected: the command exits non-zero because the backend application module does not exist.

- [ ] **Step 3: Implement the minimum behavior**

Install the declared backend dependencies. Implement `createApp` with JSON parsing, the liveness route, and a final JSON 404 response. Implement `server.js` to listen on the configured port and close cleanly on `SIGTERM` and `SIGINT`.

- [ ] **Step 4: Verify the focused pass**

Run: `npm test -- --test-name-pattern="liveness"`

Expected: the liveness assertion passes with exit code 0.

- [ ] **Step 5: Run the affected integration check**

Run: `npm test`

Expected: all backend tests pass.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add backend/package.json backend/src/app.js backend/src/server.js backend/test/health.test.js
git commit -m "feat: add Express backend foundation"
```

### Task 2: PostgreSQL Prisma data foundation

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/db/prisma.js`
- Create: `backend/test/schema.test.js`
- Create: `backend/.env.example`

**Interfaces:**
- Consumes: `DATABASE_URL`, containing a PostgreSQL connection string.
- Produces: Prisma client singleton and tables for departments, applications, monitoring nodes, monitoring logs, incidents, maintenance schedules, daily uptime summaries, roles, users, notifications, audit logs, screenshots, scheduler heartbeats, and retention policies.

- [ ] **Step 1: Add the focused failing test**

Write a test that invokes `npx prisma validate --schema prisma/schema.prisma` from `backend/` and asserts that it exits with code 0. The production defect caught is an invalid or incomplete data model that Prisma cannot load.

- [ ] **Step 2: Verify the relevant failure**

Run: `npm test -- --test-name-pattern="Prisma schema"`

Expected: the command exits non-zero because `prisma/schema.prisma` does not exist.

- [ ] **Step 3: Implement the minimum behavior**

Define PostgreSQL datasource and Prisma client generator, enums for monitoring state and application type, and the fourteen documented relational models. Add only schema-level indexes required for lookup by department, application timestamp, active application, and incident state. Add a singleton Prisma client and an environment example using `postgresql://monitoring:monitoring@127.0.0.1:5432/monitoring?schema=public`.

- [ ] **Step 4: Verify the focused pass**

Run: `npm test -- --test-name-pattern="Prisma schema"`

Expected: Prisma validates the schema and the test exits 0.

- [ ] **Step 5: Run the affected integration check**

Run: `npx prisma format --schema prisma/schema.prisma; npx prisma validate --schema prisma/schema.prisma`

Expected: formatting completes and the PostgreSQL schema validates.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add backend/prisma/schema.prisma backend/src/db/prisma.js backend/test/schema.test.js backend/.env.example
git commit -m "feat: add Prisma monitoring schema"
```

### Task 3: Redis and BullMQ readiness boundary

**Files:**
- Create: `backend/src/queues/connection.js`
- Create: `backend/src/queues/queues.js`
- Modify: `backend/src/app.js`
- Modify: `backend/test/health.test.js`

**Interfaces:**
- Consumes: `REDIS_URL`, defaulting to `redis://127.0.0.1:6379`.
- Produces: `monitoringQueue`, `notificationQueue`, and `createReadinessCheck({ prisma, redis })` returning `{ database: "ok" | "error", redis: "ok" | "error" }`.

- [ ] **Step 1: Add the focused failing test**

Extend the health test with injected fake Prisma and Redis clients: when both resolve, `GET /api/health/ready` returns HTTP 200 with both dependency states `ok`; when Redis rejects, it returns HTTP 503 and reports Redis as `error` without falsely reporting the database as failed.

- [ ] **Step 2: Verify the relevant failure**

Run: `npm test -- --test-name-pattern="readiness"`

Expected: the command exits non-zero because the readiness route does not exist.

- [ ] **Step 3: Implement the minimum behavior**

Create a Redis connection with `maxRetriesPerRequest: null`, instantiate the monitoring and notification queues, and implement an injectable readiness check that runs PostgreSQL `SELECT 1` and Redis `PING` in parallel. Add `/api/health/ready`; return 200 only when both checks pass, otherwise return 503 with each dependency state.

- [ ] **Step 4: Verify the focused pass**

Run: `npm test -- --test-name-pattern="readiness"`

Expected: both success and Redis-failure behavior pass.

- [ ] **Step 5: Run the affected integration check**

Run: `npm test`

Expected: all backend tests pass.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add backend/src/queues/connection.js backend/src/queues/queues.js backend/src/app.js backend/test/health.test.js
git commit -m "feat: add Redis queue readiness checks"
```

### Task 4: Local operational instructions and live-service verification

**Files:**
- Create: `backend/README.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: Laragon-managed PostgreSQL database `monitoring`, the `.env` values copied from `.env.example`, and Redis listening on `127.0.0.1:6379`.
- Produces: repeatable commands for dependency installation, migration, API startup, and health checks.

- [ ] **Step 1: Add the focused failing test**

No new runtime behavior is introduced. Reuse the complete backend test suite and Prisma validation as the verification boundary.

- [ ] **Step 2: Verify the relevant failure**

No red test applies because this task documents existing runtime contracts rather than changing them.

- [ ] **Step 3: Implement the minimum behavior**

Document how to install PostgreSQL, create the `monitoring` database and role, start Redis from Laragon, copy `.env.example` to `.env`, run `npm run prisma:migrate`, start the API, and call both health routes. Document the expected readiness response when PostgreSQL or Redis is stopped. Link the backend documentation from the root README.

- [ ] **Step 4: Verify the focused pass**

Run: `npm test; npx prisma validate --schema prisma/schema.prisma`

Expected: tests and schema validation complete successfully.

- [ ] **Step 5: Run the affected integration check**

Run after PostgreSQL is installed and Redis is running: `npm run prisma:migrate; npm run dev; Invoke-WebRequest http://localhost:3001/api/health/ready`

Expected: migration applies and readiness returns HTTP 200 with PostgreSQL and Redis both `ok`.

- [ ] **Step 6: Commit the passing deliverable**

```bash
git add backend/README.md README.md
git commit -m "docs: add local backend setup guide"
```

## Execution Handoff

The available host workflow is inline execution. Execute the tasks in order, preserving the focused red-green evidence recorded in each task. PostgreSQL installation and live integration verification require the local service to be installed and started by the user or an authorized system administrator.
