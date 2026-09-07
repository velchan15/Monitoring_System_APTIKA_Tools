import {
  AppLatencySummary,
  LatencyDataPoint,
  ResponseTimeFilter,
  TimeRange,
} from "@/lib/types/response-time";

export const mockLatencySummaries: AppLatencySummary[] = [
  {
    appId: "srv-01",
    appName: "Portal Resmi Jabarprov",
    opdName: "Dinas Komunikasi dan Informatika",
    opdCode: "DISKOMINFO",
    currentLatency: 42,
    avgLatency: 45,
    minLatency: 32,
    maxLatency: 88,
    p95Latency: 56,
    thresholdMs: 300,
    status: "normal",
    chartColor: "#0E9F6E", // Green
  },
  {
    appId: "srv-03",
    appName: "SIMPUS Jabar Online",
    opdName: "Dinas Kesehatan",
    opdCode: "DINKES",
    currentLatency: 3840,
    avgLatency: 1620,
    minLatency: 280,
    maxLatency: 4200,
    p95Latency: 3900,
    thresholdMs: 1000,
    status: "critical",
    chartColor: "#DC2626", // Red
  },
  {
    appId: "srv-04",
    appName: "Portal Satu Data Jabar",
    opdName: "Dinas Komunikasi dan Informatika",
    opdCode: "DISKOMINFO",
    currentLatency: 58,
    avgLatency: 62,
    minLatency: 40,
    maxLatency: 110,
    p95Latency: 75,
    thresholdMs: 400,
    status: "normal",
    chartColor: "#2451B0", // Blue
  },
  {
    appId: "srv-05",
    appName: "e-SAMSAT Jabar Mobile",
    opdName: "Badan Pendapatan Daerah",
    opdCode: "BAPENDA",
    currentLatency: 64,
    avgLatency: 68,
    minLatency: 45,
    maxLatency: 140,
    p95Latency: 82,
    thresholdMs: 500,
    status: "normal",
    chartColor: "#7C5CFC", // Purple
  },
  {
    appId: "srv-07",
    appName: "SIMPATIK Penanaman Modal",
    opdName: "DPMPTSP Jabar",
    opdCode: "DPMPTSP",
    currentLatency: 1420,
    avgLatency: 950,
    minLatency: 110,
    maxLatency: 1850,
    p95Latency: 1540,
    thresholdMs: 800,
    status: "high",
    chartColor: "#D97706", // Amber
  },
  {
    appId: "srv-09",
    appName: "SIPD Keuangan & Aset",
    opdName: "BPKAD Jabar",
    opdCode: "BPKAD",
    currentLatency: 76,
    avgLatency: 82,
    minLatency: 52,
    maxLatency: 195,
    p95Latency: 98,
    thresholdMs: 500,
    status: "normal",
    chartColor: "#0284C7", // Sky
  },
];

// Generate time-series data for the selected range
export function generateLatencyChartData(range: TimeRange, appIds: string[]): LatencyDataPoint[] {
  const points: LatencyDataPoint[] = [];

  let count = 24;
  if (range === "7d") count = 7;
  if (range === "30d") count = 15;

  for (let i = count - 1; i >= 0; i--) {
    let timestamp = "";
    if (range === "24h") {
      const hour = (24 - i) % 24;
      timestamp = `${String(hour).padStart(2, "0")}:00`;
    } else if (range === "7d") {
      const d = new Date(2026, 7, 29);
      d.setDate(d.getDate() - i);
      timestamp = `${d.getDate()} Agu`;
    } else {
      const d = new Date(2026, 7, 29);
      d.setDate(d.getDate() - i * 2);
      timestamp = `${d.getDate()} Agu`;
    }

    const point: LatencyDataPoint = { timestamp };

    appIds.forEach((id) => {
      const app = mockLatencySummaries.find((a) => a.appId === id);
      if (app) {
        // Create realistic variation
        const jitter = Math.sin(i * 0.8) * (app.avgLatency * 0.15) + (Math.random() * 8 - 4);
        point[id] = Math.max(20, Math.round(app.avgLatency + jitter));
      }
    });

    points.push(point);
  }

  return points;
}

/**
 * Fetch response time summaries and multi-line chart data.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/metrics/latency`
 * Contract: see ResponseTimeFilter in lib/types/response-time.ts
 */
export async function getResponseTimeData(filter: ResponseTimeFilter): Promise<{
  summaries: AppLatencySummary[];
  chartData: LatencyDataPoint[];
}> {
  await new Promise((r) => setTimeout(r, 60));

  let filteredSummaries = [...mockLatencySummaries];

  if (filter.opdCode) {
    filteredSummaries = filteredSummaries.filter(
      (s) => s.opdCode.toLowerCase() === filter.opdCode?.toLowerCase()
    );
  }

  if (filter.searchQuery && filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase();
    filteredSummaries = filteredSummaries.filter(
      (s) => s.appName.toLowerCase().includes(q) || s.opdName.toLowerCase().includes(q)
    );
  }

  const selectedIds = filter.selectedAppIds.length > 0
    ? filter.selectedAppIds
    : filteredSummaries.slice(0, 3).map((s) => s.appId);

  const chartData = generateLatencyChartData(filter.range, selectedIds);

  return {
    summaries: filteredSummaries,
    chartData,
  };
}
