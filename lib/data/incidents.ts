import { Incident, IncidentFilter, IncidentStatus } from "@/lib/types/incident";

// Realistic mock incidents based on West Java Provincial digital services
export const mockIncidents: Incident[] = [
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
  {
    id: "inc-06",
    ticketNumber: "INC-2026-0826-03",
    title: "Koneksi LDAP Autentikasi ASN Timeout",
    appName: "SiCakep (Sistem Kepegawaian)",
    opdName: "Badan Kepegawaian Daerah",
    opdCode: "BKD",
    severity: "major",
    status: "suppressed",
    startedAt: "26 Agu 2026, 23:00 WIB",
    duration: "Pemeliharaan Terjadwal (2 jam)",
    description: "Pemeliharaan terjadwal klaster Active Directory BKD Prov Jabar.",
    rootCause: "Maintenance window terdaftar di Command Center APTIKA.",
    assignedTo: "Tim Infrastruktur BKD",
    impact: "Akses login single sign-on sementara dinonaktifkan.",
    timeline: [
      { time: "26 Agu 23:00", note: "Maintenance window dimulai, monitoring alert disupresi." },
      { time: "27 Agu 01:00", note: "Sinkronisasi direktori berhasil." },
    ],
  },
];

/**
 * Fetch list of incidents with optional filtering.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/incidents`
 * Expected query params: ?status=...&opdCode=...&searchQuery=...
 * Response contract: Promise<Incident[]>
 */
export async function getIncidents(filter?: IncidentFilter): Promise<Incident[]> {
  await new Promise((r) => setTimeout(r, 60)); // Simulate brief network delay

  let result = [...mockIncidents];

  if (!filter) return result;

  if (filter.status && filter.status !== "all") {
    if (filter.status === "active") {
      result = result.filter((i) => i.status === "open" || i.status === "investigating");
    } else if (filter.status === "resolved") {
      result = result.filter((i) => i.status === "resolved");
    } else if (filter.status === "suppressed") {
      result = result.filter((i) => i.status === "suppressed");
    }
  }

  if (filter.opdCode) {
    result = result.filter((i) => i.opdCode.toLowerCase() === filter.opdCode?.toLowerCase());
  }

  if (filter.severity) {
    result = result.filter((i) => i.severity === filter.severity);
  }

  if (filter.searchQuery && filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(
      (i) =>
        i.appName.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.ticketNumber.toLowerCase().includes(q) ||
        i.opdName.toLowerCase().includes(q)
    );
  }

  return result;
}

/**
 * Get active incident count for sidebar badge.
 *
 * // TODO(backend): replace with fetch to `/api/incidents/stats`
 */
export async function getActiveIncidentCount(): Promise<number> {
  const incidents = await getIncidents();
  return incidents.filter((i) => i.status === "open" || i.status === "investigating").length;
}

/**
 * Update status or add notes to an incident.
 *
 * // TODO(backend): replace with PATCH to `/api/incidents/:id`
 * Payload: { status?: IncidentStatus; note?: string }
 */
export async function updateIncidentStatus(
  id: string,
  newStatus: IncidentStatus,
  note?: string
): Promise<Incident | null> {
  await new Promise((r) => setTimeout(r, 80));

  const target = mockIncidents.find((i) => i.id === id);
  if (!target) return null;

  target.status = newStatus;
  if (note) {
    const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    target.timeline.push({ time: nowStr, note });
  }

  return { ...target };
}
