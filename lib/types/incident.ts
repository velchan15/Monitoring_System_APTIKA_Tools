export type IncidentSeverity = "critical" | "major" | "minor" | "info";
export type IncidentStatus = "open" | "investigating" | "resolved" | "suppressed";

export interface IncidentTimelineItem {
  time: string;
  note: string;
}

export interface Incident {
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
  timeline: IncidentTimelineItem[];
}

export interface IncidentFilter {
  status?: "all" | "active" | "resolved" | "suppressed";
  opdCode?: string;
  severity?: IncidentSeverity;
  searchQuery?: string;
}
