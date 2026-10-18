const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// 1. Endpoint Uji Koneksi SMTP Email
router.post('/test-smtp', async (req, res) => {
  const { host, port, user, pass } = req.body;
  try {
    const start = Date.now();
    
    // Inisialisasi transporter email
    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port),
      secure: port === '465', // true jika port 465, false untuk 587/25
      auth: { user, pass }
    });

    // Verifikasi koneksi ke server Jabar Gov
    await transporter.verify();
    
    const latencyMs = Date.now() - start;
    res.json({ success: true, latencyMs, message: `SMTP Berhasil terhubung (${latencyMs}ms)` });
  } catch (error) {
    res.status(500).json({ success: false, latencyMs: 0, message: `SMTP Gagal: Akses Ditolak atau Timeout` });
  }
});

// 2. Endpoint Uji Koneksi Webhook Pusdatin
router.post('/test-webhook', async (req, res) => {
  const { url } = req.body;
  try {
    const start = Date.now();
    
    // Tembak URL tujuan dengan payload dummy
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'test_connection', message: 'Ping dari Sistem Monitoring APTIKA' })
    });

    const latencyMs = Date.now() - start;
    
    if (response.ok) {
      res.json({ success: true, latencyMs, message: `Webhook Merespons OK (${latencyMs}ms)` });
    } else {
      res.status(response.status).json({ success: false, latencyMs, message: `Webhook Error: Status ${response.status}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, latencyMs: 0, message: `Gagal menjangkau URL Webhook` });
  }
});

module.exports = router;