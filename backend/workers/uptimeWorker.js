const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runUptimeCheck() {
  console.log("🔄 Memulai pemeriksaan kesehatan aplikasi (Uptime & Ping)...");
  
  try {
    // Ambil semua aplikasi aktif yang memiliki URL
    const apps = await prisma.application.findMany({
      where: { isActive: true }
    });

    for (const app of apps) {
      if (!app.url) continue;

      const startTime = Date.now();
      let responseTime = 0;
      let isUp = false;

      try {
        // Melakukan request HTTP (Ping) ke URL aplikasi
        const response = await axios.get(app.url, { timeout: 8000 });
        responseTime = Date.now() - startTime;
        
        // Status dianggap UP jika merespon dengan kode 2xx atau 3xx
        if (response.status >= 200 && response.status < 400) {
          isUp = true;
        }
      } catch (error) {
        // Jika gagal diakses (timeout atau server down)
        responseTime = Date.now() - startTime;
        isUp = false;
      }

      // 1. Simpan hasil pengecekan ke tabel MonitoringLog
      await prisma.monitoringLog.create({
        data: {
          applicationId: app.id,
          status: isUp ? "ONLINE" : "OFFLINE",
          responseTime: responseTime,
          responseCode: isUp ? 200 : 500,
          checkedAt: new Date(),
        }
      });

      // 2. Perbarui atau buat ringkasan harian di UptimeDailySummary untuk perhitungan SLA 30H
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingSummary = await prisma.uptimeDailySummary.findFirst({
        where: {
          applicationId: app.id,
          date: today,
        }
      });

      if (existingSummary) {
        // Hitung ulang persentase atau tambahkan data log harian
        const newTotalChecks = existingSummary.totalChecks + 1;
        const newUpChecks = existingSummary.upChecks + (isUp ? 1 : 0);
        const newUptimePercent = (newUpChecks / newTotalChecks) * 100;

        await prisma.uptimeDailySummary.update({
          where: { id: existingSummary.id },
          data: {
            totalChecks: newTotalChecks,
            upChecks: newUpChecks,
            uptimePercent: newUptimePercent,
          }
        });
      } else {
        await prisma.uptimeDailySummary.create({
          data: {
            applicationId: app.id,
            date: today,
            totalChecks: 1,
            upChecks: isUp ? 1 : 0,
            uptimePercent: isUp ? 100.0 : 0.0,
          }
        });
      }

      // 3. Jika aplikasi tiba-tiba offline, buat data Insiden otomatis (opsional)
      if (!isUp) {
        const activeIncident = await prisma.incident.findFirst({
          where: { applicationId: app.id, status: { not: "resolved" } }
        });

        if (!activeIncident) {
          await prisma.incident.create({
            data: {
              applicationId: app.id,
              departmentId: app.departmentId,
              title: `Layanan Gangguan Otomatis: ${app.name}`,
              severity: "CRITICAL",
              status: "OPEN",
              description: "Sistem pendeteksi otomatis mendeteksi URL tidak merespon (Timeout/Down).",
            }
          });
        }
      }
    }

    console.log("✅ Pemeriksaan uptime selesai.");
  } catch (err) {
    console.error("❌ Gagal menjalankan worker uptime:", err.message);
  }
}

// Fungsi untuk menjalankan worker setiap 30 detik
function startUptimeWorker() {
  setInterval(runUptimeCheck, 30 * 1000);
  console.log("🕒 Worker pemantau uptime berjalan setiap 30 detik.");
}

module.exports = { startUptimeWorker, runUptimeCheck };