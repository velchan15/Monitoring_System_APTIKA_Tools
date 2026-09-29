const express = require('express');
const router = express.Router();
const { prisma } = require('../db/prisma'); 
const { 
  getAllApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication 
} = require('../controllers/application.controller');

// ==========================================
// ENDPOINT KHUSUS BOT WHATSAPP
// ==========================================
// Route ini harus di atas '/:id' agar tidak bentrok
router.get('/status-bot', async (req, res) => {
  try {
    // Sesuaikan 'application', 'name', 'url', dan 'status' dengan schema.prisma kamu
    const apps = await prisma.application.findMany({
      select: {
        name: true,  
        url: true,   
        status: true 
      }
    });
    
    res.json(apps);
  } catch (error) {
    console.error("Gagal mengambil data untuk bot WA:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
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