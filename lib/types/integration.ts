export type IntegrationStatus = "connected" | "degraded" | "disconnected" | "syncing";

export interface IntegrationItem {
  id: string;
  name: string;
  category: "Catalog" | "Messaging" | "Email" | "API Gateway";
  description: string;
  status: IntegrationStatus;
  lastSyncAt: string;
  endpointOrTarget: string;
  syncIntervalMinutes: number;
  configFields: {
    key: string;
    label: string;
    value: string;
    isSecret: boolean;
  }[];
}
