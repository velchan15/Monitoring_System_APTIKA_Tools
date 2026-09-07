export type AuditActionType =
  | "create"
  | "update"
  | "delete"
  | "resolve"
  | "auth"
  | "export"
  | "sync";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  userRole: string;
  actionType: AuditActionType;
  actionTitle: string;
  targetEntity: string;
  ipAddress: string;
  details?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    summary?: string;
  };
}

export interface AuditFilter {
  actionType?: "all" | AuditActionType;
  userEmail?: string;
  searchQuery?: string;
  dateRange?: string;
}
