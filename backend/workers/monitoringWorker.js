const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const targets = [
  { code: 'diskominfo', url: 'https://jabarprov.go.id', totalApps: 7 },
  { code: 'disdukcapil', url: 'https://disdukcapil.jabarprov.go.id', totalApps: 5 },
  { code: 'dinkes', url: 'https://simpus.dinkes.jabarprov.go.id', totalApps: 5 },
  { code: 'bapenda', url: 'https://bapenda.jabarprov.go.id', totalApps: 5 },
  { code: 'disdik', url: 'https://ppdb.disdik.jabarprov.go.id', totalApps: 5 },
  { code: 'dpmptsp', url: 'https://dpmptsp.jabarprov.go.id', totalApps: 4 },
  { code: 'bpkad', url: 'https://bpkad.jabarprov.go.id', totalApps: 4 },
  { code: 'bkd', url: 'https://bkd.jabarprov.go.id', totalApps: 4 },
];

const incidents = [
  { id: 'inc-01', code: 'disdukcapil', url: 'https://disdukcapil.jabarprov.go.id' },
  { id: 'inc-02', code: 'dinkes', url: 'https://simpus.dinkes.jabarprov.go.id' },
  { id: 'inc-03', code: 'diskominfo', url: 'https://ppid.jabarprov.go.id' },
  { id: 'inc-04', code: 'bapenda', url: 'https://bapenda.jabarprov.go.id/e-samsat' },
  { id: 'inc-05', code: 'bpkad', url: 'https://bpkad.jabarprov.go.id/sipd' },
];

async function runAutoScreenshotWorker() {
  console.log('🤖 Memulai robot Playwright untuk aplikasi & insiden dengan subfolder per OPD...');

  const baseUploadDir = path.join(__dirname, '../../public/screenshots');

  const browser = await chromium.launch({ 
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  // 1. Screenshot Aplikasi per OPD
  for (const target of targets) {
    const subDir = path.join(baseUploadDir, target.code);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    const page = await context.newPage();
    try {
      console.log(`🌐 Mengakses App OPD (${target.code}): ${target.url}`);
      await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      for (let i = 1; i <= target.totalApps; i++) {
        const fileName = `${target.code}-app-${i}.webp`;
        const filePath = path.join(subDir, fileName);
        
        await page.screenshot({ path: filePath, type: 'webp', fullPage: false });
        console.log(`✅ Berhasil menyimpan: screenshots/${target.code}/${fileName}`);
      }
    } catch (error) {
      console.error(`❌ Gagal mengambil screenshot untuk ${target.url}:`, error.message);
    } finally {
      await page.close();
    }
  }

  // 2. Screenshot Insiden (Masuk ke subfolder OPD masing-masing)
  for (const inc of incidents) {
    const subDir = path.join(baseUploadDir, inc.code);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    const page = await context.newPage();
    try {
      console.log(`🚨 Mengakses Insiden (${inc.id}): ${inc.url}`);
      await page.goto(inc.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const fileName = `${inc.id}.webp`;
      const filePath = path.join(subDir, fileName);
      
      await page.screenshot({ path: filePath, type: 'webp', fullPage: false });
      console.log(`✅ Berhasil menyimpan screenshot insiden: screenshots/${inc.code}/${fileName}`);
    } catch (error) {
      console.error(`❌ Gagal insiden ${inc.id}:`, error.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('✨ Selesai. Semua screenshot aplikasi dan insiden tersimpan rapi di subfolder masing-masing OPD.');
}

runAutoScreenshotWorker();