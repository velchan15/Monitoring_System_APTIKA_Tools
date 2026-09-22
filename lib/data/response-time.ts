export type TimeRange = "24h" | "7d" | "30d";

export interface LatencySummary {
  appId: string;
  appName: string;
  opdCode: string;
  opdName: string;
  status: "normal" | "high" | "critical";
  currentLatency: number;
  avgLatency: number;
  maxLatency: number;
  p95Latency: number;
  thresholdMs: number;
  chartColor: string;
}

export const mockLatencySummaries: LatencySummary[] = [
  {
    appId: "app-1",
    appName: "Portal Resmi Jabarprov",
    opdCode: "DISKOMINFO",
    opdName: "Dinas Komunikasi dan Informatika",
    status: "normal",
    currentLatency: 42,
    avgLatency: 45,
    maxLatency: 89,
    p95Latency: 56,
    thresholdMs: 300,
    chartColor: "#10b981", // Emerald
  },
  {
    appId: "app-2",
    appName: "SIMPUS Jabar Online",
    opdCode: "DINKES",
    opdName: "Dinas Kesehatan",
    status: "critical",
    currentLatency: 3840,
    avgLatency: 1620,
    maxLatency: 4200,
    p95Latency: 3900,
    thresholdMs: 1000,
    chartColor: "#ef4444", // Red
  },
  {
    appId: "app-3",
    appName: "Portal Satu Data Jabar",
    opdCode: "DISKOMINFO",
    opdName: "Dinas Komunikasi dan Informatika",
    status: "normal",
    currentLatency: 58,
    avgLatency: 62,
    maxLatency: 118,
    p95Latency: 75,
    thresholdMs: 400,
    chartColor: "#3b82f6", // Blue
  },
  {
    appId: "app-4",
    appName: "Sistem Pajak Kendaraan (BAPENDA)",
    opdCode: "BAPENDA",
    opdName: "Badan Pendapatan Daerah",
    status: "high",
    currentLatency: 850,
    avgLatency: 620,
    maxLatency: 1200,
    p95Latency: 980,
    thresholdMs: 800,
    chartColor: "#f59e0b", // Amber
  },
  {
    appId: "app-5",
    appName: "Penerimaan Peserta Didik Baru (PPDB)",
    opdCode: "DISDIK",
    opdName: "Dinas Pendidikan",
    status: "normal",
    currentLatency: 120,
    avgLatency: 150,
    maxLatency: 350,
    p95Latency: 210,
    thresholdMs: 500,
    chartColor: "#8b5cf6", // Purple
  }
];

export function generateLatencyChartData(range: TimeRange, selectedIds: string[]) {
  const data: any[] = [];
  const now = new Date(); // Membaca waktu saat ini secara dinamis
  
  let points = 7;
  let intervalMs = 24 * 60 * 60 * 1000; // 1 Hari
  
  if (range === "24h") {
    points = 24;
    intervalMs = 60 * 60 * 1000; // 1 Jam
  } else if (range === "7d") {
    points = 7;
    intervalMs = 24 * 60 * 60 * 1000; // 1 Hari
  } else if (range === "30d") {
    points = 15; 
    intervalMs = 2 * 24 * 60 * 60 * 1000; // 2 Hari (agar grafik tidak terlalu padat)
  }

  // Generate data mundur dari hari ini
  for (let i = points; i >= 0; i--) {
    const d = new Date(now.getTime() - i * intervalMs);
    
    let timeLabel = "";
    if (range === "24h") {
      timeLabel = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } else {
      timeLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }

    const pointData: any = { timestamp: timeLabel };

    selectedIds.forEach((id) => {
      const app = mockLatencySummaries.find(a => a.appId === id);
      if (app) {
        // Membuat fluktuasi grafik yang terlihat natural
        let val = app.avgLatency + (Math.random() * 40 - 20);
        
        if (app.status === "critical" && Math.random() > 0.7) val += 1500;
        if (app.status === "high" && Math.random() > 0.8) val += 500;
        
        pointData[id] = Math.max(10, Math.round(val));
      }
    });

    data.push(pointData);
  }

  return data;
}