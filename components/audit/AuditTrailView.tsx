"use client";

import { useState, useMemo } from "react";
import { Search, Filter, History, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockAuditLogs } from "@/lib/data/audit";
import type { AuditLogEntry } from "@/lib/types/audit";
import { EmptyState } from "@/components/ui/EmptyState";

const ACTION_CFG: Record<string, { label: string; class: string }> = {
  create: { label: "Tambah", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  update: { label: "Perbarui", class: "bg-brand-soft text-brand border-brand/30" },
  delete: { label: "Nonaktifkan", class: "bg-red-100 text-red-700 border-red-200" },
  resolve: { label: "Selesaikan", class: "bg-teal-100 text-teal-800 border-teal-200" },
  export: { label: "Ekspor", class: "bg-purple-100 text-purple-700 border-purple-200" },
  sync: { label: "Sinkronisasi", class: "bg-amber-100 text-amber-800 border-amber-200" },
  auth: { label: "Autentikasi", class: "bg-slate-100 text-slate-600 border-slate-200" },
};

const ACTION_TYPE_OPTIONS = [
  { value: "all", label: "Semua Aksi" },
  { value: "create", label: "Tambah Data" },
  { value: "update", label: "Perbarui" },
  { value: "delete", label: "Nonaktifkan" },
  { value: "resolve", label: "Selesaikan Insiden" },
  { value: "export", label: "Ekspor Laporan" },
  { value: "sync", label: "Sinkronisasi" },
  { value: "auth", label: "Login / Autentikasi" },
];

const uniqueEmails = ["all", ...Array.from(new Set(mockAuditLogs.map((a) => a.userEmail)))];

interface DetailModalProps {
  log: AuditLogEntry;
  onClose: () => void;
}

function AuditDetailModal({ log, onClose }: DetailModalProps) {
  const actCfg = ACTION_CFG[log.actionType] || ACTION_CFG.update;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-canvas/60">
          <div>
            <h3 className="text-sm font-bold text-ink">{log.actionTitle}</h3>
            <p className="text-[11px] font-mono text-ink/50 mt-0.5">{log.timestamp} · IP: {log.ipAddress || "—"}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-ink/40 hover:text-ink rounded-lg" aria-label="Tutup">
            <Search className="h-4 w-4 rotate-45 opacity-60" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Pengguna</span>
              <span className="text-ink font-semibold mt-0.5 block">{log.userName}</span>
              <span className="text-[10px] text-ink/50 font-mono">{log.userEmail}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Role</span>
              <span className="text-ink mt-0.5 block">{log.userRole}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Tipe Aksi</span>
              <span className={cn("inline-flex items-center mt-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", actCfg.class)}>{actCfg.label}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Entitas Terdampak</span>
              <span className="text-ink mt-0.5 block font-mono text-[11px]">{log.targetEntity}</span>
            </div>
          </div>

          {/* Diff view */}
          {log.details && (
            <div className="bg-canvas rounded-xl border border-border p-3.5 space-y-2">
              <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider block">Detail Perubahan</span>
              {log.details.field && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-ink/50">Field: <span className="font-mono text-brand">{log.details.field}</span></p>
                  {log.details.oldValue && (
                    <div className="rounded bg-red-50 border border-red-200 px-2 py-1 font-mono text-[11px] text-red-800">
                      <span className="font-bold">- </span>{log.details.oldValue}
                    </div>
                  )}
                  {log.details.newValue && (
                    <div className="rounded bg-emerald-50 border border-emerald-200 px-2 py-1 font-mono text-[11px] text-emerald-800">
                      <span className="font-bold">+ </span>{log.details.newValue}
                    </div>
                  )}
                </div>
              )}
              {log.details.summary && (
                <p className="text-xs text-ink/70 leading-relaxed">{log.details.summary}</p>
              )}
            </div>
          )}

          <div className="text-right">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-ink text-white text-xs font-semibold hover:bg-ink/90 transition">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditTrailView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filtered = useMemo(() => {
    let result = mockAuditLogs;
    if (actionFilter !== "all") result = result.filter((a) => a.actionType === actionFilter);
    if (userFilter !== "all") result = result.filter((a) => a.userEmail === userFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.actionTitle.toLowerCase().includes(q) ||
          a.targetEntity.toLowerCase().includes(q) ||
          a.userName.toLowerCase().includes(q) ||
          (a.details?.summary?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [searchQuery, actionFilter, userFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40" />
          <input
            type="text"
            placeholder="Cari aksi, entitas, pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-canvas/40 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 focus:border-brand focus:bg-white focus:outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40 pointer-events-none" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-border bg-canvas/40 py-1.5 pl-8 pr-5 text-xs text-ink focus:border-brand focus:outline-none cursor-pointer appearance-none"
          >
            {ACTION_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="rounded-lg border border-border bg-canvas/40 py-1.5 px-3 text-xs text-ink focus:border-brand focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Pengguna</option>
            {uniqueEmails.filter((e) => e !== "all").map((email) => {
              const log = mockAuditLogs.find((a) => a.userEmail === email);
              return <option key={email} value={email}>{log?.userName || email}</option>;
            })}
          </select>
        </div>

        <span className="ml-auto text-[11px] text-ink/45">{filtered.length} entri ditampilkan</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada log aktivitas ditemukan" icon={History} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-border bg-canvas/60">
                {["Waktu", "Pengguna", "Tipe Aksi", "Judul Aksi", "Entitas Terdampak", "Nilai Berubah", "Detail"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((log) => {
                const actCfg = ACTION_CFG[log.actionType] || ACTION_CFG.update;
                return (
                  <tr key={log.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-ink/55 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink text-[11px]">{log.userName}</p>
                      <p className="text-[10px] text-ink/45 font-mono">{log.userRole}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", actCfg.class)}>
                        {actCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{log.actionTitle}</td>
                    <td className="px-4 py-3 text-ink/65 max-w-[200px] truncate">{log.targetEntity}</td>
                    <td className="px-4 py-3">
                      {log.details?.field ? (
                        <div className="text-[10px] font-mono space-y-0.5">
                          {log.details.oldValue && <div className="text-red-600 line-through">{log.details.oldValue}</div>}
                          {log.details.newValue && <div className="text-emerald-700 font-semibold">{log.details.newValue}</div>}
                        </div>
                      ) : (
                        <span className="text-ink/40 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 text-brand hover:underline text-[11px] font-semibold"
                      >
                        Lihat <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-border px-4 py-2.5 text-[11px] text-ink/45">
            {filtered.length} dari {mockAuditLogs.length} entri audit · Diskominfo Provinsi Jawa Barat
          </div>
        </div>
      )}

      {selectedLog && (
        <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
