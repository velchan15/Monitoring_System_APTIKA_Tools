export type TimeRange = "24h" | "7d" | "30d";

export interface LatencyDataPoint {
  timestamp: string;
  [appKey: string]: number | string; // dynamic mapping per app key: response time in ms
}

export interface AppLatencySummary {
  appId: string;
  appName: string;
  opdName: string;
  opdCode: string;
  currentLatency: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p95Latency: number;
  thresholdMs: number;
  status: "normal" | "high" | "critical";
  chartColor: string;
}

export interface ResponseTimeFilter {
  range: TimeRange;
  selectedAppIds: string[];
  opdCode?: string;
  searchQuery?: string;
}
