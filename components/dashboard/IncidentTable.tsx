"use client";

import { useState } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Eye, Info } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import {
  initialIncidents,
  type IncidentItem,
  type IncidentSeverity,
  type IncidentStatus,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { IncidentDetailModal } from "./IncidentDetailModal";

// App icon placeholder — colored circle with first letter
function AppIcon({ name, opdName }: { name: string; opdName: string }) {
  const colors = ["bg-blue-500", "bg-red-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-indigo-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold text-white", color)}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

const severityBadges: Record<IncidentSeverity, { label: string; class: string }> = {
  critical: { label: "Offline", class: "bg-red-100 text-red-700 border-red-200" },
  major:    { label: "Warning", class: "bg-amber-100 text-amber-700 border-amber-200" },
  minor:    { label: "Minor",   class: "bg-blue-100 text-blue-700 border-blue-200" },
  info:     { label: "Online",  class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

// ---- Compact version for Dashboard overview ----
interface DashboardIncidentProps {
  limit?: number;
}

export function DashboardIncidentList({ limit = 5 }: DashboardIncidentProps) {
  const [incidents, setIncidents] = useState<IncidentItem[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const displayed = incidents.slice(0, limit);

  const handleUpdateStatus = (id: string, newStatus: IncidentStatus, note?: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        const updatedTimeline = [...inc.timeline];
        if (note) updatedTimeline.push({ time: nowStr, note });
        else if (newStatus === "resolved") updatedTimeline.push({ time: nowStr, note: "Insiden diselesaikan." });
        const updated = { ...inc, status: newStatus, timeline: updatedTimeline };
        if (selectedIncident?.id === id) setSelectedIncident(updated);
        return updated;
      })
    );
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-white shadow-2xs">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Aplikasi dengan Gangguan Terbaru</h2>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-y border-border bg-canvas/60">
              <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Aplikasi</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Perangkat Daerah</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Status</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Waktu</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Durasi</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-ink/50 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {displayed.map((inc) => {
              const sev = severityBadges[inc.severity];
              return (
                <tr key={inc.id} className="transition-colors hover:bg-canvas/40 group">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <AppIcon name={inc.appName} opdName={inc.opdName} />
                      <span className="font-medium text-ink line-clamp-1 max-w-[160px]">{inc.appName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-ink/65 max-w-[120px]">
                    <span className="line-clamp-1">{inc.opdName.replace(/Dinas |Badan /, "")}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", sev.class)}>
                      {sev.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-ink/60 whitespace-nowrap">
                    {inc.startedAt.split(",")[1]?.trim() || inc.startedAt}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-ink/60 whitespace-nowrap">
                    {inc.duration.replace(" (Selesai)", "")}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => { setSelectedIncident(inc); setModalOpen(true); }}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-ink/70 hover:bg-canvas hover:text-ink"
                    >
                      <Eye className="h-3 w-3" />
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      <div className="border-t border-border px-4 py-2.5">
        <button
          type="button"
          className="text-xs font-semibold text-brand hover:underline"
        >
          Lihat Semua Gangguan →
        </button>
      </div>

      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

// ---- Full IncidentTable with all filters (for incidents page) ----
interface IncidentTableProps {
  limit?: number;
  showTitleHeader?: boolean;
}

export function IncidentTable({ limit, showTitleHeader = true }: IncidentTableProps) {
  const { canManageIncidents } = useAuth();
  const [incidents, setIncidents] = useState<IncidentItem[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = incidents.filter((inc) => {
    if (statusFilter === "active") return inc.status !== "resolved";
    if (statusFilter === "resolved") return inc.status === "resolved";
    return true;
  });

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  const handleUpdateStatus = (id: string, newStatus: IncidentStatus, note?: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        const updatedTimeline = [...inc.timeline];
        if (note) updatedTimeline.push({ time: nowStr, note });
        else if (newStatus === "resolved") updatedTimeline.push({ time: nowStr, note: "Insiden diselesaikan oleh operator." });
        const updated = { ...inc, status: newStatus, timeline: updatedTimeline };
        if (selectedIncident?.id === id) setSelectedIncident(updated);
        return updated;
      })
    );
  };

  return (
    <div className="rounded-xl border border-border bg-white shadow-2xs">
      {showTitleHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Manajemen Insiden & Gangguan</h2>
            <p className="text-xs text-ink/45">Lacak dan selesaikan tiket gangguan layanan per Perangkat Daerah</p>
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[{ k: "all", l: "Semua" }, { k: "active", l: "Aktif" }, { k: "resolved", l: "Selesai" }].map((tab, idx) => (
              <button
                key={tab.k}
                type="button"
                onClick={() => setStatusFilter(tab.k)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  idx > 0 && "border-l border-border",
                  statusFilter === tab.k ? "bg-brand text-white" : "bg-white text-ink/60 hover:bg-canvas"
                )}
              >
                {tab.l}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-canvas/60">
              <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Aplikasi</th>
              <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Perangkat Daerah</th>
              <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Status</th>
              <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Waktu</th>
              <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">Durasi</th>
              <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {displayed.map((inc) => {
              const sev = severityBadges[inc.severity];
              const canEdit = canManageIncidents(inc.opdCode);
              return (
                <tr key={inc.id} className="hover:bg-canvas/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <AppIcon name={inc.appName} opdName={inc.opdName} />
                      <div>
                        <p className="font-medium text-ink line-clamp-1">{inc.appName}</p>
                        <p className="text-[11px] text-ink/45 font-mono">{inc.ticketNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink/70">{inc.opdName.replace(/Dinas |Badan /, "")}</td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", sev.class)}>
                      {sev.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-ink/60 whitespace-nowrap">
                    {inc.startedAt.split(",")[1]?.trim() || inc.startedAt}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-ink/60 whitespace-nowrap">{inc.duration}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setSelectedIncident(inc); setModalOpen(true); }}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-ink/70 hover:bg-canvas"
                      >
                        <Eye className="h-3 w-3" />
                        Detail
                      </button>
                      {canEdit && inc.status !== "resolved" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(inc.id, "resolved")}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-200"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Selesai
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-ink/45">
        <span>Menampilkan {displayed.length} dari {incidents.length} insiden</span>
        <span>Sistem Pelaporan Terpadu — Diskominfo Jawa Barat</span>
      </div>

      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}