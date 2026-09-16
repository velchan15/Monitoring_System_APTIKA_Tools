// Jalankan dari folder backend:
//   node prisma/importApplications.js
//
// Aman dijalankan berkali-kali (idempotent) — aplikasi/departemen yang udah
// ada ga bakal diduplikasi, cuma yang belum ada aja yang ditambahin.

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const DATA_PATH = path.join(__dirname, "data", "applications-import.json");

// Sinkronin ulang sequence auto-increment PostgreSQL biar ga bentrok sama id
// yang mungkin pernah ditulis manual lewat seed sebelumnya (root cause dari
// error "Unique constraint failed on the fields: (`id`)").
async function resetSequence(tableName) {
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"${tableName}"', 'id'),
      COALESCE((SELECT MAX(id) FROM "${tableName}"), 1)
    );
  `);
}

async function getOrCreateDepartment(name, preferredCode) {
  let dept = await prisma.department.findFirst({ where: { name } });
  if (dept) return dept;

  let code = preferredCode;
  let suffix = 2;
  while (await prisma.department.findUnique({ where: { code } })) {
    code = `${preferredCode}-${suffix}`;
    suffix += 1;
  }

  dept = await prisma.department.create({ data: { name, code } });
  console.log(`  + Departemen baru: ${name} (${code})`);
  return dept;
}

async function main() {
  console.log("Menyinkronkan sequence id departments & applications...");
  await resetSequence("departments");
  await resetSequence("applications");

  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const records = JSON.parse(raw);
  console.log(`Membaca ${records.length} baris dari applications-import.json...\n`);

  const deptCache = new Map();

  let createdApps = 0;
  let skippedApps = 0;
  let createdDepts = 0;

  for (const record of records) {
    let dept = deptCache.get(record.departmentName);
    if (!dept) {
      const before = await prisma.department.count();
      dept = await getOrCreateDepartment(record.departmentName, record.departmentCode);
      const after = await prisma.department.count();
      if (after > before) createdDepts += 1;
      deptCache.set(record.departmentName, dept);
    }

    const existingApp = await prisma.application.findFirst({
      where: { name: record.name, departmentId: dept.id },
    });

    if (existingApp) {
      skippedApps += 1;
      continue;
    }

    await prisma.application.create({
      data: {
        name: record.name,
        url: record.url,
        departmentId: dept.id,
        monitoringType: "HTTP",
        priority: "MEDIUM",
        isActive: true,
        showOnStatusPage: true,
      },
    });
    createdApps += 1;
  }

  console.log("\n=== Selesai ===");
  console.log(`Departemen baru dibuat : ${createdDepts}`);
  console.log(`Aplikasi baru dibuat   : ${createdApps}`);
  console.log(`Aplikasi dilewati (udah ada) : ${skippedApps}`);
}

main()
  .catch((err) => {
    console.error("Gagal import:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });