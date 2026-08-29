require("dotenv").config();

const { createApp } = require("./app");
const { prisma } = require("./db/prisma");
const { createReadinessCheck } = require("./health/readiness");
const { redisConnection } = require("./queues/connection");
const { closeQueues } = require("./queues/queues");

const port = Number.parseInt(process.env.PORT || "3001", 10);
const app = createApp({
  readiness: createReadinessCheck({ prisma, redis: redisConnection }),
});
const server = app.listen(port, () => {
  console.log(`Monitoring API berjalan pada http://127.0.0.1:${port}`);
});

async function shutdown(signal) {
  console.log(`Menerima ${signal}; menghentikan Monitoring API.`);
  server.close(async () => {
    await closeQueues();
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
