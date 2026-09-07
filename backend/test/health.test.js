const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");

const { createApp } = require("../src/app");
const { createReadinessCheck } = require("../src/health/readiness");

async function request(app, path) {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    return {
      body: await response.json(),
      status: response.status,
    };
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

test("GET /api/health/live returns the monitoring API liveness state", async () => {
  const response = await request(createApp(), "/api/health/live");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    service: "monitoring-api",
    status: "ok",
  });
});

test("GET /api/health/ready confirms PostgreSQL and Redis are ready", async () => {
  const readiness = createReadinessCheck({
    prisma: {
      $queryRawUnsafe: async () => 1,
    },
    redis: {
      ping: async () => "PONG",
    },
  });

  const response = await request(createApp({ readiness }), "/api/health/ready");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    dependencies: {
      database: "ok",
      redis: "ok",
    },
    status: "ok",
  });
});

test("GET /api/health/ready reports only Redis as unavailable when it rejects", async () => {
  const readiness = createReadinessCheck({
    prisma: {
      $queryRawUnsafe: async () => 1,
    },
    redis: {
      ping: async () => {
        throw new Error("Redis tidak dapat dihubungi");
      },
    },
  });

  const response = await request(createApp({ readiness }), "/api/health/ready");

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, {
    dependencies: {
      database: "ok",
      redis: "error",
    },
    status: "error",
  });
});
