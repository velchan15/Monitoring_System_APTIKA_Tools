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

// Menyiapkan agen HTTPS agar mengabaikan masalah SSL lama dari server target
const httpsAgent = new https.Agent({  
  rejectUnauthorized: false 
});

async function runUptimeCheck() {
  console.log("🔄 Memulai pemeriksaan kesehatan aplikasi (Uptime & Ping)...");

  try {
    const monitoringNodeId = await getMonitoringNodeId();
    const apps = await prisma.application.findMany({ where: { isActive: true } });

    for (const app of apps) {
      if (!app.url) continue;

      const startTime = Date.now();
      let responseTimeMs = 0;
      let isUp = false;
      let statusCode = null;
      let errorMessage = null;

      try {
        // PERBAIKAN: Gunakan batas waktu 15 detik dan menyamar sebagai browser sungguhan
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

      const WARNING_THRESHOLD_MS = 5000; // Naikkan toleransi "Warning" jadi 5 detik
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

    console.log("✅ Pemeriksaan uptime selesai.");
  } catch (err) {
    console.error("❌ Gagal menjalankan worker uptime:", err.message);
  }
}

function startUptimeWorker() {
  console.log("🕒 Worker pemantau uptime berjalan setiap 30 detik.");
  runUptimeCheck(); 
  setInterval(runUptimeCheck, 30 * 1000);
}

module.exports = { startUptimeWorker, runUptimeCheck };