export type AppStatus = "online" | "warning" | "offline" | "maintenance";

export interface Application {
  id: string;
  name: string;
  url: string;
  opdName: string;
  opdCode: string;
  status: AppStatus;
  currentLatencyMs: number;
  uptime30Days: number;
  uptime90Days: number;
  sslStatus: "valid" | "warning" | "expired";
  sslExpiryDays: number;
  sslIssuer: string;
  checkInterval: string;
  lastChecked: string;
}

export interface ApplicationFilter {
  opdCode?: string;
  status?: AppStatus | "all";
  searchQuery?: string;
}
