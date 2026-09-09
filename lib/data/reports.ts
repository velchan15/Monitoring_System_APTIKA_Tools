import { UptimeReportItem, DisruptionCauseBreakdown, DisruptionReportItem, DisruptionTrendPoint } from "@/lib/types/report";

// ==========================================
// MOCK UPTIME REPORT DATA
// ==========================================
export const mockUptimeReports: UptimeReportItem[] = [
  {
    id: "urpt-01", appId: "srv-01",
    appName: "Portal Resmi Jabarprov.go.id", opdName: "Dinas Komunikasi dan Informatika", opdCode: "DISKOMINFO",
    uptimePercent: 99.98, totalDowntimeFormatted: "0 jam 5 menit", totalDowntimeMinutes: 5,
    incidentCount: 0, slaAdherence: "compliant", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-02", appId: "srv-02",
    appName: "SIPD-Kependudukan Terpadu (API Master)", opdName: "Dinas Kependudukan dan Pencatatan Sipil", opdCode: "DISDUKCAPIL",
    uptimePercent: 98.42, totalDowntimeFormatted: "11 jam 12 menit", totalDowntimeMinutes: 672,
    incidentCount: 2, slaAdherence: "breached", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-03", appId: "srv-03",
    appName: "SIMPUS Jabar Online (Sistem Puskesmas)", opdName: "Dinas Kesehatan", opdCode: "DINKES",
    uptimePercent: 99.12, totalDowntimeFormatted: "6 jam 18 menit", totalDowntimeMinutes: 378,
    incidentCount: 3, slaAdherence: "breached", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-04", appId: "srv-04",
    appName: "Portal Satu Data Jawa Barat", opdName: "Dinas Komunikasi dan Informatika", opdCode: "DISKOMINFO",
    uptimePercent: 99.94, totalDowntimeFormatted: "0 jam 26 menit", totalDowntimeMinutes: 26,
    incidentCount: 0, slaAdherence: "compliant", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-05", appId: "srv-05",
    appName: "e-SAMSAT Jabar (Layanan Pajak Kendaraan)", opdName: "Badan Pendapatan Daerah", opdCode: "BAPENDA",
    uptimePercent: 99.89, totalDowntimeFormatted: "0 jam 47 menit", totalDowntimeMinutes: 47,
    incidentCount: 1, slaAdherence: "compliant", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-06", appId: "srv-06",
    appName: "PPDB Online Jabar (Portal Pendaftaran Siswa)", opdName: "Dinas Pendidikan", opdCode: "DISDIK",
    uptimePercent: 99.99, totalDowntimeFormatted: "0 jam 1 menit", totalDowntimeMinutes: 1,
    incidentCount: 0, slaAdherence: "compliant", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-07", appId: "srv-07",
    appName: "SIMPATIK (Sistem Informasi Penanaman Modal)", opdName: "DPMPTSP Provinsi Jawa Barat", opdCode: "DPMPTSP",
    uptimePercent: 99.25, totalDowntimeFormatted: "5 jam 27 menit", totalDowntimeMinutes: 327,
    incidentCount: 2, slaAdherence: "at_risk", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-08", appId: "srv-08",
    appName: "Portal PPID Terbuka Pemprov Jabar", opdName: "Dinas Komunikasi dan Informatika", opdCode: "DISKOMINFO",
    uptimePercent: 99.78, totalDowntimeFormatted: "1 jam 34 menit", totalDowntimeMinutes: 94,
    incidentCount: 1, slaAdherence: "compliant", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-09", appId: "srv-09",
    appName: "SIPD Keuangan & Aset Daerah", opdName: "Badan Pengelola Keuangan dan Aset Daerah", opdCode: "BPKAD",
    uptimePercent: 99.65, totalDowntimeFormatted: "2 jam 31 menit", totalDowntimeMinutes: 151,
    incidentCount: 1, slaAdherence: "compliant", slaTargetPercent: 99.5,
  },
  {
    id: "urpt-10", appId: "srv-10",
    appName: "SiCakep (Sistem Kepegawaian & Kinerja ASN)", opdName: "Badan Kepegawaian Daerah", opdCode: "BKD",
    uptimePercent: 98.10, totalDowntimeFormatted: "13 jam 41 menit", totalDowntimeMinutes: 821,
    incidentCount: 3, slaAdherence: "breached", slaTargetPercent: 99.5,
  },
];

// ==========================================
// MOCK DISRUPTION REPORT DATA
// ==========================================
export const mockDisruptionCauses: DisruptionCauseBreakdown[] = [
  { cause: "Database Deadlock", count: 4, percentage: 36.4, color: "#DC2626" },
  { cause: "Gateway Timeout (504)", count: 3, percentage: 27.3, color: "#D97706" },
  { cause: "SSL Certificate Expired", count: 2, percentage: 18.2, color: "#7C5CFC" },
  { cause: "DNS Resolution Error", count: 1, percentage: 9.1, color: "#0284C7" },
  { cause: "HTTP 5xx Server Error", count: 1, percentage: 9.1, color: "#64748B" },
];

export const mockDisruptionTrend: DisruptionTrendPoint[] = [
  { periodLabel: "Mar 2026", incidentCount: 8, avgDurationMinutes: 48, totalDowntimeHours: 6.4 },
  { periodLabel: "Apr 2026", incidentCount: 6, avgDurationMinutes: 55, totalDowntimeHours: 5.5 },
  { periodLabel: "Mei 2026", incidentCount: 9, avgDurationMinutes: 42, totalDowntimeHours: 6.3 },
  { periodLabel: "Jun 2026", incidentCount: 5, avgDurationMinutes: 38, totalDowntimeHours: 3.2 },
  { periodLabel: "Jul 2026", incidentCount: 7, avgDurationMinutes: 61, totalDowntimeHours: 7.1 },
  { periodLabel: "Agu 2026", incidentCount: 11, avgDurationMinutes: 44, totalDowntimeHours: 8.1 },
];

export const mockDisruptionHistory: DisruptionReportItem[] = [
  {
    id: "disr-01", ticketNumber: "INC-2026-0829-01",
    appName: "SIPD-Kependudukan Terpadu", opdName: "Dinas Kependudukan dan Pencatatan Sipil",
    causeCategory: "Database Deadlock",
    startedAt: "29 Agu 2026, 07:15 WIB", resolvedAt: "29 Agu 2026, 09:30 WIB",
    durationMinutes: 135, impactLevel: "critical",
    rootCause: "Connection spike akibat batch NIK sync ke cluster-02.",
  },
  {
    id: "disr-02", ticketNumber: "INC-2026-0829-02",
    appName: "SIMPUS Jabar Online", opdName: "Dinas Kesehatan",
    causeCategory: "Database Deadlock",
    startedAt: "29 Agu 2026, 06:40 WIB", resolvedAt: "29 Agu 2026, 10:30 WIB",
    durationMinutes: 230, impactLevel: "critical",
    rootCause: "Index query pasien belum di-vacuum setelah migrasi data faskes baru.",
  },
  {
    id: "disr-03", ticketNumber: "INC-2026-0828-09",
    appName: "Portal PPID Terbuka", opdName: "Dinas Komunikasi dan Informatika",
    causeCategory: "SSL Certificate Expired",
    startedAt: "28 Agu 2026, 14:00 WIB", resolvedAt: "29 Agu 2026, 08:00 WIB",
    durationMinutes: 1080, impactLevel: "major",
    rootCause: "DNS hook API token expired, ACME bot gagal renew SSL otomatis.",
  },
  {
    id: "disr-04", ticketNumber: "INC-2026-0827-11",
    appName: "SIPD Akuntansi & Pelaporan", opdName: "Badan Pengelola Keuangan dan Aset Daerah",
    causeCategory: "Gateway 504",
    startedAt: "27 Agu 2026, 11:30 WIB", resolvedAt: "27 Agu 2026, 12:45 WIB",
    durationMinutes: 75, impactLevel: "major",
    rootCause: "Konfigurasi proxy_read_timeout Nginx terlalu ketat (60s).",
  },
  {
    id: "disr-05", ticketNumber: "INC-2026-0825-05",
    appName: "SIMPATIK Perizinan Online", opdName: "DPMPTSP Provinsi Jawa Barat",
    causeCategory: "Timeout",
    startedAt: "25 Agu 2026, 09:00 WIB", resolvedAt: "25 Agu 2026, 14:30 WIB",
    durationMinutes: 330, impactLevel: "major",
    rootCause: "Lonjakan request izin usaha saat peak-hour menyebabkan worker thread exhaustion.",
  },
];

/**
 * Fetch uptime report items.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/reports/uptime`
 * Query params: ?period=daily|weekly|monthly&opdCode=...&startDate=...&endDate=...
 */
export async function getUptimeReports(params?: {
  opdCode?: string;
  searchQuery?: string;
}): Promise<UptimeReportItem[]> {
  await new Promise((r) => setTimeout(r, 80));
  let result = [...mockUptimeReports];
  if (params?.opdCode) {
    result = result.filter((r) => r.opdCode.toLowerCase() === params.opdCode?.toLowerCase());
  }
  if (params?.searchQuery?.trim()) {
    const q = params.searchQuery.toLowerCase();
    result = result.filter(
      (r) => r.appName.toLowerCase().includes(q) || r.opdName.toLowerCase().includes(q)
    );
  }
  return result;
}

/**
 * Fetch disruption causes breakdown.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/reports/disruption/causes`
 */
export async function getDisruptionCauses(): Promise<DisruptionCauseBreakdown[]> {
  await new Promise((r) => setTimeout(r, 60));
  return mockDisruptionCauses;
}

/**
 * Fetch disruption trend data.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/reports/disruption/trend`
 */
export async function getDisruptionTrend(): Promise<DisruptionTrendPoint[]> {
  await new Promise((r) => setTimeout(r, 60));
  return mockDisruptionTrend;
}

/**
 * Fetch disruption history.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/reports/disruption/history`
 */
export async function getDisruptionHistory(params?: {
  opdCode?: string;
  searchQuery?: string;
}): Promise<DisruptionReportItem[]> {
  await new Promise((r) => setTimeout(r, 80));
  let result = [...mockDisruptionHistory];
  if (params?.opdCode) {
    result = result.filter((r) => r.opdName.toLowerCase().includes(params.opdCode!.toLowerCase()));
  }
  if (params?.searchQuery?.trim()) {
    const q = params.searchQuery.toLowerCase();
    result = result.filter(
      (r) => r.appName.toLowerCase().includes(q) || r.rootCause.toLowerCase().includes(q)
    );
  }
  return result;
}
