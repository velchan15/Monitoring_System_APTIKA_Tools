const axios = require('axios');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NODE_NAME = "Monitor Lokal";
let cachedNodeId = null;

async function getMonitoringNodeId() {
  if (cachedNodeId) return cachedNodeId;

  let node = await prisma.monitoringNode.findFirst({ where: { name: NODE_NAME } });
  if (!node) {
    node = await prisma.monitoringNode.create({ 
      data: { 
        name: NODE_NAME, 
        isActive: true,
        location: "Lokal" 
      } 
    });
  }
  cachedNodeId = node.id;
  return cachedNodeId;
}

const httpsAgent = new https.Agent({  
  rejectUnauthorized: false 
});

// PERBAIKAN UTAMA: Fungsi untuk menjalankan pengecekan secara PARALEL
async function runInChunks(items, size, worker) {
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    await Promise.all(chunk.map(worker));
  }
}

// Fungsi untuk mengecek SATU aplikasi
async function checkOneApp(app, monitoringNodeId) {
  if (!app.url) return;

  const startTime = Date.now();
  let responseTimeMs = 0;
  let isUp = false;
  let statusCode = null;
  let errorMessage = null;

  try {
    const response = await axios.get(app.url, { 
      timeout: 15000,
      httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive'
      }
    });
    
    responseTimeMs = Date.now() - startTime;
    statusCode = response.status;
    if (response.status >= 200 && response.status < 400) {
      isUp = true;
    }
  } catch (error) {
    responseTimeMs = Date.now() - startTime;
    isUp = false;
    statusCode = error.response ? error.response.status : null;
    errorMessage = error.message;
  }

  const WARNING_THRESHOLD_MS = 5000;
  let appStatus = "ONLINE";
  if (!isUp) appStatus = "OFFLINE";
  else if (responseTimeMs > WARNING_THRESHOLD_MS) appStatus = "WARNING";

  try {
    await prisma.monitoringLog.create({
      data: {
        applicationId: app.id,
        monitoringNodeId,
        statusCode,
        responseTimeMs,
        isUp,
        errorMessage,
        checkedAt: new Date(),
      },
    });

    await prisma.application.update({
      where: { id: app.id },
      data: { status: appStatus },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSummary = await prisma.uptimeDailySummary.findFirst({
      where: { applicationId: app.id, date: today },
    });

    if (existingSummary) {
      const newTotalChecks = existingSummary.totalChecks + 1;
      const newSuccessfulChecks = existingSummary.successfulChecks + (isUp ? 1 : 0);
      const newUptimePercentage = (newSuccessfulChecks / newTotalChecks) * 100;

      await prisma.uptimeDailySummary.update({
        where: { id: existingSummary.id },
        data: {
          totalChecks: newTotalChecks,
          successfulChecks: newSuccessfulChecks,
          uptimePercentage: newUptimePercentage,
          avgResponseMs: responseTimeMs,
        },
      });
    } else {
      await prisma.uptimeDailySummary.create({
        data: {
          applicationId: app.id,
          date: today,
          totalChecks: 1,
          successfulChecks: isUp ? 1 : 0,
          uptimePercentage: isUp ? 100.0 : 0.0,
          avgResponseMs: responseTimeMs,
        },
      });
    }

    if (!isUp) {
      const activeIncident = await prisma.incident.findFirst({
        where: { applicationId: app.id, status: { not: "resolved" } },
      });

      if (!activeIncident) {
        await prisma.incident.create({
          data: {
            applicationId: app.id,
            severity: "CRITICAL",
            status: "open",
            startedAt: new Date().toISOString(),
            cause: `Sistem pendeteksi otomatis mendeteksi ${app.name} tidak merespon (timeout/down).`,
            timeline: [],
          },
        });
      }
    }
  } catch (dbError) {
    console.error(`  ❌ Gagal simpan hasil cek untuk ${app.name}:`, dbError.message);
  }
}

async function runUptimeCheck() {
  console.log("🔄 Memulai pemeriksaan kesehatan aplikasi (Uptime & Ping) secara Paralel...");

  try {
    const monitoringNodeId = await getMonitoringNodeId();
    const apps = await prisma.application.findMany({ where: { isActive: true } });

    // JALANKAN 20 APLIKASI SEKALIGUS (Konkurensi)
    await runInChunks(apps, 20, (app) => checkOneApp(app, monitoringNodeId));

    console.log("✅ Pemeriksaan uptime selesai.");

    // --- START PEMBERSIHAN OTOMATIS 12 JAM ---
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    try {
      const deletedLogs = await prisma.monitoringLog.deleteMany({
        where: {
          checkedAt: {
            lt: twelveHoursAgo,
          },
        },
      });
      console.log(`🧹 Membersihkan ${deletedLogs.count} log lama.`);
    } catch (cleanupErr) {
      console.error("Gagal membersihkan log lama:", cleanupErr.message);
    }
    // --- END PEMBERSIHAN OTOMATIS 12 JAM ---

  } catch (err) {
    console.error("❌ Gagal menjalankan worker uptime:", err.message);
  }
}

function startUptimeWorker() {
  console.log("🕒 Worker pemantau uptime berjalan setiap 60 detik.");
  runUptimeCheck(); 
  // Interval dinaikkan jadi 60 detik agar tidak terlalu membebani database
  setInterval(runUptimeCheck, 60 * 1000);
}

module.exports = { startUptimeWorker, runUptimeCheck };