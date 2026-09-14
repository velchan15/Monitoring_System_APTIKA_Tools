const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright"); // Impor Playwright di sini
const authRoutes = require("./routes/auth.routes");
const userRoutes = require('./routes/user.routes');
const incidentRoutes = require('./routes/incidentRoutes');

function createApp({ readiness = async () => ({ database: "error", redis: "error" }) } = {}) {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', require('./routes/notification.routes'));

  const applicationRoutes = require('./routes/application.routes');
  app.use('/api/applications', applicationRoutes);

  app.use('/api/incidents', incidentRoutes);

  // ==========================================
  // ENDPOINT REAL-TIME SCREENSHOT PLAYWRIGHT
  // ==========================================
  app.get('/api/screenshot', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL diperlukan');

    let browser = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      const page = await context.newPage();
      
      await page.goto(targetUrl, { timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(1500);
      
      const buffer = await page.screenshot({ fullPage: false });
      await browser.close();

      res.set('Content-Type', 'image/png');
      res.send(buffer);
    } catch (error) {
      console.error("Gagal ambil screenshot:", error);
      if (browser) await browser.close();
      res.status(500).send('Gagal');
    }
  });
  // ==========================================

  // Health Check Endpoints
  app.get("/api/health/live", (_request, response) => {
    response.status(200).json({
      service: "monitoring-api",
      status: "ok",
    });
  });

  app.get("/api/health/ready", async (_request, response) => {
    const dependencies = await readiness();
    const isReady = dependencies.database === "ok" && dependencies.redis === "ok";

    response.status(isReady ? 200 : 503).json({
      dependencies,
      status: isReady ? "ok" : "error",
    });
  });

  // API Routes Tambahan
  app.use("/api/auth", authRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use('/api/incidents', incidentRoutes);

  // 404 Handler (Harus selalu di paling bawah setelah semua route)
  app.use((_request, response) => {
    response.status(404).json({
      error: "not_found",
      message: "Route tidak ditemukan.",
    });
  });

  // Jalankan background worker untuk memantau uptime aplikasi
  const { startUptimeWorker } = require("../workers/uptimeWorker");

  app.listen(3001, () => {
    console.log("Server backend berjalan di port 3001");
    startUptimeWorker();
  });

  return app;
}

module.exports = { createApp };