require("dotenv").config();

const { chromium } = require('playwright'); // <-- Tambahan import Playwright
const { createApp } = require("./app");
const { prisma } = require("./db/prisma");
const { createReadinessCheck } = require("./health/readiness");
const { redisConnection } = require("./queues/connection");
const { closeQueues } = require("./queues/queues");

// 1. Impor worker pemantau uptime
const { startUptimeWorker } = require("../workers/uptimeWorker");
const { startMonitoringWorker, stopMonitoringWorker } = require("../workers/monitoringWorker");

const port = Number.parseInt(process.env.PORT || "3001", 10);
const app = createApp({
  readiness: createReadinessCheck({ prisma, redis: redisConnection }),
});

// ==========================================
// ENDPOINT REAL-TIME SCREENSHOT PLAYWRIGHT
// ==========================================
app.get('/api/screenshot', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL diperlukan');

  try {
    // Membuka browser virtual di balik layar
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    
    // Buka website (tunggu maksimal 15 detik, abaikan error jika website benar-benar mati)
    await page.goto(targetUrl, { timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1500); // Jeda rendering elemen halaman
    
    // Ambil jepretan layar dalam bentuk buffer gambar
    const buffer = await page.screenshot({ fullPage: false });
    await browser.close();

    // Kirim langsung format gambarnya ke Frontend Next.js
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error("Gagal ambil screenshot:", error);
    res.status(500).send('Gagal');
  }
});
// ==========================================

const server = app.listen(port, () => {
  console.log(`Monitoring API berjalan pada http://127.0.0.1:${port}`);
  
  // 2. Jalankan background worker setelah server berhasil menyala
  startUptimeWorker();
  startMonitoringWorker();
});

async function shutdown(signal) {
  console.log(`Menerima ${signal}; menghentikan Monitoring API.`);
  server.close(async () => {
    await stopMonitoringWorker();
    await closeQueues();
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));