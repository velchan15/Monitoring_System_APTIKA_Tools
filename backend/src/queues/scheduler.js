const { PrismaClient } = require("@prisma/client");
const { getRedisConnection } = require("./connection");
const { Queue } = require("bullmq");

const prisma = new PrismaClient();

async function main() {
  const connection = await getRedisConnection();
  const monitoringQueue = new Queue("monitoring-checks", { connection });

  const apps = await prisma.application.findMany({ where: { isMonitored: true } });
  
  for (const app of apps) {
    await monitoringQueue.add("check-url", { applicationId: app.id, url: app.url }, {
      removeOnComplete: true,
      removeOnFail: true
    });
    console.log(`[OK] Masuk antrean: ${app.name} (${app.url})`);
  }

  setTimeout(async () => {
    await monitoringQueue.close();
    process.exit(0);
  }, 2000);
}

main();