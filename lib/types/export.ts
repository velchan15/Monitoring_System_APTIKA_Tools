export type ExportReportType = "uptime" | "disruption" | "ssl";
export type ExportFormat = "pdf" | "xlsx" | "csv";
export type ExportStatus = "completed" | "processing" | "failed";

export interface ExportRequest {
  reportType: ExportReportType;
  startDate: string;
  endDate: string;
  format: ExportFormat;
  opdCode?: string;
  includeRawLogs?: boolean;
}

export interface ExportHistoryItem {
  id: string;
  fileName: string;
  reportType: ExportReportType;
  reportTypeLabel: string;
  format: ExportFormat;
  dateRange: string;
  opdLabel: string;
  createdAt: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  status: ExportStatus;
  downloadUrl?: string;
}
