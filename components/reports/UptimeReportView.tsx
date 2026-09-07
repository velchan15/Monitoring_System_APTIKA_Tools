"use client";

import { useState, useMemo } from "react";
import { Search, Activity, TrendingUp, AlertTriangle, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockUptimeReports } from "@/lib/data/reports";
import type { UptimeReportItem } from "@/lib/types/report";
import { EmptyState } from "@/components/ui/EmptyState";
import { initialOpdSummaries } from "@/lib/dashboard-data";

type SlaStatus = UptimeReportItem["slaAdherence"];

const SLA_CONFIG: Record<SlaStatus, { label: string; class: string }> = {
  compliant: { label: "Sesuai SLA", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  at_risk: { label: "Mendekati Batas", class: "bg-amber-100 text-amber-800 border-amber-200" },
  breached: { label: "Melewati SLA", class: "bg-red-100 text-red-700 border-red-200" },
};

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconClass: string;
}

function SummaryCard({ label, value, sub, icon: Icon, iconClass }: SummaryCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-ink/50 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        <Icon className={cn("w-5 h-5", iconClass)} />
      </div>
      <div className="text-2xl font-bold text-ink">{value}</div>
      {sub && <p className="text-[11px] text-ink/50 mt-1">{sub}</p>}
    </div>
  );
}

export function UptimeReportView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [opdFilter, setOpdFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState<"all" | SlaStatus>("all");

  const filtered = useMemo(() => {
    let result = mockUptimeReports;
    if (opdFilter !== "all") result = result.filter((r) => r.opdCode === opdFilter);
    if (slaFilter !== "all") result = result.filter((r) => r.slaAdherence === slaFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.appName.toLowerCase().includes(q) || r.opdName.toLowerCase().includes(q));
    }
    return result;
  }, [opdFilter, slaFilter, searchQuery]);

  const avgUptime = (mockUptimeReports.reduce((acc, r) => acc + r.uptimePercent, 0) / mockUptimeReports.length).toFixed(2);
  const lowestUptime = [...mockUptimeReports].sort((a, b) => a.uptimePercent - b.uptimePercent)[0];
  const totalDowntimeMin = mockUptimeReports.reduce((acc, r) => acc + r.totalDowntimeMinutes, 0);
  const totalDowntimeHours = (totalDowntimeMin / 60).toFixed(1);
  const slaBreached = mockUptimeReports.filter((r) => r.slaAdherence === "breached").length;

  const SLA_TABS = [
    { k: "all" as const, l: "Semua" },
    { k: "compliant" as const, l: "Sesuai SLA" },
    { k: "at_risk" as const, l: "Mendekati Batas" },
    { k: "breached" as const, l: "Melewati SLA" },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Rata-rata Uptime Global" value={`${avgUptime}%`} sub="Rata-rata 30 hari semua layanan" icon={Activity} iconClass="text-status-online" />
        <SummaryCard label="Total Downtime (Jam)" value={`${totalDowntimeHours} Jam`} sub={`${totalDowntimeMin} menit kumulatif`} icon={Clock} iconClass="text-status-warning" />
        <SummaryCard label="Layanan Melewati SLA" value={String(slaBreached)} sub={`dari ${mockUptimeReports.length} layanan terpantau`} icon={AlertTriangle} iconClass="text-status-offline" />
        <SummaryCard
          label="Uptime Terendah"
          value={`${lowestUptime.uptimePercent.toFixed(2)}%`}
          sub={lowestUptime.appName.split(" ").slice(0, 3).join(" ")}
          icon={TrendingUp}
          iconClass="text-status-offline"
        />
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 p-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40" />
              <input
                type="text"
                placeholder="Cari aplikasi atau OPD..."
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
          </div>

          <div className="flex rounded-lg border border-border bg-canvas p-0.5 w-fit flex-wrap gap-0.5">
            {SLA_TABS.map((tab) => (
              <button
                key={tab.k}
                type="button"
                onClick={() => setSlaFilter(tab.k)}
                className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors", slaFilter === tab.k ? "bg-white text-brand shadow-sm" : "text-ink/50 hover:text-ink")}
              >
                {tab.l}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState className="m-4" title="Tidak ada data uptime ditemukan" icon={Shield} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-canvas/60">
                  {["Aplikasi", "Perangkat Daerah", "Uptime (%)", "Total Downtime", "Jumlah Insiden", "Target SLA", "Status SLA"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => {
                  const slaCfg = SLA_CONFIG[item.slaAdherence];
                  return (
                    <tr key={item.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink line-clamp-1">{item.appName}</p>
                      </td>
                      <td className="px-4 py-3 text-ink/65">{item.opdCode}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-[60px] max-w-[100px] bg-slate-100 rounded-full h-1.5">
                            <div
                              className={cn("h-1.5 rounded-full", item.uptimePercent >= 99.5 ? "bg-status-online" : item.uptimePercent >= 99.0 ? "bg-status-warning" : "bg-status-offline")}
                              style={{ width: `${Math.min(100, item.uptimePercent)}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-xs text-ink">{item.uptimePercent.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink/70">{item.totalDowntimeFormatted}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("font-mono font-bold", item.incidentCount > 0 ? "text-status-offline" : "text-status-online")}>
                          {item.incidentCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink/50">{item.slaTargetPercent}%</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", slaCfg.class)}>{slaCfg.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-border px-4 py-2.5 text-[11px] text-ink/45">
          Menampilkan {filtered.length} dari {mockUptimeReports.length} layanan · Periode: Agustus 2026
        </div>
      </div>
    </div>
  );
}
