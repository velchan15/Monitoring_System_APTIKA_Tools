require("dotenv").config();

const { chromium } = require('playwright'); 
const { createApp } = require("./app");
const { prisma } = require("./db/prisma");
const { createReadinessCheck } = require("./health/readiness");
const { redisConnection } = require("./queues/connection");
const { closeQueues } = require("./queues/queues");

// 1. Impor semua background worker
const { startUptimeWorker } = require("../workers/uptimeWorker");
const { startMonitoringWorker, stopMonitoringWorker } = require("../workers/monitoringWorker");
const { startRetentionWorker } = require("../workers/retentionWorker");
const { startSslWorker } = require("../workers/sslWorker"); 

const port = Number.parseInt(process.env.PORT || "3001", 10);
const app = createApp({
  readiness: createReadinessCheck({ prisma, redis: redisConnection }),
});

// Variabel global untuk menyimpan 1 instance browser agar tidak boros RAM
let globalBrowser = null;

// ==========================================
// ENDPOINT REAL-TIME SCREENSHOT PLAYWRIGHT
// ==========================================
app.get('/api/screenshot', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL diperlukan');

  if (!globalBrowser) {
    return res.status(500).send('Browser belum siap');
  }

  let context;
  try {
    // Hanya membuat context (sesi) dan tab baru, bukan browser baru
    context = await globalBrowser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    
    await page.goto(targetUrl, { timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1500); // Tunggu animasi rendering selesai
    
    const buffer = await page.screenshot({ fullPage: false });
    
    // Tutup context (tab) setelah selesai agar RAM kembali lega
    await context.close();

    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error("Gagal ambil screenshot:", error);
    if (context) await context.close(); // Pastikan tab tertutup jika terjadi error
    res.status(500).send('Gagal');
  }
});
// ==========================================

const server = app.listen(port, async () => {
  console.log(`Monitoring API berjalan pada http://127.0.0.1:${port}`);
  
  // Inisialisasi SATU browser global saat server menyala
  console.log("Mempersiapkan Playwright Browser...");
  globalBrowser = await chromium.launch({ headless: true });
  console.log("Playwright Browser siap!");

  // 2. Jalankan semua background worker 
  startUptimeWorker();
  startMonitoringWorker();
  startRetentionWorker();
  startSslWorker();
});

async function shutdown(signal) {
  console.log(`Menerima ${signal}; menghentikan Monitoring API.`);
  server.close(async () => {
    // Matikan browser global saat server dimatikan
    if (globalBrowser) {
      await globalBrowser.close();
      console.log("Playwright Browser dimatikan.");
    }
    
    await stopMonitoringWorker();
    await closeQueues();
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));