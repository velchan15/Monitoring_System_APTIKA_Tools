const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const cron = require('node-cron');

const prisma = new PrismaClient();

async function checkSemuaAplikasi() {
  console.log("Mulai mengecek status website secara real-time...");
  
  try {
    const applications = await prisma.application.findMany();
    
    // Siapkan wadah (array) kosong untuk menampung aplikasi yang baru saja mati
    let aplikasiBaruDown = [];

    // Cek satu per satu
    for (const app of applications) {
      if (!app.url) continue;

      try {
        await axios.get(app.url, { timeout: 10000 });
        
        // JIKA BERHASIL (Hidup)
        if (app.status !== 'ONLINE') {
          await prisma.application.update({
            where: { id: app.id },
            data: { status: 'ONLINE' }
          });
        }
        console.log(`✅ [ONLINE] ${app.name}`);

      } catch (error) {
        // JIKA GAGAL (Mati)
        if (app.status !== 'OFFLINE') {
          await prisma.application.update({
            where: { id: app.id },
            data: { status: 'OFFLINE' }
          });
          
          // Jangan langsung kirim WA! Masukkan dulu datanya ke wadah array
          aplikasiBaruDown.push(app);
        }
        console.log(`❌ [OFFLINE] ${app.name} - Mati!`);
      }
    }

    // ==========================================
    // LOGIKA PENGIRIMAN PESAN REKAP / GABUNGAN
    // ==========================================
    if (aplikasiBaruDown.length > 0) {
      // Mendapatkan waktu dengan format jam.menit.detik
      const waktuSekarang = new Date().toLocaleTimeString('id-ID', { hour12: false }).replace(/:/g, '.');
      
      // Mengikuti format persis seperti di screenshot
      let pesanWA = `🚨 PERINGATAN SISTEM! [${waktuSekarang}] 🚨\n\n`;
      pesanWA += `Terdapat ${aplikasiBaruDown.length} aplikasi yang terdeteksi DOWN:\n\n`;
      
      // Susun daftar aplikasinya ke dalam teks (1 baris per aplikasi)
      aplikasiBaruDown.forEach((app, index) => {
        pesanWA += `${index + 1}. ${app.name} (URL: ${app.url})\n`;
      });

      // Kirim satu pesan WA yang berisi rekap semua aplikasi down
      await axios.post('http://localhost:3005/api/send-wa', {
        nomor: '6282315517254', 
        pesan: pesanWA
      });
      
      console.log(`[WA] 1 Pesan rekap berisi ${aplikasiBaruDown.length} aplikasi down berhasil dikirim!`);
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