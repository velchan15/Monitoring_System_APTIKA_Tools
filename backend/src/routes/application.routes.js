const express = require('express');
const router = express.Router();

// 1. KITA UBAH BAGIAN INI: Memanggil Prisma secara langsung dari library bawaannya
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { 
  getAllApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication 
} = require('../controllers/application.controller');

// ==========================================
// ENDPOINT KHUSUS BOT WHATSAPP
// ==========================================
router.get('/status-bot', async (req, res) => {
  try {
    console.log("Mencoba mengambil data aplikasi untuk bot...");
    
    const apps = await prisma.application.findMany({
      select: {
        name: true,  
        url: true,   
        status: true
      }
    });
    
    console.log(`Berhasil mengambil ${apps.length} data aplikasi!`);
    res.json(apps);

  } catch (error) {
    console.error("❌ Gagal mengambil data (Bot WA):", error.message);
    res.status(500).json({ 
        error: "Terjadi kesalahan pada server", 
        pesan_asli: error.message 
    });
  }
});

// ==========================================
// Definisi Endpoint CRUD Aplikasi
// ==========================================
router.get('/', getAllApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

module.exports = router;