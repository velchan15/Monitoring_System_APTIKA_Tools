import { ExportHistoryItem, ExportRequest } from "@/lib/types/export";

export const mockExportHistory: ExportHistoryItem[] = [
  {
    id: "exp-01", fileName: "Laporan_Uptime_Agustus_2026_Semua_OPD.xlsx",
    reportType: "uptime", reportTypeLabel: "Laporan Uptime",
    format: "xlsx", dateRange: "01 - 31 Agu 2026", opdLabel: "Semua OPD",
    createdAt: "29 Agu 2026, 08:15 WIB", fileSizeBytes: 215040, fileSizeFormatted: "210 KB",
    status: "completed",
  },
  {
    id: "exp-02", fileName: "Laporan_Gangguan_Agustus_2026_DISKOMINFO.pdf",
    reportType: "disruption", reportTypeLabel: "Laporan Gangguan",
    format: "pdf", dateRange: "01 - 29 Agu 2026", opdLabel: "Diskominfo Jabar",
    createdAt: "29 Agu 2026, 07:55 WIB", fileSizeBytes: 1254400, fileSizeFormatted: "1.2 MB",
    status: "completed",
  },
  {
    id: "exp-03", fileName: "Audit_SSL_Certificates_Q3_2026.csv",
    reportType: "ssl", reportTypeLabel: "Sertifikat SSL",
    format: "csv", dateRange: "Jul - Sep 2026", opdLabel: "Semua OPD",
    createdAt: "27 Agu 2026, 15:30 WIB", fileSizeBytes: 45056, fileSizeFormatted: "44 KB",
    status: "completed",
  },
  {
    id: "exp-04", fileName: "Laporan_Uptime_Juli_2026_DINKES.xlsx",
    reportType: "uptime", reportTypeLabel: "Laporan Uptime",
    format: "xlsx", dateRange: "01 - 31 Jul 2026", opdLabel: "Dinas Kesehatan",
    createdAt: "01 Agu 2026, 09:00 WIB", fileSizeBytes: 87040, fileSizeFormatted: "85 KB",
    status: "completed",
  },
  {
    id: "exp-05", fileName: "Laporan_Gangguan_Juli_2026_Semua_OPD.pdf",
    reportType: "disruption", reportTypeLabel: "Laporan Gangguan",
    format: "pdf", dateRange: "01 - 31 Jul 2026", opdLabel: "Semua OPD",
    createdAt: "31 Jul 2026, 23:59 WIB", fileSizeBytes: 982016, fileSizeFormatted: "959 KB",
    status: "failed",
  },
];

/**
 * Fetch export history.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/exports/history`
 */
export async function getExportHistory(): Promise<ExportHistoryItem[]> {
  await new Promise((r) => setTimeout(r, 70));
  return mockExportHistory;
}

/**
 * Simulate report export generation.
 *
 * // TODO(backend): replace this function body with a POST to `/api/exports/generate`
 * Expected payload: ExportRequest (see lib/types/export.ts)
 * Expected response: { jobId: string; estimatedSeconds: number }
 */
export async function generateExportReport(request: ExportRequest): Promise<{ jobId: string; success: boolean }> {
  // Simulating backend export job creation with a delay
  await new Promise((r) => setTimeout(r, 1500));

  // Simulate ~10% failure rate for realism
  if (Math.random() < 0.1) {
    return { jobId: "", success: false };
  }

  const jobId = `EXP-${Date.now()}`;

  // Simulate adding to history (frontend only, real backend will persist)
  mockExportHistory.unshift({
    id: jobId,
    fileName: `Laporan_${request.reportType}_${new Date().getFullYear()}_${request.opdCode || "Semua_OPD"}.${request.format}`,
    reportType: request.reportType,
    reportTypeLabel: request.reportType === "uptime" ? "Laporan Uptime" : request.reportType === "disruption" ? "Laporan Gangguan" : "Sertifikat SSL",
    format: request.format,
    dateRange: `${request.startDate} - ${request.endDate}`,
    opdLabel: request.opdCode || "Semua OPD",
    createdAt: new Date().toLocaleString("id-ID") + " WIB",
    fileSizeBytes: Math.floor(Math.random() * 900000) + 100000,
    fileSizeFormatted: "~ 200 KB",
    status: "completed",
  });

  return { jobId, success: true };
}
