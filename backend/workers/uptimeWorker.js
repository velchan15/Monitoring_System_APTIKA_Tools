const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// MonitoringLog.monitoringNodeId wajib diisi (bukan optional) — jadi worker ini
// butuh 1 baris MonitoringNode buat mewakili "server yang jalanin pengecekan ini".
// Dibuat otomatis kalau belum ada, lalu id-nya di-cache biar ga query berulang.
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
        location: "Lokal" // <-- Tambahkan baris ini
      } 
    });
  }
  cachedNodeId = node.id;
  return cachedNodeId;
}

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
        const response = await axios.get(app.url, { timeout: 8000 });
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

      // Status ringkas buat Application.status — ini yang dipakai frontend
      // (IncidentTable.tsx) buat deteksi aplikasi mana yang lagi bermasalah.
      const WARNING_THRESHOLD_MS = 3000;
      let appStatus = "ONLINE";
      if (!isUp) appStatus = "OFFLINE";
      else if (responseTimeMs > WARNING_THRESHOLD_MS) appStatus = "WARNING";

      // Ditaruh dalam try/catch TERPISAH per-aplikasi — supaya kalau 1 aplikasi
      // gagal ditulis ke DB, aplikasi lain di daftar tetap lanjut dicek (sebelumnya
      // 1 error di tengah loop bikin SEMUA aplikasi sisanya ikut ke-skip).
      try {
        // 1. Simpan hasil pengecekan (nama field harus PERSIS sama dengan schema.prisma)
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

        // 2. Update status ringkas di Application (dipakai frontend)
        await prisma.application.update({
          where: { id: app.id },
          data: { status: appStatus },
        });

        // 3. Perbarui/bikin ringkasan harian (field: successfulChecks, uptimePercentage)
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

        // 4. Kalau offline dan belum ada insiden aktif, buat insiden baru
        //    (field disesuaikan dengan model Incident — ga ada `departmentId`/`title`)
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
  runUptimeCheck(); // jalan langsung sekali, ga nunggu interval 30 detik pertama
  setInterval(runUptimeCheck, 30 * 1000);
}

module.exports = { startUptimeWorker, runUptimeCheck };