const tls = require("tls");
const { URL } = require("url");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const INTERVAL_MS = 6 * 60 * 60 * 1000; // Setiap 6 jam
const CONCURRENCY = 15; // Ditingkatkan sedikit agar 330 data lebih cepat selesai
const CHECK_TIMEOUT_MS = 10000; // Diperpanjang jadi 10 detik untuk server yang lambat

function checkCertificate(hostname, port) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname, // Penting untuk SNI
        rejectUnauthorized: false,
        timeout: CHECK_TIMEOUT_MS,
      },
      () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        socket.end();

        if (!cert || !cert.valid_to) {
          resolve({ error: "Sertifikat tidak valid atau tidak ditemukan" });
          return;
        }

        resolve({
          validTo: new Date(cert.valid_to),
          issuer: cert.issuer?.O || cert.issuer?.CN || "Tidak diketahui",
          protocol: protocol || null,
        });
      }
    );

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ error: "Timeout menghubungi server" });
    });

    socket.on("error", (err) => {
      resolve({ error: err.message });
    });
  });
}

// PERBAIKAN 1: Deteksi otomatis URL yang tidak pakai https:// dari Excel
function parseTarget(rawUrl) {
  try {
    let finalUrl = rawUrl.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    const u = new URL(finalUrl);
    // Tolak jika dipaksa http biasa tanpa enkripsi
    if (u.protocol !== "https:") return null; 
    
    return { hostname: u.hostname, port: u.port ? Number(u.port) : 443 };
  } catch {
    return null;
  }
}

async function checkOne(app) {
  if (!app.url) return;
  
  const target = parseTarget(app.url);
  if (!target) {
    console.warn(`  ⚠️  Skipped ${app.name}: Format URL tidak valid (${app.url})`);
    return;
  }

  const result = await checkCertificate(target.hostname, target.port);

  if (result.error) {
    console.warn(`  ⚠️  Failed ${app.name} (${target.hostname}): ${result.error}`);
    return;
  }

  try {
    await prisma.application.update({
      where: { id: app.id },
      data: {
        sslValidTo: result.validTo,
        sslIssuer: result.issuer,
        sslProtocol: result.protocol,
        sslCheckedAt: new Date(),
      },
    });

    const daysLeft = Math.round((result.validTo.getTime() - Date.now()) / 86400000);
    console.log(`  ✅ OK: ${app.name} -> ${result.issuer}, sisa ${daysLeft} hari`);
  } catch (dbErr) {
    console.error(`  ❌ Gagal update DB untuk ${app.name}:`, dbErr.message);
  }
}

async function runInChunks(items, size, worker) {
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    await Promise.all(chunk.map(worker));
  }
}

async function runSslCheck() {
  console.log("🔒 [sslWorker] Mulai cek sertifikat SSL seluruh aplikasi...");
  const startedAt = Date.now();
  try {
    // Ambil semua aplikasi aktif yang memiliki URL
    const apps = await prisma.application.findMany({ 
      where: { 
        isActive: true,
        url: { not: "" }
      } 
    });
    
    await runInChunks(apps, CONCURRENCY, checkOne);
    
    const duration = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`🎉 [sslWorker] Selesai — ${apps.length} URL diproses dalam ${duration} detik.`);
  } catch (err) {
    console.error("❌ [sslWorker] Gagal:", err.message);
  }
}

function startSslWorker() {
  console.log(`🕒 [sslWorker] Worker berjalan di background setiap ${INTERVAL_MS / 3600000} jam.`);
  runSslCheck();
  setInterval(runSslCheck, INTERVAL_MS);
}

// PERBAIKAN 2: Blok ini memungkinkan script dijalankan secara manual dari terminal
if (require.main === module) {
  runSslCheck().then(() => {
    console.log("Proses manual selesai. Mematikan script...");
    process.exit(0);
  });
}

module.exports = { startSslWorker, runSslCheck };