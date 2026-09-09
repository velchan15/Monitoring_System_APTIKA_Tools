export type ReportPeriod = "daily" | "weekly" | "monthly";

export interface UptimeReportItem {
  id: string;
  appId: string;
  appName: string;
  opdName: string;
  opdCode: string;
  uptimePercent: number;
  totalDowntimeFormatted: string;
  totalDowntimeMinutes: number;
  incidentCount: number;
  slaAdherence: "compliant" | "at_risk" | "breached";
  slaTargetPercent: number;
}

export interface DisruptionCauseBreakdown {
  cause: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DisruptionTrendPoint {
  periodLabel: string;
  incidentCount: number;
  avgDurationMinutes: number;
  totalDowntimeHours: number;
}

export interface DisruptionReportItem {
  id: string;
  ticketNumber: string;
  appName: string;
  opdName: string;
  causeCategory: "Timeout" | "SSL Expired" | "SSL Certificate Expired" | "DNS Error" | "DNS Resolution Error" | "Database Deadlock" | "Gateway 504" | "Gateway Timeout (504)" | "Network Spike" | "HTTP 5xx Server Error" | string;
  startedAt: string;
  resolvedAt: string;
  durationMinutes: number;
  impactLevel: "critical" | "major" | "minor";
  rootCause: string;
}
