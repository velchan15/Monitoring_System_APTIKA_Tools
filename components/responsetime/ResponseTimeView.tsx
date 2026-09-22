"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Activity, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { initialOpdSummaries } from "@/lib/dashboard-data";
import { API_URL } from "@/lib/api";

const RANGE_LABELS: Record<string, string> = {
  "24h": "24 Jam Terakhir",
  "7d": "7 Hari Terakhir",
  "30d": "30 Hari Terakhir",
};

const STATUS_CFG = {
  normal: { label: "Normal", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  high: { label: "Tinggi", class: "bg-amber-100 text-amber-800 border-amber-200" },
  critical: { label: "Kritis", class: "bg-red-100 text-red-700 border-red-200" },
};

const CHART_COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

// Fungsi generator grafik dinamis (sekarang berada di dalam komponen)
function generateDynamicChartData(range: string, selectedApps: any[]) {
  const data: any[] = [];
  const now = new Date();
  
  let points = 7;
  let intervalMs = 24 * 60 * 60 * 1000;
  
  if (range === "24h") { points = 24; intervalMs = 60 * 60 * 1000; }
  else if (range === "7d") { points = 7; intervalMs = 24 * 60 * 60 * 1000; }
  else if (range === "30d") { points = 15; intervalMs = 2 * 24 * 60 * 60 * 1000; }

  for (let i = points; i >= 0; i--) {
    const d = new Date(now.getTime() - i * intervalMs);
    let timeLabel = range === "24h" 
      ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    const pointData: any = { timestamp: timeLabel };

    selectedApps.forEach((app) => {
      let val = app.avgLatency + (Math.random() * 40 - 20);
      if (app.status === "critical" && Math.random() > 0.7) val += 1500;
      if (app.status === "high" && Math.random() > 0.8) val += 500;
      pointData[app.appId] = Math.max(10, Math.round(val));
    });

    data.push(pointData);
  }
  return data;
}

export function ResponseTimeView() {
  const [range, setRange] = useState<string>("7d");
  const [searchQuery, setSearchQuery] = useState("");
  const [opdFilter, setOpdFilter] = useState("all");
  
  const [allAppsData, setAllAppsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());

  // Menarik 329 data aplikasi asli dari backend API
  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/applications`)
      .then(res => res.json())
      .then(json => {
        const data = json.data || json;
        
        // Memformat data asli dan membuat simulasi angka latensi yang realistis
        const formatted = data.map((app: any, index: number) => {
          const isOffline = app.status === "OFFLINE";
          const isWarning = app.status === "WARNING";
          
          const baseAvg = isOffline ? 3000 + Math.random() * 2000 : (isWarning ? 800 + Math.random() * 500 : 40 + Math.random() * 150);
          const maxL = baseAvg + (Math.random() * baseAvg * 0.5);
          const p95L = baseAvg + (Math.random() * baseAvg * 0.2);
          
          return {
            appId: String(app.id),
            appName: app.name || `Aplikasi ID #${app.id}`,
            opdCode: app.department?.code || "JBR",
            opdName: app.department?.name || "Provinsi Jawa Barat",
            status: isOffline ? "critical" : isWarning ? "high" : "normal",
            currentLatency: isOffline ? 0 : Math.round(baseAvg + (Math.random() * 20 - 10)),
            avgLatency: Math.round(baseAvg),
            maxLatency: Math.round(maxL),
            p95Latency: Math.round(p95L),
            thresholdMs: isOffline ? 1000 : isWarning ? 800 : 300,
            chartColor: CHART_COLORS[index % CHART_COLORS.length]
          };
        });
        
        setAllAppsData(formatted);
        
        // Secara otomatis memilih 3 aplikasi teratas (jika ada) saat pertama kali dimuat
        if (formatted.length > 0) {
          setSelectedAppIds(new Set(formatted.slice(0, 3).map((a: any) => a.appId)));
        }
      })
      .catch(err => console.error("Gagal fetch data untuk Response Time:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredSummaries = useMemo(() => {
    let result = allAppsData;
    if (opdFilter !== "all") result = result.filter((a) => a.opdCode === opdFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.appName.toLowerCase().includes(q) || a.opdName.toLowerCase().includes(q));
    }
    return result;
  }, [allAppsData, opdFilter, searchQuery]);

  const selectedIds = Array.from(selectedAppIds).filter((id) => filteredSummaries.some((a) => a.appId === id));
  const selectedApps = allAppsData.filter((a) => selectedAppIds.has(a.appId));
  
  const chartData = useMemo(() => generateDynamicChartData(range, selectedApps), [range, selectedApps]);

  const toggleApp = (appId: string) => {
    setSelectedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) { if (next.size > 1) next.delete(appId); }
      else { if (next.size < 5) next.add(appId); }
      return next;
    });
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg text-xs">
        <p className="font-bold text-ink mb-1.5">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 py-0.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-ink/70 max-w-[150px] truncate">{p.name}</span>
            <span className="font-mono font-bold text-ink ml-auto">{p.value}ms</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Tren Waktu Respons Aplikasi</h2>
            <p className="text-xs text-ink/45">{RANGE_LABELS[range]} — Bandingkan latensi antara beberapa aplikasi sekaligus</p>
          </div>
          <div className="sm:ml-auto flex items-center gap-1 rounded-lg border border-border bg-canvas p-0.5">
            {(Object.keys(RANGE_LABELS)).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", range === r ? "bg-white text-brand shadow-sm" : "text-ink/50 hover:text-ink")}
              >
                {r === "24h" ? "24 Jam" : r === "7d" ? "7 Hari" : "30 Hari"}
              </button>
            ))}
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis unit="ms" tick={{ fontSize: 10, fill: "#94a3b8" }} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                {selectedApps.map((app) => (
                  <Line
                    key={app.appId}
                    type="monotone"
                    dataKey={app.appId}
                    name={app.appName.split(" ").slice(0, 3).join(" ")}
                    stroke={app.chartColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-ink/40 text-xs">Pilih minimal satu aplikasi dari tabel di bawah untuk ditampilkan.</div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-border">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40" />
            <input
              type="text"
              placeholder="Cari aplikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-canvas/40 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>
          <select
            value={opdFilter}
            onChange={(e) => setOpdFilter(e.target.value)}
            className="rounded-lg border border-border bg-canvas/40 py-1.5 px-3 text-xs text-ink focus:border-brand focus:outline-none cursor-pointer"
          >
            <option value="all">Semua OPD</option>
            {initialOpdSummaries.map((opd) => (
              <option key={opd.code} value={opd.code}>{opd.shortName}</option>
            ))}
          </select>
          <p className="text-xs text-ink/50 ml-auto">Pilih maks. 5 aplikasi untuk dibandingkan di grafik</p>
        </div>

        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-10 gap-2 text-ink/50">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
              <span className="text-xs font-medium">Memuat data latensi aplikasi...</span>
           </div>
        ) : filteredSummaries.length === 0 ? (
          <EmptyState className="m-4" title="Tidak ada data ditemukan" icon={Activity} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-canvas/60">
                  <th className="px-4 py-3 w-8"></th>
                  {["Aplikasi", "OPD", "Latensi Saat Ini", "Rata-rata", "Maks", "P95", "Ambang Batas", "Status"].map((h) => (
                    <th key={h} className="px-3 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSummaries.map((app) => {
                  const isSelected = selectedAppIds.has(app.appId);
                  const statusCfg = STATUS_CFG[app.status as keyof typeof STATUS_CFG] || STATUS_CFG.normal;
                  return (
                    <tr
                      key={app.appId}
                      className={cn("hover:bg-canvas/40 transition-colors cursor-pointer", isSelected ? "bg-brand-soft/30" : "")}
                      onClick={() => toggleApp(app.appId)}
                    >
                      <td className="px-4 py-3">
                        <div className={cn("h-3.5 w-3.5 rounded border-2 transition-colors", isSelected ? "border-brand bg-brand" : "border-slate-300")} />
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-ink line-clamp-1">{app.appName}</p>
                      </td>
                      <td className="px-3 py-3 text-ink/60">{app.opdCode}</td>
                      <td className="px-3 py-3">
                        <span className={cn("font-mono font-bold text-sm", app.status === "critical" ? "text-status-offline" : app.status === "high" ? "text-status-warning" : "text-status-online")}>
                          {app.currentLatency === 0 ? "Timeout" : `${app.currentLatency}ms`}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-ink/70">{app.avgLatency}ms</td>
                      <td className="px-3 py-3 font-mono text-ink/70">{app.maxLatency}ms</td>
                      <td className="px-3 py-3 font-mono text-ink/70">{app.p95Latency}ms</td>
                      <td className="px-3 py-3 font-mono text-ink/50">{app.thresholdMs}ms</td>
                      <td className="px-3 py-3">
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", statusCfg.class)}>
                          {app.status === "normal" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}