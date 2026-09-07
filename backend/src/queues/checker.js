const { Worker } = require("bullmq");
const { PrismaClient } = require("@prisma/client");
const { getRedisConnection } = require("./connection");

const prisma = new PrismaClient();

async function startWorker() {
  const connection = await getRedisConnection();

  const worker = new Worker("monitoring-checks", async (job) => {
    const { applicationId, url } = job.data;
    console.log(`[Worker] Memproses URL: ${url}`);
    
    const startTime = Date.now();
    try {
      const response = await fetch(url);
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`[ONLINE] ${url} OK (${latency} ms)`);
      } else {
        console.log(`[OFFLINE] ${url} Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`[OFFLINE] ${url} Error: ${error.message}`);
    }
  }, { connection });

  worker.on("ready", () => {
    console.log("Worker HTTP Checker siap menerima tugas...");
  });

  worker.on("failed", (job, err) => {
    console.error(`Job gagal: ${err.message}`);
  });
}

startWorker();