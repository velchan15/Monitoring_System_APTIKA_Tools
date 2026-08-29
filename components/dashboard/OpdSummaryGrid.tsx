"use client";

import { useState } from "react";
import {
  Building2,
  ChevronRight,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";

import { initialOpdSummaries, type OpdSummary } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

// Health bar visualization
function HealthBar({ count, color }: { count: number; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      <span
        className="inline-block h-2 rounded-full"
        style={{ width: Math.max(count * 6, count > 0 ? 4 : 0), backgroundColor: color }}
      />
      <span className="font-mono font-semibold" style={{ color }}>
        {count}
      </span>
    </span>
  );
}

// ---- Compact OPD row for Dashboard ----
interface DashboardOpdProps {
  onViewAll?: () => void;
}

export function DashboardOpdSummary({ onViewAll }: DashboardOpdProps) {
  const opds = initialOpdSummaries;
  const [selectedOpd, setSelectedOpd] = useState<OpdSummary | null>(null);

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
          const totalDown = opd.warningApps + opd.offlineApps;
          const bgClass = opd.healthStatus === "critical"
            ? "bg-red-50/40"
            : opd.healthStatus === "warning"
            ? "bg-amber-50/30"
            : "";

          return (
            <button
              key={opd.code}
              type="button"
              onClick={() => setSelectedOpd(opd)}
              className={cn(
                "flex flex-col items-start gap-0.5 p-3 text-left transition-colors hover:bg-canvas/70 border-b border-r border-border/60",
                bgClass,
                idx % 2 === 0 ? "" : ""
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

      {/* OPD Detail Modal */}
      {selectedOpd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setSelectedOpd(null)} />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-5 w-5 text-brand" />
                <div>
                  <h3 className="text-base font-bold text-ink">{selectedOpd.name}</h3>
                  <p className="text-xs text-ink/45">{selectedOpd.code} · {selectedOpd.category}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedOpd(null)} className="rounded-lg p-1 text-ink/40 hover:bg-canvas">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-canvas p-3 text-center">
                  <p className="text-lg font-bold text-ink font-mono">{selectedOpd.totalApps}</p>
                  <p className="text-[11px] text-ink/50">Total Aplikasi</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                  <p className="text-lg font-bold text-status-online font-mono">{selectedOpd.avgUptime}%</p>
                  <p className="text-[11px] text-status-online/80">Avg SLA Uptime</p>
                </div>
                <div className="rounded-lg border border-border bg-canvas p-3 text-center">
                  <p className="text-lg font-bold text-ink font-mono">{selectedOpd.avgLatencyMs}ms</p>
                  <p className="text-[11px] text-ink/50">Avg Latensi</p>
                </div>
              </div>

              {/* PIC */}
              <div className="rounded-xl border border-border bg-canvas/50 p-3 text-xs space-y-1.5">
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand" /> {selectedOpd.picName}
                </p>
                <p className="text-ink/60 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-ink/40" /> {selectedOpd.picEmail}
                </p>
                <p className="text-ink/60 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-ink/40" /> {selectedOpd.picPhone}
                </p>
              </div>

              {/* App list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45 mb-2">
                  Aplikasi Terpantau ({selectedOpd.appsList.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedOpd.appsList.map((app, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs hover:bg-canvas/60">
                      <span className="font-medium text-ink">{app}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        Aktif
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-canvas/30 px-5 py-3 text-right">
              <button type="button" onClick={() => setSelectedOpd(null)} className="rounded-lg border border-border bg-white px-4 py-1.5 text-xs font-semibold text-ink/70 hover:bg-canvas">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Full OPD Grid page ----
export function OpdSummaryGrid() {
  const opds = initialOpdSummaries;
  const [selectedOpd, setSelectedOpd] = useState<OpdSummary | null>(null);
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
            warning: { badge: "bg-amber-100 text-amber-800 border-amber-200",       dot: "bg-status-warning" },
            critical: { badge: "bg-red-100 text-red-800 border-red-200",            dot: "bg-status-offline" },
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
                onClick={() => setSelectedOpd(opd)}
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-border bg-canvas/50 py-1.5 text-xs font-semibold text-ink/70 hover:bg-brand-soft hover:text-brand hover:border-brand/30 transition-colors"
              >
                Lihat {opd.appsList.length} Aplikasi
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedOpd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setSelectedOpd(null)} />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-5 w-5 text-brand" />
                <div>
                  <h3 className="text-base font-bold text-ink">{selectedOpd.name}</h3>
                  <p className="text-xs text-ink/45">{selectedOpd.code}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedOpd(null)} className="rounded-lg p-1 text-ink/40 hover:bg-canvas">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
              <div className="rounded-xl border border-border bg-canvas/50 p-3 text-xs space-y-1.5">
                <p className="font-bold text-ink flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand" /> {selectedOpd.picName}
                </p>
                <p className="text-ink/60 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-ink/40" /> {selectedOpd.picEmail}
                </p>
                <p className="text-ink/60 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-ink/40" /> {selectedOpd.picPhone}
                </p>
              </div>

              <div className="space-y-1.5">
                {selectedOpd.appsList.map((app, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs hover:bg-canvas/60">
                    <span className="font-medium text-ink">{app}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      Aktif
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-5 py-3 text-right">
              <button type="button" onClick={() => setSelectedOpd(null)} className="rounded-lg border border-border bg-white px-4 py-1.5 text-xs font-semibold text-ink/70 hover:bg-canvas">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
