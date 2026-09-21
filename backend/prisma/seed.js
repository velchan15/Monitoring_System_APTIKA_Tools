const prisma = require('../src/db/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log("Membersihkan data lama untuk mencegah duplikat...");
  
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

  // 2. Data Awal Monitoring Node
  await prisma.monitoringNode.createMany({
    data: [
      { id: 1, name: 'Node Utama Diskominfo', location: 'Data Center Diskominfo' },
    ],
  });

  // 3. Data Awal User Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Super Admin Diskominfo',
      email: 'admin@diskominfo.go.id',
      password: hashedPassword,
      roleId: 1,
    },
  });

  // 4. Daftar Aplikasi Langsung dari File Excel Provinsi Jabar
  const rawApps = [
    {
      "name": "Aplikasi OSS DLH Jabar",
      "url": "https://oss-dlh.jabarprov.go.id/",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Website PSTR Jabar",
      "url": "https://pstr-jabar.jabarprov.go.id/",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Website CDK Wilayah V",
      "url": "https://cdkwilv.jabarprov.go.id/",
      "departmentName": "Dinas Kehutanan",
      "departmentCode": "dishut"
    },
    {
      "name": "Sistem Informasi Tenaga Keolahragaan",
      "url": "https://dispora-cmd.jabarprov.go.id/sitenor",
      "departmentName": "Dinas Pemuda dan Olahraga",
      "departmentCode": "dispora"
    },
    {
      "name": "DIBA PKLK",
      "url": "https://dibapklk.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Pusaka Jabar",
      "url": "https://pusaka.jabarprov.go.id",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "West Java Youth Innovation Platform (WJYIP)",
      "url": "https://youthinnovation.jabarprov.go.id/",
      "departmentName": "Dinas Pemuda dan Olahraga",
      "departmentCode": "dispora"
    },
    {
      "name": "Dashboard Satu Data DPMPTSP",
      "url": "https://dpmptsp-satudata.jabarprov.go.id",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "SPMB Sekolah Maung",
      "url": "https://maung-spmb.jabaprprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Rancage",
      "url": "https://rancage.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Organisasi",
      "departmentCode": "setda-organisasi"
    },
    {
      "name": "Sistem Kemitraan Investasi (SI KERTAS)",
      "url": "https://sikertas.jabarprov.go.id",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "CEKLIST (Cek Laboratorium Informasi Sistem Tes)",
      "url": "https://play.google.com/store/apps/details?id=com.dinkes2.labkesda.labkesda",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Siparbud",
      "url": "https://siparbud.jabarprov.go.id",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "SiAjip",
      "url": "https://siajip.jabarprov.go.id",
      "departmentName": "Dinas Ketahanan Pangan dan Peternakan",
      "departmentCode": "dkpp"
    },
    {
      "name": "Maspesulap",
      "url": "https://maspesulap.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "SIPELIKAN (Sistem Pelaporan dan Pembinaan Mutu Pengolahan Ikan)",
      "url": "https://silaing.jabarprov.go.id/sipelikan",
      "departmentName": "Dinas Kelautan dan Perikanan",
      "departmentCode": "dkp"
    },
    {
      "name": "Agenda",
      "url": "https://agendabpbd.jabarprov.go.id",
      "departmentName": "Badan Penanggulangan Bencana Daerah",
      "departmentCode": "bpbd"
    },
    {
      "name": "E-PKP Jawa Barat",
      "url": "https://app-diskes.jabarprov.go.id/epkp/admin/login",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "SIMRS Klinik Utama Grha Atma",
      "url": "https://kugrhaatma.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "SIMRS RS JIWA",
      "url": "https://rsjiwajabar.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website Taman Hutan Raya Ir. H. Djuanda",
      "url": "https://tahuradjuanda.jabarprov.go.id",
      "departmentName": "Dinas Kehutanan",
      "departmentCode": "dishut"
    },
    {
      "name": "Sistem Informasi Monitoring Kunjungan Lembur Pakuan",
      "url": "https://balepananggeuhan.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Dashboard Visualisasi Elektrifikasi",
      "url": "https://sinatria.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Sistem Informasi Monitoring (Dashboard) Registrasi Genset dan PLTS Atap",
      "url": "https://pranata.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Sistem Informasi Monitoring Pemeliharaan Infrastruktur Jalan",
      "url": "https://kancana.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Sistem Informasi Monitoring (Dashboard) Risiko Longsor Tambang",
      "url": "https://sawangan.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Dashboard Visualisasi Pemetaan Air Tanah dan Galian Tambang",
      "url": "https://sigantar.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Sistem Informasi Monitoring (Dashboard) Ketersediaan Ruang Kelas dan Ruang Kelas Baru",
      "url": "https://panceg.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Sistem Informasi Monitoring (Dashboard) Risiko Banjir",
      "url": "https://moncaah.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Nyari Gawe",
      "url": "https://nyarigawe.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Sikeling",
      "url": "https://sikeling.jabarprov.go.id",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Teman On Air (Sistem Palayanan Online Ayam Sentul dan Itik Rambon)",
      "url": "https://temanonair.jabarprov.go.id",
      "departmentName": "Dinas Ketahanan Pangan dan Peternakan",
      "departmentCode": "dkpp"
    },
    {
      "name": "Website Unit Pelaksana Teknis Dinas Pengelolaan Kebudayaan Daerah Jawa Barat",
      "url": "https://jagabudaya.jabarprov.go.id",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "OSS Perbendaharaan",
      "url": "https://ossperbend.jabarprov.go.id",
      "departmentName": "Badan Pengelolaan Keuangan dan Aset Daerah",
      "departmentCode": "bpkad"
    },
    {
      "name": "SIDIA",
      "url": "https://sidia.jabarprov.go.id",
      "departmentName": "Badan Pengelolaan Keuangan dan Aset Daerah",
      "departmentCode": "bpkad"
    },
    {
      "name": "Aplikasi Konservasi Dan Wisata (GO-TURTLE)",
      "url": "https://go-turtle.jabarprov.go.id",
      "departmentName": "Dinas Kelautan dan Perikanan",
      "departmentCode": "dkp"
    },
    {
      "name": "SISTEM INFORMASI DIGITALISASI KEARSIPAN DINAMIS (SIDIK)",
      "url": "https://sidik.jabarprov.go.id",
      "departmentName": "Dinas Perpustakaan dan Kearsipan Daerah",
      "departmentCode": "disperpusip"
    },
    {
      "name": "Website Resmi Dewan Kerajinan Nasional Daerah Provinsi Jawa Barat",
      "url": "https://dekranasda.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website Balai Perlindungan Perkebunan",
      "url": "https://balinbun.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Website Rumah Sakit Paru Jawa Barat",
      "url": "https://rsp.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website BKD",
      "url": "https://bkd.jabarprov.go.id",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi eTalent",
      "url": "https://bkd.jabarprov.go.id/etalentjabar",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Rekomendasi Pegawai",
      "url": "https://bkd.jabarprov.go.id/rekomendasi",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Fasilitasi Kebutuhan Kesekretariatan Dinas",
      "url": "https://bkd.jabarprov.go.id/esekretariat",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Center Of Excellence",
      "url": "https://bkd.jabarprov.go.id/centerofexcellence",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Talent Pool SimJawara",
      "url": "https://bkd.jabarprov.go.id/talent-pool/login?redirectTo=/talent-box",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Kinerja Jabar",
      "url": "https://kinerja.jabarprov.go.id/kinerjajabar/login",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Kinerja EOTM",
      "url": "https://kinerja.jabarprov.go.id/employee-of-the-month/",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Kinerja EOTM Kuisioner",
      "url": "https://kinerja.jabarprov.go.id/employee-of-the-month/kuisioner/",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Penghargaan",
      "url": "https://kinerja.jabarprov.go.id/penghargaan",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Sistem Informasi Manajemen Tunjangan (SIMTUNJANGAN)",
      "url": "https://kinerja.jabarprov.go.id/simtunjangan",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Informasi Pegawai Inaktif",
      "url": "https://kinerja.jabarprov.go.id/dashboard/inaktif",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Kinerja Banding",
      "url": "https://kinerja.jabarprov.go.id/employee-of-the-month/banding",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Dashboard Kinerja Jabar",
      "url": "https://kinerja.jabarprov.go.id/dashboard/login",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Presensi ASN Jabar",
      "url": "https://kmob.jabarprov.go.id",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Online Assessment Center (ASMARA)",
      "url": "https://oac.jabarprov.go.id/login",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Pengusulan TPK",
      "url": "https://peerreview.jabarprov.go.id/tpk",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Sistem Informasi Manajemen Talenta ASN Jawa Barat (SIM JAWARA)",
      "url": "https://kinerja.jabarprov.go.id/simjawara/login",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Sistem Informasi Aparatur Pemerintah (SIAp) Jawa Barat",
      "url": "https://siap.jabarprov.go.id",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Pendidikan Lanjutan (DILAN)",
      "url": "https://siap.jabarprov.go.id/dilan",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Sistem Informasi Layanan Administrasi Jabatan Fungsional (JFT)",
      "url": "https://siap.jabarprov.go.id/jft",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi ePangkat (KEPIN)",
      "url": "https://siap.jabarprov.go.id/kepin",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Kenaikan Gaji Berkala (KGB)",
      "url": "https://siap.jabarprov.go.id/kgb/dashboard",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Pensiun",
      "url": "https://siap.jabarprov.go.id/p/home",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Generate TTE QR (QRCODE)",
      "url": "https://siap.jabarprov.go.id/qrcode",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Redistribusi Pelaksana",
      "url": "https://siap.jabarprov.go.id/rs",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Sistem Informasi Pengembangan dan Pemantauan Kompetensi Pegawai (SIBANGKOM)",
      "url": "https://siap.jabarprov.go.id/sibangkom",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi eMutasi",
      "url": "https://siap.jabarprov.go.id/salaman/",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Kontroling Displin ASN",
      "url": "https://siap.jabarprov.go.id/sistem-disiplin/home",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi eFormasi",
      "url": "https://siap.jabarprov.go.id/eformasi",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Perbaikan Surat Keputusan (SK)",
      "url": "https://siap.jabarprov.go.id/perbaikan-sk/home",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Sistem Informasi Perangkat Daerah Redistribusi",
      "url": "https://siap.jabarprov.go.id/rf",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Aplikasi Jabar Smart ASN",
      "url": "https://smartasn.jabarprov.go.id",
      "departmentName": "Badan Kepegawaian Daerah",
      "departmentCode": "bkd"
    },
    {
      "name": "Portal Data Kesbangpol Jabar (SIMBAKESBANGPOL)",
      "url": "https://simbakesbangpol.jabarprov.go.id",
      "departmentName": "Badan Kesatuan Bangsa dan Politik",
      "departmentCode": "kesbangpol"
    },
    {
      "name": "DRAKOR",
      "url": "https://drakor.jabarprov.go.id",
      "departmentName": "Badan Kesatuan Bangsa dan Politik",
      "departmentCode": "kesbangpol"
    },
    {
      "name": "Sistem Informasi Kondisi Daerah (SIKONDA)",
      "url": "https://sikonda.jabarprov.go.id",
      "departmentName": "Badan Kesatuan Bangsa dan Politik",
      "departmentCode": "kesbangpol"
    },
    {
      "name": "Sistem Informasi Ormas Juara (SIMAJU)",
      "url": "https://simaju.jabarprov.go.id",
      "departmentName": "Badan Kesatuan Bangsa dan Politik",
      "departmentCode": "kesbangpol"
    },
    {
      "name": "Website BAKESBANGPOL",
      "url": "https://bakesbangpol.jabarprov.go.id",
      "departmentName": "Badan Kesatuan Bangsa dan Politik",
      "departmentCode": "kesbangpol"
    },
    {
      "name": "Aplikasi kebencanaan untuk mengelola data bencana dari masing-masing kabupaten/Kota (BARATA)",
      "url": "https://barata.jabarprov.go.id",
      "departmentName": "Badan Penanggulangan Bencana Daerah",
      "departmentCode": "bpbd"
    },
    {
      "name": "Website BPBD",
      "url": "https://bpbd.jabarprov.go.id",
      "departmentName": "Badan Penanggulangan Bencana Daerah",
      "departmentCode": "bpbd"
    },
    {
      "name": "Sistem Informasi Pendataan dan Pemetaan Rawan Kebakaran di Jawa Barat",
      "url": "https://damkar.jabarprov.go.id",
      "departmentName": "Badan Penanggulangan Bencana Daerah",
      "departmentCode": "bpbd"
    },
    {
      "name": "Aplikasi Elektronik Logistik untuk Bencana (eLuna)",
      "url": "https://e-luna.jabarprov.go.id",
      "departmentName": "Badan Penanggulangan Bencana Daerah",
      "departmentCode": "bpbd"
    },
    {
      "name": "Website BAPENDA",
      "url": "https://bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Networ Monitoring System BAPENDA",
      "url": "https://nms.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Telusur Objek dan Subjek Pajak Kendaraan Bermotor (ATOS PAMOR)",
      "url": "https://atospamor-v2.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Samsat Mobile Jawa Barat (NEW-SAMBARA)",
      "url": "https://sambara-v2.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Sistem Informasi Pendapatan Terpadu Jawa Barat (SIPANDU JAWARA)",
      "url": "https://sipandu-jawara.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Reservasi Pembayaran Pajak 5 Tahunan",
      "url": "https://reservasi.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Pengajuan Lepas Kepemilikan KBM",
      "url": "https://lepaskepemilikan.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Tanda Bukti Pelunasan Kewajiban Pembayaran (eTBPKP)",
      "url": "https://etbpkp.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Apliksi Survey Kepuasan Masyarakat (SKM) BAPENDA",
      "url": "https://skm.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Sistem Informasi Geopasial Samsat (SInGsat)",
      "url": "https://singsat.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Bapenda Executive Smart Monitoring",
      "url": "https://bestrong.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "API Integrasi",
      "url": "https://integrasi.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Penghapusan Data Pajak Kendaraan Bermotor",
      "url": "https://penghapusan.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Pajak Alat Berat (PAB)",
      "url": "https://pab.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Pameran BAPENDA",
      "url": "https://pameran.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Service Monitoring System (SMS)",
      "url": "https://sms.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Sistem Pajak Kendaraan Terintegrasi Jawa Barat (SAKTI JAWARA)",
      "url": "https://api-sakti.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Server and Network Monitoring System (SENTOS)",
      "url": "https://sentos.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Samsat Elektronik Tiket (SAETIK)",
      "url": "https://saetik.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi eBook",
      "url": "https://ebook.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Sistem Riset dan Inovasi Jawa Barat (Sinobar)",
      "url": "https://sinobar.jabarprov.go.id",
      "departmentName": "Badan Penelitian dan Pengembangan Daerah",
      "departmentCode": "bp2d"
    },
    {
      "name": "Aplikasi Verifikasi Keuangan",
      "url": "https://verifikasi.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Penyimpanan Data BAPENDA",
      "url": "https://webcloud.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Aplikasi Gitlab BAPENDA",
      "url": "https://gitbpd.bapenda.jabarprov.go.id",
      "departmentName": "Badan Pendapatan Daerah",
      "departmentCode": "bapenda"
    },
    {
      "name": "Website Profil BP2D",
      "url": "https://bp2d.jabarprov.go.id",
      "departmentName": "Badan Penelitian dan Pengembangan Daerah",
      "departmentCode": "bp2d"
    },
    {
      "name": "Aplikasi Creative Research Journal (CR Journal)",
      "url": "https://crjournal.jabarprov.go.id",
      "departmentName": "Badan Penelitian dan Pengembangan Daerah",
      "departmentCode": "bp2d"
    },
    {
      "name": "Website BPKAD",
      "url": "https://bpkad.jabarprov.go.id",
      "departmentName": "Badan Pengelolaan Keuangan dan Aset Daerah",
      "departmentCode": "bpkad"
    },
    {
      "name": "Aplikasi Penghitungan Gaji dan Tunjangan (SiJITU)",
      "url": "https://gaji.jabarprov.go.id",
      "departmentName": "Badan Pengelolaan Keuangan dan Aset Daerah",
      "departmentCode": "bpkad"
    },
    {
      "name": "Sistem Informasi Manajemen Aset Daerah (SIMADA)",
      "url": "https://simada.jabarprov.go.id",
      "departmentName": "Badan Pengelolaan Keuangan dan Aset Daerah",
      "departmentCode": "bpkad"
    },
    {
      "name": "Sistem Informasi Manajemen Aset (SINGSET)",
      "url": "https://singset.jabarprov.go.id",
      "departmentName": "Badan Pengelolaan Keuangan dan Aset Daerah",
      "departmentCode": "bpkad"
    },
    {
      "name": "Sistem Informasi Pemerintah Daerah Provinsi Jawa Barat",
      "url": "https://sipd.jabarprov.go.id",
      "departmentName": "Badan Pengelolaan Keuangan dan Aset Daerah",
      "departmentCode": "bpkad"
    },
    {
      "name": "Website Bantuan Keuangan (SIMBA)",
      "url": "https://simba.jabarprov.go.id",
      "departmentName": "Badan Pengelolaan Keuangan dan Aset Daerah",
      "departmentCode": "bpkad"
    },
    {
      "name": "Website BPSDM",
      "url": "https://bpsdm.jabarprov.go.id",
      "departmentName": "Badan Pengembangan Sumber Daya Manusia",
      "departmentCode": "bpsdm"
    },
    {
      "name": "Aplikasi Jurnal Inspirasi",
      "url": "https://inspirasi.jabarprov.go.id",
      "departmentName": "Badan Pengembangan Sumber Daya Manusia",
      "departmentCode": "bpsdm"
    },
    {
      "name": "Integral Tech BPSDM",
      "url": "https://integral-bpsdm.jabarprov.go.id",
      "departmentName": "Badan Pengembangan Sumber Daya Manusia",
      "departmentCode": "bpsdm"
    },
    {
      "name": "Aplikasi Jabar Corpu Tallent",
      "url": "https://jabarcorputalent.jabarprov.go.id",
      "departmentName": "Badan Pengembangan Sumber Daya Manusia",
      "departmentCode": "bpsdm"
    },
    {
      "name": "Website BANHUB",
      "url": "https://badanpenghubung.jabarprov.go.id",
      "departmentName": "Badan Penghubung",
      "departmentCode": "banhub"
    },
    {
      "name": "Website BAPPEDA",
      "url": "https://bappeda.jabarprov.go.id",
      "departmentName": "Badan Perencanaan Pembangunan Daerah",
      "departmentCode": "bappeda"
    },
    {
      "name": "Website Corporate Social Responsibility",
      "url": "https://csr.jabarprov.go.id",
      "departmentName": "Badan Perencanaan Pembangunan Daerah",
      "departmentCode": "bappeda"
    },
    {
      "name": "Sistem Informasi Monitoring dan Evaluasi PEMDA Jabar (E-Monev)",
      "url": "https://e-monev.jabarprov.go.id",
      "departmentName": "Badan Perencanaan Pembangunan Daerah",
      "departmentCode": "bappeda"
    },
    {
      "name": "Website DBMTR",
      "url": "https://dbmpr.jabarprov.go.id",
      "departmentName": "Dinas Bina Marga dan Penataan Ruang",
      "departmentCode": "dbmpr"
    },
    {
      "name": "Sistem Informasi Jalan dan Jembatan (Teman Jabar)",
      "url": "https://temanjabar.jabarprov.go.id",
      "departmentName": "Dinas Bina Marga dan Penataan Ruang",
      "departmentCode": "dbmpr"
    },
    {
      "name": "Website Penataan Ruang Berbasis GIS Provinsi Jawa Barat (WARGI JABAR)",
      "url": "https://wargi.jabarprov.go.id",
      "departmentName": "Dinas Bina Marga dan Penataan Ruang",
      "departmentCode": "dbmpr"
    },
    {
      "name": "ESDM - One Stop Monitoring System",
      "url": "https://eosmosys.jabarprov.go.id",
      "departmentName": "Dinas Energi dan Sumber Daya Mineral",
      "departmentCode": "esdm"
    },
    {
      "name": "Website ESDM",
      "url": "https://esdm.jabarprov.go.id",
      "departmentName": "Dinas Energi dan Sumber Daya Mineral",
      "departmentCode": "esdm"
    },
    {
      "name": "Sistem Informasi Monitoring Jabar Caang (SIMOJANG)",
      "url": "https://simojang.jabarprov.go.id",
      "departmentName": "Dinas Energi dan Sumber Daya Mineral",
      "departmentCode": "esdm"
    },
    {
      "name": "Website DISHUT",
      "url": "https://dishut.jabarprov.go.id",
      "departmentName": "Dinas Kehutanan",
      "departmentCode": "dishut"
    },
    {
      "name": "Sistem Informasi Pemantauan, Penanaman, dan Pemeliharaan Bibit (SIMANTAP)",
      "url": "https://simantap.jabarprov.go.id",
      "departmentName": "Dinas Kehutanan",
      "departmentCode": "dishut"
    },
    {
      "name": "Sistem Informasi Pemantauan Kontribusi Bibit (Si Mantri Bibit)",
      "url": "https://simantribibit.jabarprov.go.id",
      "departmentName": "Dinas Kehutanan",
      "departmentCode": "dishut"
    },
    {
      "name": "Sistem Informasi Geospasial Pemanfaatan Hutan (SINGMANFAAT)",
      "url": "https://singmanfaat.jabarprov.go.id",
      "departmentName": "Dinas Kehutanan",
      "departmentCode": "dishut"
    },
    {
      "name": "Website UPTD Pelayanan Pengolahan Hasil Hutan (P2HH)",
      "url": "https://p2hh-dishut.jabarprov.go.id",
      "departmentName": "Dinas Kehutanan",
      "departmentCode": "dishut"
    },
    {
      "name": "Website UPTDSPTH",
      "url": "https://uptdspth-dishut.jabarprov.go.id",
      "departmentName": "Dinas Kehutanan",
      "departmentCode": "dishut"
    },
    {
      "name": "Website DKP",
      "url": "https://dkp.jabarprov.go.id",
      "departmentName": "Dinas Kelautan dan Perikanan",
      "departmentCode": "dkp"
    },
    {
      "name": "Website DISDUKCAPIL",
      "url": "https://disdukcapil.jabarprov.go.id",
      "departmentName": "Dinas Kependudukan dan Pencatatan Sipil",
      "departmentCode": "disdukcapil"
    },
    {
      "name": "Sistem Informasi Data Kependudukan (SIDATUK)",
      "url": "https://sidatukdukcapil.jabarprov.go.id",
      "departmentName": "Dinas Kependudukan dan Pencatatan Sipil",
      "departmentCode": "disdukcapil"
    },
    {
      "name": "Aplikasi Absensi Non ASN DISKES",
      "url": "https://absen-diskes.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Landing Page DINKES",
      "url": "https://app-diskes.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Aplikasi eLogistic",
      "url": "https://app-diskes.jabarprov.go.id/elogistic",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Aplikasi Kefarmasian dan Alkes (EMOSI)",
      "url": "https://app-diskes.jabarprov.go.id/emosi/app",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Sistem Informasi Jaminan Kesehatan(SiJantan)",
      "url": "https://sijantan.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Silayung (Sistem Informasi Layanan Unggulan (SILAYUNG)",
      "url": "https://app-diskes.jabarprov.go.id/silayung",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Aplikasi Absensi DISKES",
      "url": "https://app-diskes.jabarprov.go.id/absensi/login",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website Rumah Sakit Jiwa Jawa Barat",
      "url": "https://rsj.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website DISKES",
      "url": "https://diskes.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website Laboratorium Kesehatan (LABKES)",
      "url": "https://labkes.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Aplikasi Pendaftaran RSUD Kesehatan Kerja (RSKK)",
      "url": "https://pendaftaranrskk.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website PPID DINKES",
      "url": "https://ppid-diskes.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website RSUD WELASASIH",
      "url": "https://rsudwelasasih.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website RSUD Jampang Kulon",
      "url": "https://rsudjampangkulon.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website RSUD Kesehatan Kerja",
      "url": "https://rsudkk.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Aplikasi eProfil Kesehatan",
      "url": "https://sadata-diskes.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Sistem Informasi Manajemen Rumah Sakit Kesehatan Kerja (SIMRSKK)",
      "url": "https://simrskk.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Sistem Uji Profisiensi",
      "url": "https://ujiprof-labkes.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Aplikasi Siidola",
      "url": "https://siidola-diskes.jabarprov.go.id/siidola/",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website RSUD Pameungpeuk",
      "url": "https://rsudpameungpeuk.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Website BAVET",
      "url": "https://bavet.jabarprov.go.id",
      "departmentName": "Dinas Ketahanan Pangan dan Peternakan",
      "departmentCode": "dkpp"
    },
    {
      "name": "Website DKPP",
      "url": "https://dkpp.jabarprov.go.id",
      "departmentName": "Dinas Ketahanan Pangan dan Peternakan",
      "departmentCode": "dkpp"
    },
    {
      "name": "SERASI (Sistem Rekording Sapi Perah Terintegrasi)",
      "url": "https://serasi.jabarprov.go.id",
      "departmentName": "Dinas Ketahanan Pangan dan Peternakan",
      "departmentCode": "dkpp"
    },
    {
      "name": "Sistem Informasi dan Kontrol Sapi Perah (SIKASEP) Bunikasih",
      "url": "https://sikasepbunikasih.jabarprov.go.id",
      "departmentName": "Dinas Ketahanan Pangan dan Peternakan",
      "departmentCode": "dkpp"
    },
    {
      "name": "Sistem Informasi Administrasi Pelatihan Peternakan dan Ketahanan Pangan (SIMAPAN)",
      "url": "https://simapan.jabarprov.go.id",
      "departmentName": "Dinas Ketahanan Pangan dan Peternakan",
      "departmentCode": "dkpp"
    },
    {
      "name": "Sistem Early Warning Pangan dan Gizi (SIMAWASPAGI)",
      "url": "https://simawas.jabarprov.go.id",
      "departmentName": "Dinas Ketahanan Pangan dan Peternakan",
      "departmentCode": "dkpp"
    },
    {
      "name": "Aplikasi ArcGIS Jabar",
      "url": "https://arcgis.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website Jabar Computer Security Incident Response Team (CSIRT)",
      "url": "https://csirt.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Tepas Jabar (Dashboard Jabar (Aplikasi Citizen Dashboard Jawa Barat))",
      "url": "https://tepas.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Ekosistem Data Jawa Barat",
      "url": "https://data.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Desa Digital",
      "url": "https://desadigital.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Digital Academy",
      "url": "https://digitalacademy.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website Jabar Digital Service (JDS)",
      "url": "https://digitalservice.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website DISKOMINFO",
      "url": "https://diskominfo.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Drive Jabar",
      "url": "https://drive.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Mail Jabar",
      "url": "https://email.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Geonetwork (Geoserver)",
      "url": "https://geonetwork.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Global Protect",
      "url": "https://globalprotect.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Hosting CPanel",
      "url": "https://hosting-cpanel.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi ITSO Diskominfo",
      "url": "https://itsodiskominfo.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Gapura Jabar",
      "url": "https://jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Portal Katalog Aplikasi Jabar",
      "url": "https://katalaps.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website Komisi Informasi",
      "url": "https://komisiinformasi.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website KPID",
      "url": "https://kpidaerah.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi BolaAPI",
      "url": "http://10.200.26.24/",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Masjid Raya AlJabbar",
      "url": "https://masjidraya-aljabbar.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Password Kredential",
      "url": "https://password.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website PPID Jawa Barat",
      "url": "https://ppid.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Repository Jabar",
      "url": "https://repo.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Jendela Informasi Jabar (Saber Hoaks)",
      "url": "https://saberhoaks.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Satu Data Keluarga Jawa Barat (SADARKA)",
      "url": "https://sadarkajabar.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Sapawarga",
      "url": "https://play.google.com/store/apps/details?id=com.sapawarga.jdshttps://apps.apple.com/id/app/sapawarga-jabar-super-apps/id6443805562?l=id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website Satu Peta Jawa Barat Sapeta Jabar",
      "url": "https://sapeta.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Service Desk DISKOMINFO",
      "url": "https://servicedesk.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Sistem Informasi Dokumen Elektronik Jawa Barat (SIDEBAR)",
      "url": "https://sidebar-v2.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "SIPANTAU JABAR",
      "url": "http://10.0.3.13/status/web",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Portal Layanan Administrasi Pemerintahan (SSO)",
      "url": "https://smartjabar.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "SSO Digital Services",
      "url": "https://sso.digitalservice.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Aplikasi Tableau",
      "url": "https://tableau.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Jabar SIte (J-Site)",
      "url": "https://builder.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Hotline Jabar",
      "url": "https://hotline.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Back Office Statistik Sektoral Jawa Barat (BOSS Jabar)",
      "url": "https://statistik.jabarprov.go.id",
      "departmentName": "Dinas Komunikasi dan Informatika",
      "departmentCode": "diskominfo"
    },
    {
      "name": "Website DISKUK",
      "url": "https://diskuk.jabarprov.go.id",
      "departmentName": "Dinas Koperasi dan Usaha Kecil",
      "departmentCode": "diskopukm"
    },
    {
      "name": "Website UPTD P3W Diskuk Jabar",
      "url": "https://p3wdiskuk.jabarprov.go.id",
      "departmentName": "Dinas Koperasi dan Usaha Kecil",
      "departmentCode": "diskopukm"
    },
    {
      "name": "Sistem Informasi Pengawasan Koperasi Digital (SINGAKOTA)",
      "url": "https://singakota.jabarprov.go.id",
      "departmentName": "Dinas Koperasi dan Usaha Kecil",
      "departmentCode": "diskopukm"
    },
    {
      "name": "Program UMKM Naik Kelas",
      "url": "https://umkm.jabarprov.go.id",
      "departmentName": "Dinas Koperasi dan Usaha Kecil",
      "departmentCode": "diskopukm"
    },
    {
      "name": "Website Citarum Harum Juara",
      "url": "https://citarumharum.jabarprov.go.id",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Website DLH",
      "url": "https://dlh.jabarprov.go.id",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Aplikasi Environmental Complaints Information System (ECIS) DLH",
      "url": "https://ecisdlh.jabarprov.go.id",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Aplikasi Laboratorium Lingkungan (LABLING) Jawa Barat",
      "url": "https://lablingjuara.jabarprov.go.id",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Aplikasi Satgas Citarum",
      "url": "https://satgascitarum.jabarprov.go.id",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Aplikasi SampahKita",
      "url": "https://sampahkita.jabarprov.go.id",
      "departmentName": "Dinas Lingkungan Hidup",
      "departmentCode": "dlh"
    },
    {
      "name": "Website DISPARBUD",
      "url": "https://disparbud.jabarprov.go.id",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "Aplikasi Mitra Industri Pariwisata dan Industri Ekonomi Kreatif (INPAREKRAF)",
      "url": "https://mitra.jabarprov.go.id",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "Pesona Pasundan",
      "url": "https://pesonapasundan.jabarprov.go.id",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "Smiling West Java",
      "url": "https://smilingwestjava.jabarprov.go.id",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "Website Museum Negeri Sri Baduga",
      "url": "https://sribaduga.jabarprov.go.id",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "Aplikasi Pariwisata dan Kebudayaan (PARBUDDALAMANGKA)",
      "url": "https://parbuddalamangka.jabarprov.go.id/",
      "departmentName": "Dinas Pariwisata dan Kebudayaan",
      "departmentCode": "disparbud"
    },
    {
      "name": "Website DPMDESA",
      "url": "https://dpmdesa.jabarprov.go.id",
      "departmentName": "Dinas Pemberdayaan Masyarakat dan Desa",
      "departmentCode": "dpmd"
    },
    {
      "name": "Portal Informasi Data Desa Jabar",
      "url": "https://portaldatadesa.jabarprov.go.id",
      "departmentName": "Dinas Pemberdayaan Masyarakat dan Desa",
      "departmentCode": "dpmd"
    },
    {
      "name": "Data Potensi Digital Desa (TAPAL DESA)",
      "url": "https://tapaldesa.jabarprov.go.id",
      "departmentName": "Dinas Pemberdayaan Masyarakat dan Desa",
      "departmentCode": "dpmd"
    },
    {
      "name": "Website DP3AKB",
      "url": "https://dp3akb.jabarprov.go.id",
      "departmentName": "Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan Keluarga Berencana",
      "departmentCode": "dp3akb"
    },
    {
      "name": "Sistem Informasi Gender Anak",
      "url": "https://siga-dp3akb.jabarprov.go.id",
      "departmentName": "Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan Keluarga Berencana",
      "departmentCode": "dp3akb"
    },
    {
      "name": "Aplikasi Data Olahraga (DAHAGA) Terpadu",
      "url": "https://dahaga.jabarprov.go.id",
      "departmentName": "Dinas Pemuda dan Olahraga",
      "departmentCode": "dispora"
    },
    {
      "name": "Website DISPORA",
      "url": "https://dispora.jabarprov.go.id",
      "departmentName": "Dinas Pemuda dan Olahraga",
      "departmentCode": "dispora"
    },
    {
      "name": "Sistem Informasi Kawasan Terpadu Pemuda dan Olahraga (SIKASEPORA)",
      "url": "https://sikasepora.jabarprov.go.id",
      "departmentName": "Dinas Pemuda dan Olahraga",
      "departmentCode": "dispora"
    },
    {
      "name": "Sistem Informasi Management Atlet Unggul (SIMAUNG)",
      "url": "https://simaung.jabarprov.go.id",
      "departmentName": "Dinas Pemuda dan Olahraga",
      "departmentCode": "dispora"
    },
    {
      "name": "Aplikasi Konversi Naskah",
      "url": "https://103.122.5.250",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Sistem Informasi Pelayanan Perizinan untuk Publik (SIMPATIK)",
      "url": "https://apisimpatik.jabarprov.go.id",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Website DPMPTSP",
      "url": "https://web-dpmptsp.jabarprov.go.id",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Aplikasi Jabar Electronic Information Assistance (JELITA)",
      "url": "https://dpmptsp.jabarprov.go.id/jelita",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Aplikasi Survei Kepuasan Masyarakat (SKM) DPMPTSP",
      "url": "https://dpmptsp.jabarprov.go.id/skm",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Website West Java Investment Partnership",
      "url": "https://investasi.jabarprov.go.id",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Website Mal Pelayanan Publik Digital",
      "url": "https://mppdigital.jabarprov.go.id",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Website West Java Investment Summit (WJIS)",
      "url": "https://wjis.jabarprov.go.id",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Website Kawasan Rebana",
      "url": "https://kawasanrebana.jabarprov.go.id",
      "departmentName": "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
      "departmentCode": "dpmptsp"
    },
    {
      "name": "Website DISDIK",
      "url": "https://disdik.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Aplikasi Terintegrasi Pendidikan (DIBA SuperApps)",
      "url": "https://disdik.jabarprov.go.id/superapps",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Sistem Laporan Kinerja dan Absensi Non-ASN DISDIK",
      "url": "https://elkp-disdik.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Aplikasi Master CMS DISDIK Jabar",
      "url": "https://master-cms.jabarprov.go.id/webdisdik",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Aplikasi Piradio",
      "url": "https://disdik.jabarprov.go.id/sapa-disdik/piradio",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Website Penerimaan Peserta Didik Baru (PPDB)",
      "url": "https://spmb.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Website Bidang Pembinaan Sekolah Menengah Kejuruan",
      "url": "https://psmk.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Sistem Informasi dan Layanan Administrasi Guru dan Tenaga Kependidikan",
      "url": "https://gtk.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Sistem Informasi Pengelolaan Anggaran Biaya Operasional Pendidikan Daerah (BOPD)",
      "url": "https://sipd-sekolah.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Aplikasi Sync Disdik",
      "url": "https://sync-disdik.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "Sistem Administrasi Setoran Penerimaan (Si-ASEP)",
      "url": "https://siasepdisdik.jabarprov.go.id",
      "departmentName": "Dinas Pendidikan",
      "departmentCode": "disdik"
    },
    {
      "name": "CCTV Dishub Jabar",
      "url": "http://123.231.164.66/login",
      "departmentName": "Dinas Perhubungan",
      "departmentCode": "dishub"
    },
    {
      "name": "Website DISHUB",
      "url": "https://dishub.jabarprov.go.id",
      "departmentName": "Dinas Perhubungan",
      "departmentCode": "dishub"
    },
    {
      "name": "Sistem Informasi Manajemen Angkutan Terpadu",
      "url": "https://sim-dishub.jabarprov.go.id",
      "departmentName": "Dinas Perhubungan",
      "departmentCode": "dishub"
    },
    {
      "name": "SIPANDU JALAN",
      "url": "https://sip-dishub.jabarprov.go.id",
      "departmentName": "Dinas Perhubungan",
      "departmentCode": "dishub"
    },
    {
      "name": "Website Disperindag Jabar",
      "url": "https://indag.jabarprov.go.id",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Satu Data Industri dan Perdagangan Jawa Barat (SATUIN)",
      "url": "https://disperindag.jabarprov.go.id/satudata",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Agenda Arranger Disperindag Jabar",
      "url": "https://disperindag.jabarprov.go.id/agenda",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "e-PPID Disperindag Jabar",
      "url": "https://disperindag.jabarprov.go.id/ppid",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Industry and Trade Information Center (INTRAC) App",
      "url": "https://disperindag.jabarprov.go.id/intrac",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Landing Page UPTD INDAG",
      "url": "https://disperindag.jabarprov.go.id/uptd",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Sistem Informasi Pelayanan UPTD",
      "url": "https://disperindag.jabarprov.go.id/layanan-uptd",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Indag Foreign Trade Integrated System (INFINITY)",
      "url": "https://infinity.jabarprov.go.id",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Sistem Informasi Perdagangan Dalam Negeri (SIDANDRI)",
      "url": "https://sidandri.jabarprov.go.id",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Sistem Informasi Perlindungan Konsumen (SIPERMEN)",
      "url": "https://sipermen.jabarprov.go.id",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Sistem Informasi Pelayanan Industri (SIYANTI)",
      "url": "https://siyanti.jabarprov.go.id",
      "departmentName": "Dinas Perindustrian dan Perdagangan",
      "departmentCode": "disperindag"
    },
    {
      "name": "Website Balai Pengawasan dan Sertifikasi Benih Perkebunan (BPSBP)",
      "url": "https://bpsbp.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Dashboard Perkebunan",
      "url": "https://dashboard-perkebunan.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Website DISBUN",
      "url": "https://disbun.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Aplikasi Pelaporan dan Penilaian Online Usaha Perkebunan (LAMPIONKEBUN)",
      "url": "https://lampionkebun.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Aplikasi Pendiri Kelompok Tani",
      "url": "https://pendiripoktan.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Sistem Informasi Kelompok Tani Perkebunan (SIMPONI)",
      "url": "https://simponi.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Sistem Informasi Pengelolaan Kegiatan (SIPEKA)",
      "url": "https://sipeka-disbun.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Sistem Informasi Sertifikasi Online Benih Perkebunan (SISOLEHBUN)",
      "url": "https://sisolehbun.jabarprov.go.id",
      "departmentName": "Dinas Perkebunan",
      "departmentCode": "disbun"
    },
    {
      "name": "Website DISPUSIPDA",
      "url": "https://dispusipda.jabarprov.go.id",
      "departmentName": "Dinas Perpustakaan dan Kearsipan Daerah",
      "departmentCode": "disperpusip"
    },
    {
      "name": "Aplikasi Integrated Library Sistem (INLIS)",
      "url": "https://ilms.jabarprov.go.id",
      "departmentName": "Dinas Perpustakaan dan Kearsipan Daerah",
      "departmentCode": "disperpusip"
    },
    {
      "name": "Surat Jabar Juara (SUARA)",
      "url": "https://suara.jabarprov.go.id",
      "departmentName": "Dinas Perpustakaan dan Kearsipan Daerah",
      "departmentCode": "disperpusip"
    },
    {
      "name": "Aplikasi Wakaf Buku Jabar Juara Literasi",
      "url": "https://wajit-dispusipda.jabarprov.go.id",
      "departmentName": "Dinas Perpustakaan dan Kearsipan Daerah",
      "departmentCode": "disperpusip"
    },
    {
      "name": "Aplikasi Salira",
      "url": "https://dispusipda.jabarprov.go.id/salira",
      "departmentName": "Dinas Perpustakaan dan Kearsipan Daerah",
      "departmentCode": "disperpusip"
    },
    {
      "name": "Website DISPERKIM",
      "url": "https://disperkim.jabarprov.go.id",
      "departmentName": "Dinas Perumahan dan Permukiman",
      "departmentCode": "disperkim"
    },
    {
      "name": "Sistem Pengelolaan Apartemen Transit UPTD P3JB",
      "url": "https://p3jb.jabarprov.go.id",
      "departmentName": "Dinas Perumahan dan Permukiman",
      "departmentCode": "disperkim"
    },
    {
      "name": "Sistem Informasi Manajemen Kawasan Kumuh (SIMSAKU)",
      "url": "https://simsaku.jabarprov.go.id",
      "departmentName": "Dinas Perumahan dan Permukiman",
      "departmentCode": "disperkim"
    },
    {
      "name": "Aplikasi Klinik Rumah",
      "url": "https://klinikrumah.jabarprov.go.id",
      "departmentName": "Dinas Perumahan dan Permukiman",
      "departmentCode": "disperkim"
    },
    {
      "name": "Website DINSOS",
      "url": "https://dinsos.jabarprov.go.id",
      "departmentName": "Dinas Sosial",
      "departmentCode": "dinsos"
    },
    {
      "name": "Gerbang Untuk Layanan dan Integrasi Sistem Sosial",
      "url": "https://geuliss.jabarprov.go.id",
      "departmentName": "Dinas Sosial",
      "departmentCode": "dinsos"
    },
    {
      "name": "sistem informasi Logistik Kebencanaan (SILOKA)",
      "url": "https://siloka.jabarprov.go.id",
      "departmentName": "Dinas Sosial",
      "departmentCode": "dinsos"
    },
    {
      "name": "Website DSDA",
      "url": "https://dsda.jabarprov.go.id",
      "departmentName": "Dinas Sumber Daya Air",
      "departmentCode": "dsda"
    },
    {
      "name": "SISDA Jabar",
      "url": "https://sisda.jabarprov.go.id",
      "departmentName": "Dinas Sumber Daya Air",
      "departmentCode": "dsda"
    },
    {
      "name": "SIH3 Jabar",
      "url": "https://sih3.jabarprov.go.id",
      "departmentName": "Dinas Sumber Daya Air",
      "departmentCode": "dsda"
    },
    {
      "name": "Website BPMEKTAN",
      "url": "https://bpmektan.jabarprov.go.id",
      "departmentName": "Dinas Tanaman Pangan dan Hortikultura",
      "departmentCode": "distanhort"
    },
    {
      "name": "Website DISTANHORTI",
      "url": "https://distanhorti.jabarprov.go.id",
      "departmentName": "Dinas Tanaman Pangan dan Hortikultura",
      "departmentCode": "distanhort"
    },
    {
      "name": "Website Informasi Tani",
      "url": "https://infotanijabar.jabarprov.go.id",
      "departmentName": "Dinas Tanaman Pangan dan Hortikultura",
      "departmentCode": "distanhort"
    },
    {
      "name": "Kimia Agro Integrated Agricultural Laboratory Information Management System (KATALIS)",
      "url": "https://katalis.jabarprov.go.id",
      "departmentName": "Dinas Tanaman Pangan dan Hortikultura",
      "departmentCode": "distanhort"
    },
    {
      "name": "Website Balai Latihan Kerja Mandiri Provinsi Jawa Barat",
      "url": "https://blkmandiri.jabarprov.go.id",
      "departmentName": "Dinas Tenaga Kerja dan Transmigrasi",
      "departmentCode": "disnakertrans"
    },
    {
      "name": "Website Balai Latihan Kerja Kompetensi Provinsi Jawa Barat",
      "url": "https://blkkompetensi.jabarprov.go.id",
      "departmentName": "Dinas Tenaga Kerja dan Transmigrasi",
      "departmentCode": "disnakertrans"
    },
    {
      "name": "Website LTSAPMI",
      "url": "https://ltsapmi.jabarprov.go.id",
      "departmentName": "Dinas Tenaga Kerja dan Transmigrasi",
      "departmentCode": "disnakertrans"
    },
    {
      "name": "Aplikasi Gerai Layanan Informasi Ketenagakerjaan (GLIK)",
      "url": "https://glik.jabarprov.go.id",
      "departmentName": "Dinas Tenaga Kerja dan Transmigrasi",
      "departmentCode": "disnakertrans"
    },
    {
      "name": "Website DISNAKERTRANS",
      "url": "https://disnakertrans.jabarprov.go.id",
      "departmentName": "Dinas Tenaga Kerja dan Transmigrasi",
      "departmentCode": "disnakertrans"
    },
    {
      "name": "Sistem Informasi dan Konsultasi Hubungan Industrial (SIKHI)",
      "url": "https://sikhi-disnakerjabar.jabarprov.go.id",
      "departmentName": "Dinas Tenaga Kerja dan Transmigrasi",
      "departmentCode": "disnakertrans"
    },
    {
      "name": "Website UPTDPK Wilayah 3 Cirebon",
      "url": "https://uptdpkwil3cirebon.disnakertrans.jabarprov.go.id",
      "departmentName": "Dinas Tenaga Kerja dan Transmigrasi",
      "departmentCode": "disnakertrans"
    },
    {
      "name": "Sistem Tata Kelola Hibah (SITABAH)",
      "url": "https://sitabah.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Kesejahteraan Rakyat",
      "departmentCode": "setda-kesra"
    },
    {
      "name": "sistem Informasi Pengawasan Tindak Lanjut Hasil Pengawasan (TLHP)",
      "url": "https://smartwas.jabarprov.go.id",
      "departmentName": "Inspektorat",
      "departmentCode": "inspektorat"
    },
    {
      "name": "Aplikasi Data Potensial Lembaga Keagamaan (DPLEGA)",
      "url": "https://dplega.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Kesejahteraan Rakyat",
      "departmentCode": "setda-kesra"
    },
    {
      "name": "Website Biro KESRA",
      "url": "https://birokesra.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Kesejahteraan Rakyat",
      "departmentCode": "setda-kesra"
    },
    {
      "name": "Sistem Penyusunan Peraturan Perundangan-Undangan (SIPEDANG)",
      "url": "https://sipedang.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Hukum dan Hak Asasi Manusia",
      "departmentCode": "setda-hukum"
    },
    {
      "name": "Sistem Manajemen Perjalanan Hukum dan HAM Terintegrasi (SIMASTER)",
      "url": "https://simaster.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Hukum dan Hak Asasi Manusia",
      "departmentCode": "setda-hukum"
    },
    {
      "name": "Sistem Bantuan Hukum Daerah (SIDBANKUMDA)",
      "url": "https://sidbankumda.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Hukum dan Hak Asasi Manusia",
      "departmentCode": "setda-hukum"
    },
    {
      "name": "Aplikasi Jaringan Dokumentasi Informasi Hukum (JDIH) Jabar",
      "url": "https://jdih.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Hukum dan Hak Asasi Manusia",
      "departmentCode": "setda-hukum"
    },
    {
      "name": "Website Biro Hukum HAM",
      "url": "https://birohukum.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Hukum dan Hak Asasi Manusia",
      "departmentCode": "setda-hukum"
    },
    {
      "name": "Sistem Publikasi Rancangan Peraturan Perundangan-Undangan",
      "url": "https://aksespasti.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Hukum dan Hak Asasi Manusia",
      "departmentCode": "setda-hukum"
    },
    {
      "name": "Sistem Informasi Pelaporan Keuangan BUMD Lembaga Keuangan (SIMPELKEU) Provinsi Jawa Barat",
      "url": "https://simpelkeu.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro BUMD, Investasi dan Administrasi Pembangunan",
      "departmentCode": "setda-bumd"
    },
    {
      "name": "SIstem Monitoring Laporan Evaluasi Kinerja (SIMOLEK)",
      "url": "https://simolek.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro BUMD, Investasi dan Administrasi Pembangunan",
      "departmentCode": "setda-bumd"
    },
    {
      "name": "Website Biro BIA",
      "url": "https://birobia.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro BUMD, Investasi dan Administrasi Pembangunan",
      "departmentCode": "setda-bumd"
    },
    {
      "name": "Aplikasi Electronic Clipping (e-Clip)",
      "url": "https://eclip.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Administrasi Pimpinan",
      "departmentCode": "setda-adpim"
    },
    {
      "name": "Website Biro ADPIM",
      "url": "https://biroadpim.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Administrasi Pimpinan",
      "departmentCode": "setda-adpim"
    },
    {
      "name": "Website SATPOL PP",
      "url": "https://satpolpp.jabarprov.go.id",
      "departmentName": "Satuan Polisi Pamong Praja",
      "departmentCode": "satpolpp"
    },
    {
      "name": "Aplikasi Pengawasan Penggunaan ProdukDalam Negeri (KAWANI)",
      "url": "https://kawani.jabarprov.go.id",
      "departmentName": "Inspektorat",
      "departmentCode": "inspektorat"
    },
    {
      "name": "Website Inspektorat",
      "url": "https://inspektorat.jabarprov.go.id",
      "departmentName": "Inspektorat",
      "departmentCode": "inspektorat"
    },
    {
      "name": "Website Biro Perekonomian",
      "url": "https://biroperekonomian.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Perekonomian",
      "departmentCode": "setda-ekonomi"
    },
    {
      "name": "Website UPTD Pelatihan Kesehatan dan LMS UPTD Pelatihan Kesehatan",
      "url": "https://upelkes.jabarprov.go.id",
      "departmentName": "Dinas Kesehatan",
      "departmentCode": "dinkes"
    },
    {
      "name": "Aplikasi Jaringan Dokumentasi Informasi Hukum (JDIH) DPRD",
      "url": "https://jdihdprd.jabarprov.go.id",
      "departmentName": "Sekretariat DPRD Provinsi",
      "departmentCode": "setwan"
    },
    {
      "name": "Website DPRD",
      "url": "https://dprd.jabarprov.go.id",
      "departmentName": "Sekretariat DPRD Provinsi",
      "departmentCode": "setwan"
    },
    {
      "name": "Website Sekretariat Daerah",
      "url": "https://sekretariat.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Umum",
      "departmentCode": "setda-umum"
    },
    {
      "name": "Aplikasi Antrian (EMMERITA)",
      "url": "https://emmerita.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Umum",
      "departmentCode": "setda-umum"
    },
    {
      "name": "Website Biro Umum",
      "url": "https://biroumum.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Umum",
      "departmentCode": "setda-umum"
    },
    {
      "name": "Sistem Informasi Pengendalian Inflasi Daerah (SILINDA)",
      "url": "https://silinda.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Perekonomian",
      "departmentCode": "setda-ekonomi"
    },
    {
      "name": "Aplikasi Regenerasi Petani",
      "url": "https://regenerasipetani.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Perekonomian",
      "departmentCode": "setda-ekonomi"
    },
    {
      "name": "Apliksi Survey Kepuasan Masyarakat (SKM) Jabar",
      "url": "https://skm.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Organisasi",
      "departmentCode": "setda-organisasi"
    },
    {
      "name": "Website Layanan Pengadaan Secara Elektronik (LPSE) Jawa Barat",
      "url": "https://lpse.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Pengadaan Barang/Jasa",
      "departmentCode": "setda-pbj"
    },
    {
      "name": "Aplikasi Pelayanan Penyedia",
      "url": "https://helpdesk-biropbj.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Pengadaan Barang/Jasa",
      "departmentCode": "setda-pbj"
    },
    {
      "name": "Website Biro PBJ",
      "url": "https://biropbj.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Pengadaan Barang/Jasa",
      "departmentCode": "setda-pbj"
    },
    {
      "name": "Website West Java Partnership (WJP) Digital Platform",
      "url": "https://wjp.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Pemerintahan dan Otonomi Daerah",
      "departmentCode": "setda-otda"
    },
    {
      "name": "Website Biro Pemotda",
      "url": "https://biropemotda.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Pemerintahan dan Otonomi Daerah",
      "departmentCode": "setda-otda"
    },
    {
      "name": "Website Biro Organisasi",
      "url": "https://biroorg.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Organisasi",
      "departmentCode": "setda-organisasi"
    },
    {
      "name": "Sistem Akuntabilitas Kinerja Instansi Pemerintahan (SAKIP) Jawa Barat",
      "url": "https://japati.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Organisasi",
      "departmentCode": "setda-organisasi"
    },
    {
      "name": "Sistem Pengukuran Reformasi Birokrasi (SURABI)",
      "url": "https://surabi.jabarprov.go.id",
      "departmentName": "Sekretariat Daerah Provinsi | Biro Organisasi",
      "departmentCode": "setda-organisasi"
    }
  ];

  // Ekstrak unique department (OPD) agar otomatis masuk database
  const uniqueDeptsMap = new Map();
  rawApps.forEach(item => {
    if (!uniqueDeptsMap.has(item.departmentCode)) {
      uniqueDeptsMap.set(item.departmentCode, {
        code: item.departmentCode.toUpperCase(),
        name: item.departmentName
      });
    }
  });

  const departmentRecords = Array.from(uniqueDeptsMap.values());
  await prisma.department.createMany({
    data: departmentRecords,
    skipDuplicates: true
  });

  const allDepts = await prisma.department.findMany();
  const deptCodeToId = {};
  allDepts.forEach(d => {
    deptCodeToId[d.code.toLowerCase()] = d.id;
  });

  const appDataToInsert = rawApps.map(item => ({
    name: item.name,
    url: item.url,
    monitoringType: 'HTTP',
    departmentId: deptCodeToId[item.departmentCode.toLowerCase()] || 1
  }));

  await prisma.application.createMany({
    data: appDataToInsert,
    skipDuplicates: true
  });

  console.log(`Seeding sukses! Berhasil memasukkan ${appDataToInsert.length} aplikasi dari Excel.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });