const prisma = require('../src/db/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  // Data Awal Roles
  await prisma.role.createMany({
    data: [
      { id: 1, name: 'ADMIN', description: 'Administrator Diskominfo' },
      { id: 2, name: 'OPERATOR_OPD', description: 'Operator Perangkat Daerah' },
      { id: 3, name: 'PIMPINAN', description: 'Akses Read-Only Pimpinan' },
    ],
    skipDuplicates: true,
  });

  // Data Awal Department (OPD) dengan 'code'
  await prisma.department.createMany({
    data: [
      { id: 1, code: 'DKI', name: 'Diskominfo' },
      { id: 2, code: 'DKES', name: 'Dinas Kesehatan' },
      { id: 3, code: 'DPEND', name: 'Dinas Pendidikan' },
    ],
    skipDuplicates: true,
  });

  // Data Awal Monitoring Node
  await prisma.monitoringNode.createMany({
    data: [
      { id: 1, name: 'Node Utama Diskominfo', location: 'Data Center Diskominfo' },
    ],
    skipDuplicates: true,
  });

  // Data Awal User Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@diskominfo.go.id' },
    update: {},
    create: {
      name: 'Super Admin Diskominfo',
      email: 'admin@diskominfo.go.id',
      password: hashedPassword,
      roleId: 1,
      departmentId: 1,
    },
  });

  console.log('Seeding berhasil!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });