"use client";

import { useState } from "react";
import { Building2, ChevronRight } from "lucide-react";

import { initialOpdSummaries } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

// ---- Compact OPD row for Dashboard ----
interface DashboardOpdProps {
  onViewAll?: () => void;
}

export function DashboardOpdSummary({ onViewAll }: DashboardOpdProps) {
  const opds = initialOpdSummaries;

  return (
    <div className="rounded-xl border border-border bg-white shadow-2xs">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-ink">Ringkasan per Perangkat Daerah</h2>
        {onViewAll && (
          <button type="button" onClick={onViewAll} className="flex items-center gap-0.5 text-xs font-semibold text-brand hover:underline">
            Lihat Semua PD <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-0 border-t border-border sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {opds.map((opd, idx) => {
          const bgClass = opd.healthStatus === "critical"
            ? "bg-red-50/40"
            : opd.healthStatus === "warning"
            ? "bg-amber-50/30"
            : "";

          return (
            <button
              key={opd.code}
              type="button"
              // LANGKAH 2: Membuka detail di Tab Baru
              onClick={() => window.open(`/opd/${opd.code}`, "_blank")}
              className={cn(
                "flex flex-col items-start gap-0.5 p-3 text-left transition-colors hover:bg-canvas/70 border-b border-r border-border/60",
                bgClass
              )}
            >
              {/* Icon + Name */}
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-brand" />
                <span className="text-[11px] font-bold text-ink">{opd.shortName.replace(/Dinas |Badan |DPMPTSP |BKD/, "")}</span>
              </div>
              <p className="text-[10px] text-ink/45">{opd.totalApps} Aplikasi</p>

              {/* Mini bars */}
              <div className="mt-1.5 flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-online" />
                  <span className="font-mono text-[10px] font-semibold text-status-online">{opd.onlineApps}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-warning" />
                  <span className="font-mono text-[10px] font-semibold text-status-warning">{opd.warningApps}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-offline" />
                  <span className="font-mono text-[10px] font-semibold text-status-offline">{opd.offlineApps}</span>
                </div>
              </div>

              {/* Footer stats */}
              <div className="mt-1.5 space-y-0.5 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink/40">Avg Latency</span>
                  <span className="font-mono text-[10px] font-semibold text-ink">{opd.avgLatencyMs} ns</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink/40">Uptime</span>
                  <span
                    className={cn(
                      "font-mono text-[10px] font-bold",
                      opd.healthStatus === "critical" ? "text-status-offline" :
                      opd.healthStatus === "warning" ? "text-status-warning" :
                      "text-status-online"
                    )}
                  >
                    {opd.avgUptime.toFixed(2)}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Full OPD Grid page ----
export function OpdSummaryGrid() {
  const opds = initialOpdSummaries;
  const [healthFilter, setHealthFilter] = useState<string>("all");

  const filtered = opds.filter((opd) => {
    if (healthFilter === "healthy") return opd.healthStatus === "healthy";
    if (healthFilter === "warning") return opd.healthStatus === "warning";
    if (healthFilter === "critical") return opd.healthStatus === "critical";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {[{ k: "all", l: "Semua OPD" }, { k: "healthy", l: "Sehat" }, { k: "warning", l: "Perhatian" }, { k: "critical", l: "Kritis" }].map((tab, idx) => (
            <button
              key={tab.k}
              type="button"
              onClick={() => setHealthFilter(tab.k)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                idx > 0 && "border-l border-border",
                healthFilter === tab.k ? "bg-brand text-white" : "bg-white text-ink/60 hover:bg-canvas"
              )}
            >
              {tab.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((opd) => {
          const healthColors = {
            healthy: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-status-online" },
            warning: { badge: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-status-warning" },
            critical: { badge: "bg-red-100 text-red-800 border-red-200", dot: "bg-status-offline" },
          };
          const healthLabel = { healthy: "Optimal", warning: "Perhatian", critical: "Kritis" };
          const hc = healthColors[opd.healthStatus];

          return (
            <div key={opd.code} className="flex flex-col rounded-xl border border-border bg-white p-4 shadow-2xs hover:border-brand/40 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-bold text-brand">{opd.code}</span>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", hc.badge)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", hc.dot)} />
                  {healthLabel[opd.healthStatus]}
                </span>
              </div>

              <h3 className="mt-2 text-sm font-bold text-ink line-clamp-1">{opd.name}</h3>
              <p className="text-[11px] text-ink/45">{opd.category}</p>

              <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-border bg-canvas/60 p-2 text-center">
                <div>
                  <p className="text-[10px] text-ink/40 font-semibold">Total</p>
                  <p className="font-mono text-xs font-bold text-ink">{opd.totalApps}</p>
                </div>
                <div>
                  <p className="text-[10px] text-status-online font-semibold">Online</p>
                  <p className="font-mono text-xs font-bold text-status-online">{opd.onlineApps}</p>
                </div>
                <div>
                  <p className="text-[10px] text-status-offline font-semibold">Kendala</p>
                  <p className="font-mono text-xs font-bold text-status-offline">{opd.warningApps + opd.offlineApps}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center justify-between text-ink/60">
                  <span>SLA Uptime</span>
                  <span className="font-mono font-bold text-ink">{opd.avgUptime}%</span>
                </div>
                <div className="flex items-center justify-between text-ink/60">
                  <span>Avg Latensi</span>
                  <span className="font-mono font-bold text-ink">{opd.avgLatencyMs}ms</span>
                </div>
              </div>

              <button
                type="button"
                // LANGKAH 2: Membuka detail di Tab Baru
                onClick={() => window.open(`/opd/${opd.code}`, "_blank")}
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-border bg-canvas/50 py-1.5 text-xs font-semibold text-ink/70 hover:bg-brand-soft hover:text-brand hover:border-brand/30 transition-colors"
              >
                Lihat {opd.appsList.length} Aplikasi
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}