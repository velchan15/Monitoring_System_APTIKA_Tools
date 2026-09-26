const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Berapa hari MonitoringLog (dan Screenshot yang nempel di dalamnya) disimpan.
// Ubah lewat env var LOG_RETENTION_DAYS kalau perlu, default 7 hari.
const RETENTION_DAYS = Number(process.env.LOG_RETENTION_DAYS || 7);
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // cek tiap 6 jam

async function runCleanup() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  console.log(`🧹 [retentionWorker] Menghapus MonitoringLog sebelum ${cutoff.toISOString()}...`);

  try {
    // Screenshot punya onDelete: Cascade ke MonitoringLog di schema.prisma,
    // jadi cukup hapus MonitoringLog lama -> Screenshot terkait ikut terhapus otomatis.
    const deleted = await prisma.monitoringLog.deleteMany({
      where: { checkedAt: { lt: cutoff } },
    });
    console.log(`✅ [retentionWorker] Selesai — ${deleted.count} baris MonitoringLog (+ Screenshot terkait) dihapus.`);
  } catch (err) {
    console.error("❌ [retentionWorker] Gagal membersihkan data lama:", err.message);
  }
}

function startRetentionWorker() {
  console.log(`🕒 [retentionWorker] Retensi log ${RETENTION_DAYS} hari, cek tiap ${CLEANUP_INTERVAL_MS / 3600000} jam.`);
  runCleanup(); // jalan sekali di awal juga
  setInterval(runCleanup, CLEANUP_INTERVAL_MS);
}

module.exports = { startRetentionWorker, runCleanup };