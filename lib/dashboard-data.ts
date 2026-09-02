export type StatusKey = "total" | "online" | "warning" | "offline" | "maintenance";

export interface StatusMetric {
  key: StatusKey;
  label: string;
  value: number;
  subLabel: string;
}

export const dashboardStatusMetrics: StatusMetric[] = [
  {
    key: "total",
    label: "Total Aplikasi",
    value: 215,
    subLabel: "Semua aplikasi terdaftar di Jabar",
  },
  {
    key: "online",
    label: "Online / Normal",
    value: 209,
    subLabel: "97.21% beroperasi normal",
  },
  {
    key: "warning",
    label: "Warning / Degraded",
    value: 4,
    subLabel: "Perlu penanganan teknis",
  },
  {
    key: "offline",
    label: "Offline / Kritis",
    value: 2,
    subLabel: "0.93% layanan terhenti",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    value: 0,
    subLabel: "Tidak ada jadwal pemeliharaan",
  },
];

export interface StatusDonutSlice {
  name: string;
  key: StatusKey;
  value: number;
  color: string;
  percentage: number;
}

export const statusDonutData: StatusDonutSlice[] = [
  { name: "Online", key: "online", value: 209, color: "#0E9F6E", percentage: 97.21 },
  { name: "Warning", key: "warning", value: 4, color: "#D97706", percentage: 1.86 },
  { name: "Offline", key: "offline", value: 2, color: "#DC2626", percentage: 0.93 },
  { name: "Maintenance", key: "maintenance", value: 0, color: "#7C5CFC", percentage: 0.0 },
];

export interface HeaderMeta {
  dateTimeLabel: string;
  autoRefreshLabel: string;
  notificationCount: number;
  operatorName: string;
  operatorEmail: string;
  operatorInitials: string;
}

export const headerMeta: HeaderMeta = {
  dateTimeLabel: "Sabtu, 29 Agustus 2026 · 08:35 WIB",
  autoRefreshLabel: "Auto Refresh 30s",
  notificationCount: 3,
  operatorName: "Super Admin APTIKA",
  operatorEmail: "admin.aptika@jabarprov.go.id",
  operatorInitials: "SA",
};

export const dashboardCopy = {
  greeting: `Selamat datang di Command Center APTIKA 👋`,
  subtitle:
    "Monitoring ketersediaan, performa server, dan status layanan digital Pemerintah Provinsi Jawa Barat secara realtime.",
};

export interface TrendPoint {
  label: string;
  online: number;
  warning: number;
  offline: number;
  avgLatency: number;
}

export type TrendRange = "harian" | "mingguan" | "bulanan";

export const trendRangeLabels: Record<TrendRange, string> = {
  harian: "7 Hari Terakhir",
  mingguan: "8 Minggu Terakhir",
  bulanan: "6 Bulan Terakhir",
};

export const statusTrendData: Record<TrendRange, TrendPoint[]> = {
  harian: [
    { label: "23 Agu", online: 207, warning: 5, offline: 3, avgLatency: 84 },
    { label: "24 Agu", online: 205, warning: 7, offline: 3, avgLatency: 92 },
    { label: "25 Agu", online: 208, warning: 4, offline: 3, avgLatency: 76 },
    { label: "26 Agu", online: 210, warning: 3, offline: 2, avgLatency: 68 },
    { label: "27 Agu", online: 208, warning: 5, offline: 2, avgLatency: 74 },
    { label: "28 Agu", online: 209, warning: 4, offline: 2, avgLatency: 71 },
    { label: "29 Agu", online: 209, warning: 4, offline: 2, avgLatency: 65 },
  ],
  mingguan: [
    { label: "Mgg 1", online: 201, warning: 9, offline: 5, avgLatency: 104 },
    { label: "Mgg 2", online: 203, warning: 8, offline: 4, avgLatency: 96 },
    { label: "Mgg 3", online: 205, warning: 7, offline: 3, avgLatency: 88 },
    { label: "Mgg 4", online: 204, warning: 6, offline: 5, avgLatency: 91 },
    { label: "Mgg 5", online: 207, warning: 5, offline: 3, avgLatency: 82 },
    { label: "Mgg 6", online: 206, warning: 6, offline: 3, avgLatency: 79 },
    { label: "Mgg 7", online: 208, warning: 4, offline: 3, avgLatency: 72 },
    { label: "Mgg 8", online: 209, warning: 4, offline: 2, avgLatency: 65 },
  ],
  bulanan: [
    { label: "Mar", online: 188, warning: 10, offline: 6, avgLatency: 115 },
    { label: "Apr", online: 192, warning: 9, offline: 5, avgLatency: 108 },
    { label: "Mei", online: 197, warning: 8, offline: 5, avgLatency: 95 },
    { label: "Jun", online: 201, warning: 7, offline: 4, avgLatency: 86 },
    { label: "Jul", online: 205, warning: 6, offline: 4, avgLatency: 78 },
    { label: "Agu", online: 209, warning: 4, offline: 2, avgLatency: 65 },
  ],
};

// ==========================================
// TIPE & DATA INSIDEN (INCIDENTS)
// ==========================================
export type IncidentSeverity = "critical" | "major" | "minor" | "info";
export type IncidentStatus = "open" | "investigating" | "resolved";

export interface IncidentItem {
  id: string;
  ticketNumber: string;
  title: string;
  appName: string;
  opdName: string;
  opdCode: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: string;
  duration: string;
  description: string;
  rootCause?: string;
  assignedTo: string;
  impact: string;
  httpStatus?: number;
  timeline: { time: string; note: string }[];
}

export const initialIncidents: IncidentItem[] = [
  {
    id: "inc-01",
    ticketNumber: "INC-2026-0829-01",
    title: "503 Service Unavailable pada Endpoint Verifikasi Kependudukan",
    appName: "SIPD-Kependudukan Terpadu",
    opdName: "Dinas Kependudukan dan Pencatatan Sipil",
    opdCode: "DISDUKCAPIL",
    severity: "critical",
    status: "open",
    startedAt: "29 Agu 2026, 07:15 WIB",
    duration: "1 jam 20 menit",
    description:
      "Server aplikasi gagal merespons request API handshake dari gateway utama karena deadlock pada connection pool database master.",
    rootCause: "Koneksi ke node PostgreSQL cluster-02 mengalami connection spike akibat batch job sinkronisasi NIK.",
    assignedTo: "Tim Infrastruktur APTIKA & Admin Disdukcapil",
    impact: "Layanan verifikasi NIK publik dari aplikasi eksternal tertunda.",
    httpStatus: 503,
    timeline: [
      { time: "07:15 WIB", note: "Sistem automated ping mendeteksi response 503 berturut-turut selama 3 kali." },
      { time: "07:22 WIB", note: "Alert otomatis terkirim ke kanal Telegram Command Center APTIKA." },
      { time: "07:35 WIB", note: "Tim teknis mulai melakukan restart worker pool dan isolasi node database cluster-02." },
    ],
  },
  {
    id: "inc-02",
    ticketNumber: "INC-2026-0829-02",
    title: "High Response Time (>3800ms) pada Portal Rekam Medis Digital",
    appName: "SIMPUS Jabar Online",
    opdName: "Dinas Kesehatan",
    opdCode: "DINKES",
    severity: "critical",
    status: "investigating",
    startedAt: "29 Agu 2026, 06:40 WIB",
    duration: "1 jam 55 menit",
    description:
      "Waktu respons query rekam medis rujukan puskesmas melonjak di atas batas ambang normal (>1500ms).",
    rootCause: "Indeks query riwayat pasien belum di-vacuum setelah migrasi data faskes baru.",
    assignedTo: "Budi Santoso (Data Engineer Dinkes)",
    impact: "Puskesmas di 8 kabupaten mengalami kelambatan load data pasien.",
    httpStatus: 200,
    timeline: [
      { time: "06:40 WIB", note: "Monitoring latency mendeteksi avg latency 3840ms." },
      { time: "07:05 WIB", note: "Status dinaikkan menjadi Investigasi oleh Tim Pusdatin Dinkes." },
      { time: "08:10 WIB", note: "Proses re-indexing parsial sedang berlangsung di replica database." },
    ],
  },
  {
    id: "inc-03",
    ticketNumber: "INC-2026-0828-09",
    title: "Peringatan SSL Certificate Kadaluarsa dalam 4 Hari",
    appName: "Portal PPID Terbuka",
    opdName: "Dinas Komunikasi dan Informatika",
    opdCode: "DISKOMINFO",
    severity: "major",
    status: "investigating",
    startedAt: "28 Agu 2026, 14:00 WIB",
    duration: "18 jam",
    description:
      "Sertifikat SSL Let's Encrypt wildcard *.ppid.jabarprov.go.id belum ter-renew otomatis oleh ACME bot.",
    rootCause: "Kegagalan otorisasi HTTP-01 challenge karena DNS hook API token expired.",
    assignedTo: "Rian Prasetya (DevSecOps APTIKA)",
    impact: "Jika tidak diperbarui sebelum 2 September 2026, browser publik akan menampilkan warning keamanan.",
    timeline: [
      { time: "28 Agu 14:00", note: "Automated SSL Checker mendeteksi sisa masa aktif < 5 hari." },
      { time: "28 Agu 16:30", note: "Tiket diserahkan ke Tim Jaringan & Keamanan Informasi." },
    ],
  },
  {
    id: "inc-04",
    ticketNumber: "INC-2026-0828-04",
    title: "Pemberitahuan Disk I/O Usage 88% pada Node Penyimpanan Pajak",
    appName: "e-SAMSAT Jabar Mobile",
    opdName: "Badan Pendapatan Daerah",
    opdCode: "BAPENDA",
    severity: "minor",
    status: "resolved",
    startedAt: "28 Agu 2026, 09:20 WIB",
    duration: "45 menit (Selesai)",
    description:
      "Penggunaan storage log transaksi mendekati ambang batas peringatan 85%.",
    rootCause: "Log rotasi cron job tertunda pada salah satu container reporting.",
    assignedTo: "Tim Operasional Bapenda",
    impact: "Tidak ada downtime langsung, pencegahan sebelum kapasitas penuh.",
    timeline: [
      { time: "28 Agu 09:20", note: "Trigger alert disk storage 88%." },
      { time: "28 Agu 09:45", note: "Proses log archival ke cold storage S3 lokal selesai." },
      { time: "28 Agu 10:05", note: "Kapasitas kembali ke 42%. Status ditandai Resolved." },
    ],
  },
  {
    id: "inc-05",
    ticketNumber: "INC-2026-0827-11",
    title: "Gateway Timeout (504) saat Import Data Anggaran Triwulan III",
    appName: "SIPD Akuntansi & Pelaporan",
    opdName: "Badan Pengelola Keuangan dan Aset Daerah",
    opdCode: "BPKAD",
    severity: "major",
    status: "resolved",
    startedAt: "27 Agu 2026, 11:30 WIB",
    duration: "1 jam 15 menit (Selesai)",
    description:
      "Nginx proxy timeout saat OPD serentak mengunggah file neraca triwulan ukuran besar.",
    rootCause: "Konfigurasi client_max_body_size dan proxy_read_timeout pada reverse proxy terlalu ketat (60s).",
    assignedTo: "Tim Server BPKAD",
    impact: "3 OPD gagal menyimpan draf anggaran dan harus upload ulang.",
    httpStatus: 504,
    timeline: [
      { time: "27 Agu 11:30", note: "Laporan error 504 dari Bappeda & Disdik." },
      { time: "27 Agu 12:15", note: "Timeout dinaikkan menjadi 300s dan chunk upload diaktifkan." },
      { time: "27 Agu 12:45", note: "Verifikasi ulang sukses tanpa error." },
    ],
  },
];

// ==========================================
// TIPE & DATA UPTIME MONITOR (30 HARI HISTORY)
// ==========================================
export type ServiceStatus = "online" | "warning" | "offline" | "maintenance";

export interface DayUptime {
  date: string;
  status: ServiceStatus;
  uptimePercent: number;
  avgLatencyMs: number;
}

export interface UptimeService {
  id: string;
  name: string;
  url: string;
  opdName: string;
  opdCode: string;
  status: ServiceStatus;
  currentLatencyMs: number;
  uptime30Days: number;
  uptime90Days: number;
  sslStatus: "valid" | "warning" | "expired";
  sslExpiryDays: number;
  sslIssuer: string;
  checkInterval: string;
  lastChecked: string;
  history30d: DayUptime[];
}

// Generator helper mock 30 hari history
export function generate30DayHistory(baseStatus: ServiceStatus, baseUptime: number, avgLat: number): DayUptime[] {
  const history: DayUptime[] = [];
  const today = new Date(2026, 7, 29); // 29 Agustus 2026

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    let status: ServiceStatus = "online";
    let uptime = 100;
    let lat = avgLat + Math.floor(Math.random() * 15 - 7);

    if (i === 0 && baseStatus !== "online") {
      status = baseStatus;
      uptime = baseStatus === "offline" ? 65.0 : 92.4;
      lat = baseStatus === "offline" ? 0 : 3800;
    } else if (i === 4 && baseUptime < 99.5) {
      status = "warning";
      uptime = 94.2;
      lat = avgLat * 2.5;
    } else if (i === 12 && baseUptime < 99.0) {
      status = "offline";
      uptime = 82.0;
      lat = 0;
    }

    history.push({
      date: dateStr,
      status,
      uptimePercent: uptime,
      avgLatencyMs: Math.max(lat, 0),
    });
  }
  return history;
}

export const initialUptimeServices: UptimeService[] = [
  {
    id: "srv-01",
    name: "Portal Resmi Pemdaprov Jabar",
    url: "https://jabarprov.go.id",
    opdName: "Dinas Komunikasi dan Informatika",
    opdCode: "DISKOMINFO",
    status: "online",
    currentLatencyMs: 42,
    uptime30Days: 99.98,
    uptime90Days: 99.95,
    sslStatus: "valid",
    sslExpiryDays: 142,
    sslIssuer: "DigiCert Global Root G2",
    checkInterval: "30 detik",
    lastChecked: "Baru saja",
    history30d: generate30DayHistory("online", 99.98, 42),
  },
  {
    id: "srv-02",
    name: "SIPD-Kependudukan Terpadu (API Master)",
    url: "https://disdukcapil.jabarprov.go.id/api/v2",
    opdName: "Dinas Kependudukan dan Pencatatan Sipil",
    opdCode: "DISDUKCAPIL",
    status: "offline",
    currentLatencyMs: 0,
    uptime30Days: 98.42,
    uptime90Days: 98.90,
    sslStatus: "valid",
    sslExpiryDays: 88,
    sslIssuer: "Let's Encrypt Authority X3",
    checkInterval: "15 detik",
    lastChecked: "12 detik lalu",
    history30d: generate30DayHistory("offline", 98.42, 110),
  },
  {
    id: "srv-03",
    name: "SIMPUS Jabar Online (Sistem Puskesmas)",
    url: "https://simpus.dinkes.jabarprov.go.id",
    opdName: "Dinas Kesehatan",
    opdCode: "DINKES",
    status: "warning",
    currentLatencyMs: 3840,
    uptime30Days: 99.12,
    uptime90Days: 99.30,
    sslStatus: "valid",
    sslExpiryDays: 65,
    sslIssuer: "Sectigo RSA Domain Validation",
    checkInterval: "30 detik",
    lastChecked: "18 detik lalu",
    history30d: generate30DayHistory("warning", 99.12, 180),
  },
  {
    id: "srv-04",
    name: "Portal Satu Data Jawa Barat (Open Data)",
    url: "https://opendata.jabarprov.go.id",
    opdName: "Dinas Komunikasi dan Informatika",
    opdCode: "DISKOMINFO",
    status: "online",
    currentLatencyMs: 58,
    uptime30Days: 99.94,
    uptime90Days: 99.91,
    sslStatus: "valid",
    sslExpiryDays: 210,
    sslIssuer: "GlobalSign GCC R3",
    checkInterval: "60 detik",
    lastChecked: "24 detik lalu",
    history30d: generate30DayHistory("online", 99.94, 58),
  },
  {
    id: "srv-05",
    name: "e-SAMSAT Jabar (Layanan Pajak Kendaraan)",
    url: "https://bapenda.jabarprov.go.id/e-samsat",
    opdName: "Badan Pendapatan Daerah",
    opdCode: "BAPENDA",
    status: "online",
    currentLatencyMs: 64,
    uptime30Days: 99.89,
    uptime90Days: 99.85,
    sslStatus: "valid",
    sslExpiryDays: 95,
    sslIssuer: "DigiCert Global Root CA",
    checkInterval: "30 detik",
    lastChecked: "5 detik lalu",
    history30d: generate30DayHistory("online", 99.89, 64),
  },
  {
    id: "srv-06",
    name: "PPDB Online Jabar (Portal Pendaftaran Siswa)",
    url: "https://ppdb.disdik.jabarprov.go.id",
    opdName: "Dinas Pendidikan",
    opdCode: "DISDIK",
    status: "online",
    currentLatencyMs: 48,
    uptime30Days: 99.99,
    uptime90Days: 99.92,
    sslStatus: "valid",
    sslExpiryDays: 175,
    sslIssuer: "Let's Encrypt Authority X3",
    checkInterval: "15 detik",
    lastChecked: "9 detik lalu",
    history30d: generate30DayHistory("online", 99.99, 48),
  },
  {
    id: "srv-07",
    name: "SIMPATIK (Sistem Informasi Penanaman Modal)",
    url: "https://dpmptsp.jabarprov.go.id/simpatik",
    opdName: "DPMPTSP Provinsi Jawa Barat",
    opdCode: "DPMPTSP",
    status: "warning",
    currentLatencyMs: 1420,
    uptime30Days: 99.25,
    uptime90Days: 99.40,
    sslStatus: "valid",
    sslExpiryDays: 34,
    sslIssuer: "Sectigo RSA Organization Validation",
    checkInterval: "60 detik",
    lastChecked: "35 detik lalu",
    history30d: generate30DayHistory("warning", 99.25, 120),
  },
  {
    id: "srv-08",
    name: "Portal PPID Terbuka Pemprov Jabar",
    url: "https://ppid.jabarprov.go.id",
    opdName: "Dinas Komunikasi dan Informatika",
    opdCode: "DISKOMINFO",
    status: "online",
    currentLatencyMs: 51,
    uptime30Days: 99.78,
    uptime90Days: 99.80,
    sslStatus: "warning",
    sslExpiryDays: 4,
    sslIssuer: "Let's Encrypt Authority X3",
    checkInterval: "60 detik",
    lastChecked: "41 detik lalu",
    history30d: generate30DayHistory("online", 99.78, 51),
  },
  {
    id: "srv-09",
    name: "SIPD Keuangan & Aset Daerah",
    url: "https://bpkad.jabarprov.go.id/sipd",
    opdName: "Badan Pengelola Keuangan dan Aset Daerah",
    opdCode: "BPKAD",
    status: "online",
    currentLatencyMs: 76,
    uptime30Days: 99.65,
    uptime90Days: 99.70,
    sslStatus: "valid",
    sslExpiryDays: 120,
    sslIssuer: "DigiCert SHA2 Extended Validation Server CA",
    checkInterval: "30 detik",
    lastChecked: "14 detik lalu",
    history30d: generate30DayHistory("online", 99.65, 76),
  },
  {
    id: "srv-10",
    name: "SiCakep (Sistem Kepegawaian & Kinerja ASN)",
    url: "https://bkd.jabarprov.go.id/sicakep",
    opdName: "Badan Kepegawaian Daerah",
    opdCode: "BKD",
    status: "offline",
    currentLatencyMs: 0,
    uptime30Days: 98.10,
    uptime90Days: 98.70,
    sslStatus: "valid",
    sslExpiryDays: 52,
    sslIssuer: "GlobalSign Domain Validation CA",
    checkInterval: "30 detik",
    lastChecked: "22 detik lalu",
    history30d: generate30DayHistory("offline", 98.10, 85),
  },
];

// ==========================================
// TIPE & DATA PERANGKAT DAERAH (OPD)
// ==========================================
export interface OpdSummary {
  code: string;
  name: string;
  shortName: string;
  picName: string;
  picEmail: string;
  picPhone: string;
  totalApps: number;
  onlineApps: number;
  warningApps: number;
  offlineApps: number;
  maintenanceApps: number;
  avgUptime: number;
  avgLatencyMs: number;
  healthStatus: "healthy" | "warning" | "critical";
  category: "Pelayanan Publik" | "Pemerintahan" | "Kesehatan & Sosial" | "Pendidikan" | "Keuangan";
  appsList: string[];
}

export const initialOpdSummaries: OpdSummary[] = [
  {
    code: "DISKOMINFO",
    name: "Dinas Komunikasi dan Informatika",
    shortName: "Diskominfo Jabar",
    picName: "Dr. Hendra Wijaya, S.Kom., M.T.",
    picEmail: "aptika@diskominfo.jabarprov.go.id",
    picPhone: "0812-3456-7890",
    totalApps: 48,
    onlineApps: 47,
    warningApps: 1,
    offlineApps: 0,
    maintenanceApps: 0,
    avgUptime: 99.92,
    avgLatencyMs: 48,
    healthStatus: "healthy",
    category: "Pemerintahan",
    appsList: [
      "Portal Jabarprov.go.id",
      "Satu Data Jabar (Open Data)",
      "Portal PPID Terbuka",
      "Command Center APTIKA",
      "Jabar Super Apps (Sapawarga)",
      "Pusat Log Sistem Terpadu",
      "Jabar Saber Hoaks",
    ],
  },
  {
    code: "DISDUKCAPIL",
    name: "Dinas Kependudukan dan Pencatatan Sipil",
    shortName: "Disdukcapil Jabar",
    picName: "Ir. Hj. Sri Rahayu, M.M.",
    picEmail: "it@disdukcapil.jabarprov.go.id",
    picPhone: "0811-9876-5432",
    totalApps: 24,
    onlineApps: 22,
    warningApps: 1,
    offlineApps: 1,
    maintenanceApps: 0,
    avgUptime: 98.65,
    avgLatencyMs: 145,
    healthStatus: "critical",
    category: "Pelayanan Publik",
    appsList: [
      "SIPD-Kependudukan Terpadu",
      "Portal Cetak Akta Online",
      "Layanan Sinkronisasi NIK Jabar",
      "Pencatatan Perkawinan Online",
      "Validasi KTP Digital Jabar",
    ],
  },
  {
    code: "DINKES",
    name: "Dinas Kesehatan",
    shortName: "Dinkes Jabar",
    picName: "dr. R. Ahmad Fauzi, Sp.A.",
    picEmail: "pusdatin@dinkes.jabarprov.go.id",
    picPhone: "0813-2233-4455",
    totalApps: 32,
    onlineApps: 30,
    warningApps: 2,
    offlineApps: 0,
    maintenanceApps: 0,
    avgUptime: 99.15,
    avgLatencyMs: 320,
    healthStatus: "warning",
    category: "Kesehatan & Sosial",
    appsList: [
      "SIMPUS Jabar Online",
      "Portal Ketersediaan Bed RS (SPGDT)",
      "Sistem Monitoring Gizi Balita",
      "SIMKESDA Jabar",
      "Database Vaksinasi Terpadu",
    ],
  },
  {
    code: "BAPENDA",
    name: "Badan Pendapatan Daerah",
    shortName: "Bapenda Jabar",
    picName: "Drs. M. Taufik Hidayat, M.Si.",
    picEmail: "ti@bapenda.jabarprov.go.id",
    picPhone: "0815-6677-8899",
    totalApps: 26,
    onlineApps: 26,
    warningApps: 0,
    offlineApps: 0,
    maintenanceApps: 0,
    avgUptime: 99.88,
    avgLatencyMs: 64,
    healthStatus: "healthy",
    category: "Keuangan",
    appsList: [
      "e-SAMSAT Jabar Mobile",
      "Sistem Pajak Bahan Bakar (PBBKB)",
      "SIM-PAD Jabar",
      "Portal Retribusi Daerah",
      "Gateway Pembayaran Bank BJB",
    ],
  },
  {
    code: "DISDIK",
    name: "Dinas Pendidikan",
    shortName: "Disdik Jabar",
    picName: "H. Bambang Irawan, M.Pd.",
    picEmail: "tik@disdik.jabarprov.go.id",
    picPhone: "0812-7788-9900",
    totalApps: 35,
    onlineApps: 35,
    warningApps: 0,
    offlineApps: 0,
    maintenanceApps: 0,
    avgUptime: 99.95,
    avgLatencyMs: 52,
    healthStatus: "healthy",
    category: "Pendidikan",
    appsList: [
      "PPDB Online Jabar",
      "Portal Guru & Tenaga Kependidikan",
      "SIM Sarana Prasarana Sekolah",
      "E-Rapor Digital SMA/SMK",
      "Beasiswa Jabar Future Leaders",
    ],
  },
  {
    code: "DPMPTSP",
    name: "Dinas Penanaman Modal dan PTSP",
    shortName: "DPMPTSP Jabar",
    picName: "Denny Kurniawan, S.T., M.Kom.",
    picEmail: "sistem@dpmptsp.jabarprov.go.id",
    picPhone: "0818-4455-6677",
    totalApps: 22,
    onlineApps: 21,
    warningApps: 1,
    offlineApps: 0,
    maintenanceApps: 0,
    avgUptime: 99.30,
    avgLatencyMs: 165,
    healthStatus: "warning",
    category: "Pelayanan Publik",
    appsList: [
      "SIMPATIK Perizinan Online",
      "PIR Jabar (Peta Investasi)",
      "Tracking Izin Usaha Terpadu",
      "Konsultasi Investasi Jabar",
    ],
  },
  {
    code: "BPKAD",
    name: "Badan Pengelola Keuangan dan Aset Daerah",
    shortName: "BPKAD Jabar",
    picName: "Dra. Euis Nurhayati, Ak., M.M.",
    picEmail: "anggaran@bpkad.jabarprov.go.id",
    picPhone: "0819-3344-5566",
    totalApps: 16,
    onlineApps: 16,
    warningApps: 0,
    offlineApps: 0,
    maintenanceApps: 0,
    avgUptime: 99.72,
    avgLatencyMs: 78,
    healthStatus: "healthy",
    category: "Keuangan",
    appsList: [
      "SIPD Keuangan & Akuntansi",
      "SIMBADA (Manajemen Aset)",
      "e-SP2D Realtime Gateway",
      "Portal Rekonsiliasi Bank",
    ],
  },
  {
    code: "BKD",
    name: "Badan Kepegawaian Daerah",
    shortName: "BKD Jabar",
    picName: "Agus Pratama, S.IP., M.A.P.",
    picEmail: "it@bkd.jabarprov.go.id",
    picPhone: "0817-1122-3344",
    totalApps: 12,
    onlineApps: 11,
    warningApps: 0,
    offlineApps: 1,
    maintenanceApps: 0,
    avgUptime: 98.20,
    avgLatencyMs: 95,
    healthStatus: "critical",
    category: "Pemerintahan",
    appsList: [
      "SiCakep ASN Jabar",
      "Portal Kenaikan Pangkat Digital",
      "Sistem Seleksi CASN/PPPK",
      "Absensi Mobile Terpusat (K-Mob)",
    ],
  },
];

// ==========================================
// HELPER FUNCTION UNTUK DETAIL PAGE OPD
// ==========================================

export function getApplicationsByOpd(opdCode: string) {
  const opd = initialOpdSummaries.find(
    (item) => item.code.toLowerCase() === opdCode.toLowerCase()
  );

  if (!opd) return [];

  return opd.appsList.map((appName, index) => {
    const matchService = initialUptimeServices.find(
      (srv) => srv.name.toLowerCase() === appName.toLowerCase()
    );

    return {
      id: `${opd.code.toLowerCase()}-app-${index + 1}`,
      name: appName,
      url: matchService ? matchService.url : `https://${opd.code.toLowerCase()}.jabarprov.go.id/${appName.toLowerCase().replace(/\s+/g, "-")}`,
      status: matchService ? (matchService.status === "online" ? "UP" : matchService.status === "offline" ? "DOWN" : "WARNING") : "UP",
      uptime: matchService ? matchService.uptime30Days : opd.avgUptime,
      latency: matchService ? matchService.currentLatencyMs : opd.avgLatencyMs,
    };
  });
}