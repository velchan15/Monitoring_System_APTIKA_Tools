const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

const backendRoot = path.resolve(__dirname, "..");
const prismaCli = require.resolve("prisma/build/index.js");

test("Prisma schema validates for PostgreSQL", () => {
  const result = spawnSync(
    process.execPath,
    [prismaCli, "validate", "--schema", "prisma/schema.prisma"],
    {
      cwd: backendRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL:
          process.env.DATABASE_URL ||
          "postgresql://monitoring:monitoring@127.0.0.1:5432/monitoring?schema=public",
      },
    }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
