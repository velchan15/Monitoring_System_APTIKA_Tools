const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/notifications - Ambil daftar notifikasi (Include data Incident)
router.get('/', async (req, res) => {
  try {
    const notifs = await prisma.notification.findMany({
      include: { incident: true }, // Menarik relasi tabel Incident
      orderBy: { createdAt: 'desc' },
      take: 20 // Batasi 20 notifikasi terbaru agar tidak berat
    });

    // Format ulang agar sesuai dengan yang diharapkan Frontend
    const formatted = notifs.map(n => ({
      id: String(n.id),
      title: n.incident ? `${n.incident.appName}` : "Sistem Monitoring",
      message: n.message,
      severity: n.incident?.severity || "info",
      isRead: n.isRead,
      timestamp: new Date(n.createdAt).toLocaleString("id-ID", {
        day: "numeric", month: "short", year: "numeric", 
        hour: "2-digit", minute: "2-digit"
      }) + " WIB",
      targetUrl: "incidents" // Arahkan ke tab insiden jika diklik
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read - Tandai dibaca
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true }
      });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;