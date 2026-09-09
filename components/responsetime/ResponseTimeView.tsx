"use client";

import { useState, useMemo } from "react";
import { Search, Activity, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { mockLatencySummaries, generateLatencyChartData } from "@/lib/data/response-time";
import type { TimeRange } from "@/lib/types/response-time";
import { EmptyState } from "@/components/ui/EmptyState";
import { initialOpdSummaries } from "@/lib/dashboard-data";

const RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24 Jam Terakhir",
  "7d": "7 Hari Terakhir",
  "30d": "30 Hari Terakhir",
};

const STATUS_CFG = {
  normal: { label: "Normal", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  high: { label: "Tinggi", class: "bg-amber-100 text-amber-800 border-amber-200" },
  critical: { label: "Kritis", class: "bg-red-100 text-red-700 border-red-200" },
};

export function ResponseTimeView() {
  const [range, setRange] = useState<TimeRange>("7d");
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(
    new Set(mockLatencySummaries.slice(0, 3).map((a) => a.appId))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [opdFilter, setOpdFilter] = useState("all");

  const filteredSummaries = useMemo(() => {
    let result = mockLatencySummaries;
    if (opdFilter !== "all") result = result.filter((a) => a.opdCode === opdFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.appName.toLowerCase().includes(q) || a.opdName.toLowerCase().includes(q));
    }
    return result;
  }, [opdFilter, searchQuery]);

  const selectedIds = Array.from(selectedAppIds).filter((id) => filteredSummaries.some((a) => a.appId === id));
  const chartData = useMemo(() => generateLatencyChartData(range, selectedIds), [range, selectedIds]);

  const toggleApp = (appId: string) => {
    setSelectedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) { if (next.size > 1) next.delete(appId); }
      else { if (next.size < 5) next.add(appId); }
      return next;
    });
  };

  const selectedApps = mockLatencySummaries.filter((a) => selectedAppIds.has(a.appId));

  // Custom tooltip for Recharts
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
      {/* Chart Card */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Tren Waktu Respons Aplikasi</h2>
            <p className="text-xs text-ink/45">{RANGE_LABELS[range]} — Bandingkan latensi antara beberapa aplikasi sekaligus</p>
          </div>
          <div className="sm:ml-auto flex items-center gap-1 rounded-lg border border-border bg-canvas p-0.5">
            {(Object.keys(RANGE_LABELS) as TimeRange[]).map((r) => (
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

      {/* Filter & Table */}
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

        {filteredSummaries.length === 0 ? (
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
