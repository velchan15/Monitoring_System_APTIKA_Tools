"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Eye, Filter, Search,
  Send, X, Calendar, Upload, Image as ImageIcon, Loader2, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Incident, IncidentStatus } from "@/lib/types/incident";
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
  incident: (Incident & { appUrl?: string }) | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus, note?: string) => void;
}

function IncidentDetailDrawer({ incident, onClose, onUpdateStatus }: IncidentDetailDrawerProps) {
  const { isExecutive, canEditIncidents } = useAuth();
  const [noteInput, setNoteInput] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    const inc = incident as any; 
    
    if (inc?.screenshotUrl) {
      setScreenshot(inc.screenshotUrl);
    } else {
      setScreenshot(null);
    }

  }, [incident]);

  useEffect(() => {
    if (!incident) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", handleKey); };
  }, [incident, onClose]);

  if (!incident) return null;

  const sev = SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
  const st = STATUS_CONFIG[incident.status] || STATUS_CONFIG.open;
  const canEdit = canEditIncidents(incident.opdCode);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onUpdateStatus(incident.id, incident.status, noteInput.trim());
    setNoteInput("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-all"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-start justify-between border-b border-border px-6 py-4 bg-slate-50/80">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md">{incident.ticketNumber}</span>
              <span className="text-ink/30">•</span>
              <span className="text-xs font-semibold text-ink/60">{incident.opdName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h3 className="text-base font-bold text-ink line-clamp-1">{incident.appName}</h3>
              {incident.appUrl && (
                <a 
                  href={incident.appUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 px-2.5 py-1 rounded-full transition-colors w-fit"
                  title="Buka Website di Tab Baru"
                >
                  Buka Web <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-ink/40 hover:text-ink hover:bg-slate-200 rounded-lg transition shrink-0" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-7 text-xs flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tingkat Keparahan</span>
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold", sev.class)}>{sev.label}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Status Tiket</span>
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold", st.class)}>{st.label}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Waktu Mulai</span>
              {/* whitespace-nowrap ditambahkan agar tidak turun ke bawah */}
              <span className="font-mono font-medium text-slate-700 mt-1 inline-block whitespace-nowrap">{incident.startedAt}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Durasi Gangguan</span>
              {/* whitespace-nowrap ditambahkan agar tidak turun ke bawah */}
              <span className="font-mono font-medium text-slate-700 mt-1 inline-block whitespace-nowrap">{incident.duration}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> Deskripsi Insiden
              </h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg">{incident.description}</p>
            </div>

            {incident.rootCause && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block mb-1.5">Dugaan Penyebab (Root Cause)</span>
                <p className="text-xs leading-relaxed text-amber-900">{incident.rootCause}</p>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">Dampak Layanan</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg">{incident.impact || "Berpotensi mengganggu pelayanan publik."}</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Kronologi & Penanganan
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-xs">
              {incident.timeline?.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-start gap-4">
                  <span className="font-mono text-[11px] font-bold text-brand shrink-0 w-[140px] whitespace-nowrap pt-0.5">{item.time}</span>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Bukti / Tangkapan Layar
              </h4>
            </div>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
              {screenshot ? (
                <div className="relative flex justify-center bg-slate-100 p-2 border-b border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={screenshot} 
                    alt="Bukti tangkapan layar insiden" 
                    className="max-h-64 object-contain rounded-md shadow-xs border border-slate-200 bg-white"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/1280x720/f1f5f9/64748b?text=Screenshot+Belum+Tersedia";
                    }}
                  />
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 p-4">
                  <ImageIcon className="w-8 h-8 mb-2 text-slate-300" />
                  <span className="text-[11px] font-medium">Belum ada tangkapan layar dari sistem otomatis</span>
                </div>
              )}
            </div>
          </div>

          {!isExecutive && incident.status !== "resolved" && (
            <div className="pt-2">
              <form onSubmit={handleAddNote} className="bg-brand/5 border border-brand/20 p-4 rounded-xl">
                <label className="block font-bold text-brand uppercase tracking-wider text-[10px] mb-2">
                  Tambahkan Catatan / Update Teknis:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Contoh: Tim jaringan sedang melakukan restart..."
                    className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
                  />
                  <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand/90 transition shadow-sm">
                    <Send className="w-3.5 h-3.5" /> Kirim
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] font-medium text-slate-500">
            {incident.status === "resolved" ? "Tiket insiden telah ditutup." : `Ditangani oleh: ${incident.assignedTo || "Sistem Otomatis"}`}
          </span>
          <div className="flex items-center gap-2.5">
            {canEdit && incident.status !== "resolved" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(incident.id, "resolved")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition text-xs shadow-sm shadow-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4" /> Tandai Selesai
              </button>
            )}
            <button type="button" onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition text-xs shadow-sm">
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
  const [incidents, setIncidents] = useState<(Incident & { appUrl?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<(Incident & { appUrl?: string }) | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [opdFilter, setOpdFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || ""; 
      
      const [resInc, resApps] = await Promise.all([
        fetch("http://localhost:3001/api/incidents", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/applications", { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      
      const jsonInc = await resInc.json();
      const jsonApps = await resApps.json();

      const rawIncidents = Array.isArray(jsonInc) ? jsonInc : (Array.isArray(jsonInc.data) ? jsonInc.data : (jsonInc.incidents || []));
      const rawApps = Array.isArray(jsonApps) ? jsonApps : (Array.isArray(jsonApps.data) ? jsonApps.data : (jsonApps.applications || []));

      const appMap = new Map();
      rawApps.forEach((app: any) => {
        appMap.set(String(app.id), app);
      });

      const formattedData: (Incident & { appUrl?: string })[] = rawIncidents.map((inc: any) => {
        const appId = String(inc.applicationId || inc.appId || "");
        const matchedApp = appMap.get(appId) || inc.application;

        const safeAppName = matchedApp?.name || inc.appName || inc.name || `Aplikasi ID #${appId || inc.id}`;
        const safeOpdName = matchedApp?.department?.name || inc.opdName || "Pemerintah Provinsi Jawa Barat";
        const safeOpdCode = matchedApp?.department?.code || inc.opdCode || "JBR";
        
        const appUrl = matchedApp?.url || inc.application?.url || undefined;

        const rawDate = inc.createdAt || inc.startedAt || new Date().toISOString();
        const formattedDate = new Date(rawDate).toLocaleString("id-ID", {
          day: "2-digit", month: "short", year: "numeric", 
          hour: "2-digit", minute: "2-digit"
        }) + " WIB";

        let sev = inc.severity ? inc.severity.toLowerCase() : "critical";
        if (!["critical", "major", "minor", "info"].includes(sev)) sev = "critical";
        
        let st = inc.status ? inc.status.toLowerCase() : "open";
        if (st === "selesai") st = "resolved";

        return {
          id: String(inc.id),
          ticketNumber: inc.ticketNumber || `INC-2026-${String(inc.id).padStart(4, '0')}`,
          appName: safeAppName,
          appUrl: appUrl,
          opdName: safeOpdName,
          opdCode: safeOpdCode,
          severity: sev as any,
          status: st as any,
          startedAt: formattedDate,
          duration: (st === "resolved") ? "Selesai" : "Sedang Berlangsung",
          description: inc.cause || inc.description || `Laporan gangguan terdeteksi pada sistem ${safeAppName}.`,
          rootCause: inc.rootCause || undefined,
          impact: inc.impact || "Berpotensi mengganggu pelayanan publik.",
          timeline: inc.timeline && inc.timeline.length > 0 ? inc.timeline : [{ time: formattedDate, note: "Tiket insiden dibuat oleh sistem monitoring." }],
          screenshotUrl: appUrl ? `http://localhost:3001/api/screenshot?url=${encodeURIComponent(appUrl)}` : undefined
        };
      });

      setIncidents(formattedData);
    } catch (error) {
      console.error("Gagal menarik data gangguan:", error);
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000); 
    return () => clearInterval(interval);
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
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        const updatedTimeline = [...(inc.timeline || [])];
        if (note) updatedTimeline.push({ time: nowStr, note });
        else if (newStatus === "resolved") updatedTimeline.push({ time: nowStr, note: "Insiden diselesaikan oleh operator." });
        const updated = { ...inc, status: newStatus, duration: "Selesai", timeline: updatedTimeline };
        if (selectedIncident?.id === id) setSelectedIncident(updated);
        return updated;
      })
    );

    try {
      const token = localStorage.getItem("token") || "";
      await fetch(`http://localhost:3001/api/incidents/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus, note }),
      });
      fetchIncidents();
    } catch (e) {
      console.error("Gagal sinkron status ke server:", e);
    }
    
    window.dispatchEvent(new Event("incidentDataChanged"));
  }, [selectedIncident, fetchIncidents]);

  const activeCount = incidents.filter((i) => i.status === "open" || i.status === "investigating").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;
  const suppressedCount = incidents.filter((i) => i.status === "suppressed").length;

  const STATUS_TABS = [
    { k: "all", l: "Semua Insiden", count: incidents.length },
    { k: "active", l: "Aktif", count: activeCount },
    { k: "resolved", l: "Selesai", count: resolvedCount },
    { k: "suppressed", l: "Disupresi", count: suppressedCount },
  ];

  return (
    <div className="space-y-4 w-full pb-10">
      
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aplikasi, tiket, OPD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                aria-label="Hapus pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              value={opdFilter}
              onChange={(e) => setOpdFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-700 focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand outline-none appearance-none cursor-pointer transition-all"
            >
              <option value="all">Semua Perangkat Daerah</option>
              {initialOpdSummaries.map((opd) => (
                <option key={opd.code} value={opd.code}>{opd.shortName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit shrink-0 gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.k}
              type="button"
              onClick={() => setStatusFilter(tab.k)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
                statusFilter === tab.k ? "bg-white text-brand shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              {tab.l}
              <span className={cn("text-[10px] font-mono rounded-full px-1.5 py-0.5", statusFilter === tab.k ? "bg-brand/10 text-brand" : "bg-slate-200 text-slate-500")}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-brand" /> 
          <span className="text-xs font-medium">Memuat data tiket insiden real-time...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada insiden ditemukan" description="Ubah filter atau kata kunci pencarian untuk melihat insiden." icon={AlertTriangle} />
      ) : (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/95">
              <tr>
                {["Tiket / Aplikasi", "Perangkat Daerah", "Tipe", "Status", "Waktu Mulai", "Durasi", "Aksi"].map((h) => (
                  <th key={h} className={cn("px-5 py-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500", h === "Aksi" ? "text-right" : "")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inc) => {
                const sev = SEVERITY_CONFIG[inc.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
                const st = STATUS_CONFIG[inc.status] || STATUS_CONFIG.open;
                const canEdit = canEditIncidents(inc.opdCode);

                return (
                  <tr key={inc.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-800 line-clamp-2" title={inc.appName}>{inc.appName}</p>
                      <p className="font-mono text-[10px] font-medium text-brand mt-0.5">{inc.ticketNumber}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <p className="line-clamp-2 font-medium" title={inc.opdName}>{inc.opdName.replace(/Dinas |Badan /, "")}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold shadow-xs", sev.class)}>{sev.label}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold shadow-xs", st.class)}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3 font-mono font-medium text-[11px] text-slate-600 whitespace-nowrap">{inc.startedAt}</td>
                    <td className="px-5 py-3 font-medium text-[11px] text-slate-600 whitespace-nowrap">{inc.duration?.replace(" (Selesai)", "")}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setSelectedIncident(inc)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                        {canEdit && inc.status !== "resolved" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(inc.id, "resolved")}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-[11px] font-medium text-slate-500 bg-slate-50/50">
            <span>Menampilkan {filtered.length} dari total {incidents.length} laporan gangguan</span>
            <span>Sistem Pelaporan Terpadu — Diskominfo Jawa Barat</span>
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