const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const incidentRoutes = require("./routes/incidentRoutes");
const applicationRoutes = require("./routes/application.routes");
const notificationRoutes = require("./routes/notification.routes");
const { chromium } = require("playwright");

// 1. Impor background workers di bagian atas file
const { startSslWorker } = require("../workers/sslWorker");
const { startUptimeWorker } = require("../workers/uptimeWorker");

// Folder public/screenshots ada di root project frontend (Next.js)
const SCREENSHOTS_ROOT = path.join(__dirname, "..", "..", "public", "screenshots");

function sanitizeSegment(value, fallback) {
  if (!value) return fallback;
  const cleaned = String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

function createApp({ readiness = async () => ({ database: "error", redis: "error" }) } = {}) {
  const app = express();

  // 2. Jalankan background workers sekali saja saat aplikasi di-init
  if (!global._workersStarted) {
    global._workersStarted = true;
    try {
      startSslWorker();
      startUptimeWorker();
      console.log("🚀 Background workers (SSL & Uptime) berhasil diinisialisasi.");
    } catch (err) {
      console.error("❌ Gagal memulai background workers:", err.message);
    }
  }

  app.use(express.json());
  app.use(cors());

  // ==========================================
  // API ROUTES
  // ==========================================
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/incidents", incidentRoutes);

  // ==========================================
  // ENDPOINT REAL-TIME SCREENSHOT PLAYWRIGHT
  // ==========================================
  app.get("/api/screenshot", async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("URL diperlukan");

    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.set("Pragma", "no-cache");

    const opdFolder = sanitizeSegment(req.query.opdCode, "misc");
    const fileName = sanitizeSegment(req.query.appName, "aplikasi") + ".webp";
    const targetDir = path.join(SCREENSHOTS_ROOT, opdFolder);
    const targetPath = path.join(targetDir, fileName);

    let browser = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      });
      const page = await context.newPage();

      const gotoResult = await page
        .goto(targetUrl, { timeout: 20000, waitUntil: "networkidle" })
        .catch((err) => {
          console.error(`Gagal membuka ${targetUrl}:`, err.message);
          return null;
        });

      if (!gotoResult) {
        console.warn(`⚠️ Navigasi ke ${targetUrl} gagal/timeout — screenshot mungkin blank.`);
      }

      await page.waitForTimeout(2000);

      const pngBuffer = await page.screenshot({ fullPage: false });
      await browser.close();
      browser = null;

      const webpBuffer = await sharp(pngBuffer).webp({ quality: 80 }).toBuffer();

      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetPath, webpBuffer);

      res.set("Content-Type", "image/webp");
      res.send(webpBuffer);
    } catch (error) {
      console.error("Gagal ambil screenshot:", error);
      if (browser) await browser.close();
      res.status(500).send("Gagal");
    }
  });

  // ==========================================
  // HEALTH CHECK ENDPOINTS
  // ==========================================
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

  // 404 Handler
  app.use((_request, response) => {
    response.status(404).json({
      error: "not_found",
      message: "Route tidak ditemukan.",
    });
  });

  return app;
}

module.exports = { createApp };