const prisma = require('../src/db/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log("Membersihkan data lama untuk mencegah duplikat...");
  
  // Hapus data aplikasi dan user lama agar tidak menumpuk
  await prisma.application.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.monitoringNode.deleteMany({});

  console.log("Memasukkan data baru yang bersih...");

  // 1. Data Awal Roles
  await prisma.role.createMany({
    data: [
      { id: 1, name: 'ADMIN', description: 'Administrator Diskominfo' },
      { id: 2, name: 'OPERATOR_OPD', description: 'Operator Perangkat Daerah' },
      { id: 3, name: 'PIMPINAN', description: 'Akses Read-Only Pimpinan' },
    ],
  });

  // 2. Data Awal Department (OPD)
  await prisma.department.createMany({
    data: [
      { id: 1, code: 'DKI', name: 'Diskominfo' },
      { id: 2, code: 'DKES', name: 'Dinas Kesehatan' },
      { id: 3, code: 'DPEND', name: 'Dinas Pendidikan' },
    ],
  });

  // 3. Data Awal Monitoring Node
  await prisma.monitoringNode.createMany({
    data: [
      { id: 1, name: 'Node Utama Diskominfo', location: 'Data Center Diskominfo' },
    ],
  });

  // 4. Data Awal User Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Super Admin Diskominfo',
      email: 'admin@diskominfo.go.id',
      password: hashedPassword,
      roleId: 1,
      departmentId: 1,
    },
  });

  // 5. Data Awal Aplikasi / Website (TERMASUK APTIKA TOOLS)
  await prisma.application.createMany({
    data: [
      // Diskominfo (departmentId: 1)
      { name: 'Portal Provinsi Jawa Barat', url: 'https://jabarprov.go.id', monitoringType: 'HTTP', departmentId: 1 },
      { name: 'Sapa Warga', url: 'https://sapawarga.jabarprov.go.id', monitoringType: 'HTTP', departmentId: 1 },
      { name: 'Open Data Jabar', url: 'https://opendata.jabarprov.go.id', monitoringType: 'HTTP', departmentId: 1 },
      { name: 'Pikobar', url: 'https://pikobar.jabarprov.go.id', monitoringType: 'HTTP', departmentId: 1 },
      
      // Dinas Kesehatan (departmentId: 2)
      { name: 'Portal Dinkes Jabar', url: 'https://diskes.jabarprov.go.id', monitoringType: 'HTTP', departmentId: 2 },
      
      // Dinas Pendidikan (departmentId: 3)
      { name: 'PPDB Online Jabar', url: 'https://ppdb.jabarprov.go.id', monitoringType: 'HTTP', departmentId: 3 },
      { name: 'Dinas Pendidikan', url: 'http://dinasdikdin.bkn.go.id/', monitoringType: 'HTTP', departmentId: 3 },
    ],
  });

  console.log('Seeding ulang berhasil! Database bersih dari duplikat.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });