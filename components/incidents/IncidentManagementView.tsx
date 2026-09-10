"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Eye, Filter, Search,
  Send, X, Calendar, Upload, Image as ImageIcon, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockIncidents } from "@/lib/data/incidents";
import type { Incident, IncidentStatus } from "@/lib/types/incident";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { initialOpdSummaries } from "@/lib/dashboard-data";
import { useAuth } from "@/lib/auth-context";

const SEVERITY_CONFIG = {
  critical: { label: "Kritis / Offline", class: "bg-red-100 text-red-700 border-red-200" },
  major:    { label: "Warning / Degraded", class: "bg-amber-100 text-amber-800 border-amber-200" },
  minor:    { label: "Minor", class: "bg-blue-100 text-blue-700 border-blue-200" },
  info:     { label: "Informasi", class: "bg-slate-100 text-slate-700 border-slate-200" },
};

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  open: { label: "Aktif", class: "bg-red-100 text-red-700 border-red-200" },
  investigating: { label: "Investigasi", class: "bg-amber-100 text-amber-800 border-amber-200" },
  resolved: { label: "Selesai", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  suppressed: { label: "Disupresi (Maintenance)", class: "bg-purple-100 text-purple-700 border-purple-200" },
};

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus, note?: string) => void;
}

function IncidentDetailDrawer({ incident, onClose, onUpdateStatus }: IncidentDetailDrawerProps) {
  const { isExecutive, canEditIncidents } = useAuth();
  const [noteInput, setNoteInput] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (!incident) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", handleKey); };
  }, [incident, onClose]);

  if (!incident) return null;

  const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.info;
  const st = STATUS_CONFIG[incident.status] || STATUS_CONFIG.open;
  const canEdit = canEditIncidents(incident.opdCode);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onUpdateStatus(incident.id, incident.status, noteInput.trim());
    setNoteInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScreenshot(URL.createObjectURL(file));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-canvas/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand">{incident.ticketNumber}</span>
              <span className="text-ink/30">•</span>
              <span className="text-xs font-semibold text-ink/70">{incident.opdCode}</span>
            </div>
            <h3 className="text-sm font-bold text-ink mt-0.5 line-clamp-1">{incident.appName}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-ink/40 hover:text-ink hover:bg-border/60 rounded-lg transition" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">

          {/* Status bar */}
          <div className="flex flex-wrap gap-4 bg-canvas p-3.5 rounded-xl border border-border">
            <div>
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Tingkat Keparahan</span>
              <span className={cn("inline-flex items-center mt-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold", sev.class)}>{sev.label}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Status Tiket</span>
              <span className={cn("inline-flex items-center mt-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold", st.class)}>{st.label}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Waktu Mulai</span>
              <span className="font-mono text-ink mt-1 inline-block">{incident.startedAt}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Durasi</span>
              <span className="font-mono text-ink mt-1 inline-block">{incident.duration}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-ink uppercase tracking-wider text-[10px] mb-1">Deskripsi Insiden</h4>
            <p className="text-ink/75 leading-relaxed">{incident.description}</p>
          </div>

          {/* Root Cause */}
          {incident.rootCause && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block">Dugaan Penyebab (Root Cause)</span>
              <p className="text-xs leading-relaxed text-amber-900">{incident.rootCause}</p>
            </div>
          )}

          {/* Dampak */}
          <div>
            <h4 className="font-bold text-ink uppercase tracking-wider text-[10px] mb-1">Dampak Layanan</h4>
            <p className="text-ink/75 leading-relaxed">{incident.impact}</p>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-bold text-ink uppercase tracking-wider text-[10px] mb-2">Kronologi & Penanganan</h4>
            <div className="border border-border rounded-xl divide-y divide-border/60 bg-canvas/40">
              {incident.timeline?.map((item, idx) => (
                <div key={idx} className="p-3 flex items-start gap-3">
                  <span className="font-mono text-[11px] font-bold text-brand shrink-0 w-20">{item.time}</span>
                  <p className="text-ink/80 text-xs">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload bukti */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-ink uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand" /> Bukti / Screenshot
              </h4>
              {!isExecutive && (
                <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-brand-soft text-brand rounded hover:bg-brand/20 font-semibold transition text-[11px]">
                  <Upload className="w-3 h-3" /> Upload Bukti
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
            <div className="border border-border rounded-xl overflow-hidden bg-canvas">
              {screenshot ? (
                <div className="relative p-2 flex justify-center bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={screenshot} alt="Bukti tangkapan layar insiden" className="max-h-48 rounded object-contain" />
                </div>
              ) : (
                <div className="h-28 flex flex-col items-center justify-center text-ink/40 p-4">
                  <ImageIcon className="w-6 h-6 mb-1.5 opacity-50" />
                  <span className="text-[11px] font-semibold text-ink/50">Belum ada tangkapan layar diunggah</span>
                </div>
              )}
            </div>
          </div>

          {/* Form update catatan teknis (Diberikan untuk non-Executive) */}
          {!isExecutive && incident.status !== "resolved" && (
            <form onSubmit={handleAddNote} className="pt-1">
              <label className="block font-bold text-ink uppercase tracking-wider text-[10px] mb-1.5">
                Tambahkan Update / Catatan Teknis:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Contoh: Tim database sedang restart cluster..."
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-ink focus:outline-hidden focus:ring-1 focus:ring-brand"
                />
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 transition">
                  <Send className="w-3.5 h-3.5" /> Kirim
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 bg-canvas flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-ink/50">
            {incident.status === "resolved" ? "Tiket insiden telah ditutup." : `Ditangani: ${incident.assignedTo || "Operator"}`}
          </span>
          <div className="flex items-center gap-2">
            {canEdit && incident.status !== "resolved" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(incident.id, "resolved")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Selesai
              </button>
            )}
            <button type="button" onClick={onClose} className="px-4 py-1.5 bg-ink text-white font-semibold rounded-lg hover:bg-ink/90 transition text-xs">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IncidentManagementView() {
  const { canEditIncidents } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [opdFilter, setOpdFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/incidents");
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      } else {
        setIncidents(mockIncidents);
      }
    } catch {
      setIncidents(mockIncidents);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const filtered = incidents.filter((inc) => {
    if (statusFilter === "active" && inc.status !== "open" && inc.status !== "investigating") return false;
    if (statusFilter === "resolved" && inc.status !== "resolved") return false;
    if (statusFilter === "suppressed" && inc.status !== "suppressed") return false;
    if (opdFilter !== "all" && inc.opdCode !== opdFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!inc.appName.toLowerCase().includes(q) && !inc.ticketNumber.toLowerCase().includes(q) && !inc.opdName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleUpdateStatus = useCallback(async (id: string, newStatus: IncidentStatus, note?: string) => {
    try {
      await fetch(`http://localhost:3001/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note }),
      });
    } catch (e) {
      console.error("Gagal sinkron status ke server:", e);
    }

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        const updatedTimeline = [...(inc.timeline || [])];
        if (note) updatedTimeline.push({ time: nowStr, note });
        else if (newStatus === "resolved") updatedTimeline.push({ time: nowStr, note: "Insiden diselesaikan oleh operator." });
        const updated = { ...inc, status: newStatus, timeline: updatedTimeline };
        if (selectedIncident?.id === id) setSelectedIncident(updated);
        return updated;
      })
    );
  }, [selectedIncident]);

  const activeCount = incidents.filter((i) => i.status === "open" || i.status === "investigating").length;

  const STATUS_TABS = [
    { k: "all", l: "Semua Insiden", count: incidents.length },
    { k: "active", l: "Aktif", count: activeCount },
    { k: "resolved", l: "Selesai", count: incidents.filter((i) => i.status === "resolved").length },
    { k: "suppressed", l: "Disupresi", count: incidents.filter((i) => i.status === "suppressed").length },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40" />
            <input
              type="text"
              placeholder="Cari aplikasi, tiket, OPD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-canvas/40 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>

          {/* OPD Filter */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40 pointer-events-none" />
            <select
              value={opdFilter}
              onChange={(e) => setOpdFilter(e.target.value)}
              className="rounded-lg border border-border bg-canvas/40 py-1.5 pl-8 pr-6 text-xs text-ink focus:border-brand focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">Semua OPD</option>
              {initialOpdSummaries.map((opd) => (
                <option key={opd.code} value={opd.code}>{opd.shortName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex rounded-lg border border-border bg-canvas p-0.5 w-fit flex-wrap gap-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.k}
              type="button"
              onClick={() => setStatusFilter(tab.k)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5",
                statusFilter === tab.k ? "bg-white text-brand shadow-sm" : "text-ink/50 hover:text-ink"
              )}
            >
              {tab.l}
              <span className={cn("text-[10px] font-mono rounded-full px-1.5 py-0.5", statusFilter === tab.k ? "bg-brand-soft text-brand" : "bg-border text-ink/60")}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-xl border border-border text-xs text-ink/50 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand" /> Memuat daftar tiket insiden...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada insiden ditemukan" description="Ubah filter atau kata kunci pencarian untuk melihat insiden." icon={AlertTriangle} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-canvas/60">
                {["Tiket / Aplikasi", "Perangkat Daerah", "Tipe", "Status", "Waktu Mulai", "Durasi", "Aksi"].map((h) => (
                  <th key={h} className={cn("px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50", h === "Aksi" ? "text-right" : "")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((inc) => {
                const sev = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.info;
                const st = STATUS_CONFIG[inc.status] || STATUS_CONFIG.open;
                const canEdit = canEditIncidents(inc.opdCode);

                return (
                  <tr key={inc.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink line-clamp-1">{inc.appName}</p>
                      <p className="font-mono text-[10px] text-ink/45">{inc.ticketNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/70 whitespace-nowrap">{inc.opdCode}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", sev.class)}>{sev.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", st.class)}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-ink/60 whitespace-nowrap">{inc.startedAt}</td>
                    <td className="px-4 py-3 text-[11px] text-ink/60 whitespace-nowrap">{inc.duration?.replace(" (Selesai)", "")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedIncident(inc)}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-ink/70 hover:bg-canvas"
                        >
                          <Eye className="h-3 w-3" /> Detail
                        </button>
                        {canEdit && inc.status !== "resolved" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(inc.id, "resolved")}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-200"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-ink/45">
            <span>Menampilkan {filtered.length} dari {incidents.length} insiden</span>
            <span>Sistem Pelaporan Terpadu — Diskominfo Jabar</span>
          </div>
        </div>
      )}

      <IncidentDetailDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}