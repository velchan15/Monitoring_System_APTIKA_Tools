const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const cron = require('node-cron');

const prisma = new PrismaClient();

async function checkSemuaAplikasi() {
  console.log("Mulai mengecek status website secara real-time...");
  
  try {
    // 1. Ambil semua data aplikasi dari database
    const applications = await prisma.application.findMany();

    // 2. Cek satu per satu
    for (const app of applications) {
      if (!app.url) continue;

      try {
        // Coba akses websitenya (maksimal tunggu 10 detik)
        await axios.get(app.url, { timeout: 10000 });
        
        // Jika berhasil (website hidup), update status di database jadi ONLINE
        await prisma.application.update({
          where: { id: app.id },
          data: { status: 'ONLINE' }
        });
        console.log(`✅ [ONLINE] ${app.name}`);

      } catch (error) {
        // Jika gagal (seperti DNS error, timeout, web mati), update jadi OFFLINE
        await prisma.application.update({
          where: { id: app.id },
          data: { status: 'OFFLINE' }
        });
        console.log(`❌ [OFFLINE] ${app.name} - Mati!`);
      }
    }
    console.log("Pengecekan selesai! Menunggu jadwal berikutnya...");
  } catch (error) {
    console.error("Gagal mengambil data dari database:", error);
  }
}

// Menjalankan pengecekan setiap 1 menit secara otomatis
cron.schedule('* * * * *', () => {
  checkSemuaAplikasi();
});

console.log("Mesin Monitoring Aktif. Mengecek setiap 1 menit...");
// Jalankan langsung sekali saat file dihidupkan
checkSemuaAplikasi();