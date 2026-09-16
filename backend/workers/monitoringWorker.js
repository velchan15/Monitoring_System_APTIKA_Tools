const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SCREENSHOTS_ROOT = path.join(__dirname, "..", "..", "public", "screenshots");
const INTERVAL_MS = 60 * 1000;
const CONCURRENCY = 5;
const NAV_TIMEOUT_MS = 15000;
const CHROME_EXECUTABLE_PATH = process.env.CHROME_EXECUTABLE_PATH || undefined;

let browserInstance = null;
let isRunning = false;
let stopRequested = false;
let timeoutHandle = null;

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

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true, executablePath: CHROME_EXECUTABLE_PATH });
  }
  return browserInstance;
}

async function captureOne(app) {
  const opdFolder = sanitizeSegment(app.department?.code, "misc");
  const fileName = sanitizeSegment(app.name, `app-${app.id}`) + ".webp";
  const targetDir = path.join(SCREENSHOTS_ROOT, opdFolder);
  const targetPath = path.join(targetDir, fileName);
  const publicPath = `/screenshots/${opdFolder}/${fileName}`;

  const browser = await getBrowser();
  let context = null;
  try {
    context = await browser.newContext({ viewport: { width: 1280, height: 720 }, ignoreHTTPSErrors: true });
    const page = await context.newPage();

    await page
      .goto(app.url, { timeout: NAV_TIMEOUT_MS, waitUntil: "networkidle" })
      .catch((err) => console.warn(`  gagal buka ${app.name}: ${err.message}`));

    await page.waitForTimeout(1000);
    fs.mkdirSync(targetDir, { recursive: true });
    await page.screenshot({ path: targetPath, type: "webp", fullPage: false });

    // Kaitkan screenshot ini ke MonitoringLog terbaru aplikasi ini (dibuat oleh uptimeWorker)
    const latestLog = await prisma.monitoringLog.findFirst({
      where: { applicationId: app.id },
      orderBy: { checkedAt: "desc" },
    });

    if (latestLog) {
      await prisma.screenshot.create({
        data: { monitoringLogId: latestLog.id, filePath: publicPath },
      });
    } else {
      console.warn(`  ${app.name}: belum ada MonitoringLog, file disimpan tapi belum dicatat ke DB.`);
    }

    console.log(`  ok: ${app.name} -> ${publicPath}`);
  } catch (err) {
    console.error(`  gagal screenshot ${app.name}:`, err.message);
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

async function runInChunks(items, size, worker) {
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    await Promise.all(chunk.map(worker));
  }
}

async function runMonitoringBatch() {
  const startedAt = Date.now();
  try {
    const apps = await prisma.application.findMany({ where: { isActive: true }, include: { department: true } });
    const withUrl = apps.filter((a) => a.url);
    await runInChunks(withUrl, CONCURRENCY, captureOne);
    console.log(`selesai - ${withUrl.length} aplikasi, ${((Date.now() - startedAt) / 1000).toFixed(1)} detik`);
  } catch (err) {
    console.error("gagal batch:", err.message);
  }
}

async function loop() {
  if (stopRequested) return;
  if (isRunning) {
    timeoutHandle = setTimeout(loop, INTERVAL_MS);
    return;
  }
  isRunning = true;
  const startedAt = Date.now();
  await runMonitoringBatch();
  const elapsed = Date.now() - startedAt;
  isRunning = false;
  if (stopRequested) return;
  timeoutHandle = setTimeout(loop, Math.max(0, INTERVAL_MS - elapsed));
}

const INITIAL_DELAY_MS = 10 * 1000;

function startMonitoringWorker() {
  stopRequested = false;
  timeoutHandle = setTimeout(loop, INITIAL_DELAY_MS);
}

async function stopMonitoringWorker() {
  stopRequested = true;
  if (timeoutHandle) clearTimeout(timeoutHandle);
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}

module.exports = { startMonitoringWorker, stopMonitoringWorker, runMonitoringBatch };