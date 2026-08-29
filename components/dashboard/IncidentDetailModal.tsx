"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Layers,
  Send,
  UserCheck,
  X,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import type { IncidentItem, IncidentSeverity, IncidentStatus } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface IncidentDetailModalProps {
  incident: IncidentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus, note?: string) => void;
}

const severityConfig: Record<
  IncidentSeverity,
  { label: string; bg: string; text: string; icon: typeof AlertCircle }
> = {
  critical: {
    label: "Kritis (P1)",
    bg: "bg-red-50 text-red-700 border-red-200",
    text: "text-status-offline",
    icon: AlertOctagon,
  },
  major: {
    label: "Mayor (P2)",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    text: "text-status-warning",
    icon: AlertTriangle,
  },
  minor: {
    label: "Minor (P3)",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    text: "text-blue-600",
    icon: Info,
  },
  info: {
    label: "Informasi (P4)",
    bg: "bg-gray-50 text-gray-700 border-gray-200",
    text: "text-gray-600",
    icon: Info,
  },
};

const statusConfig: Record<
  IncidentStatus,
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  open: {
    label: "Insiden Aktif",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
  investigating: {
    label: "Sedang Diinvestigasi",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
  },
  resolved: {
    label: "Telah Diselesaikan",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
};

export function IncidentDetailModal({
  incident,
  isOpen,
  onClose,
  onUpdateStatus,
}: IncidentDetailModalProps) {
  const { user, canManageIncidents } = useAuth();
  const [newNote, setNewNote] = useState("");

  if (!isOpen || !incident) return null;

  const severity = severityConfig[incident.severity];
  const SeverityIcon = severity.icon;
  const status = statusConfig[incident.status];
  const StatusIcon = status.icon;

  const canEdit = canManageIncidents(incident.opdCode);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onUpdateStatus(incident.id, incident.status, newNote);
    setNewNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                severity.bg
              )}
            >
              <SeverityIcon className="h-3.5 w-3.5" />
              {severity.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                status.badgeClass
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink/40 hover:bg-canvas hover:text-ink"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <span className="font-mono text-xs font-semibold text-brand">
              {incident.ticketNumber}
            </span>
            <h3 className="mt-1 text-lg font-bold text-ink leading-snug">
              {incident.title}
            </h3>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-canvas/60 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <Layers className="h-4 w-4 text-ink/50" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink/40 font-semibold">
                  Aplikasi Terdampak
                </p>
                <p className="text-sm font-semibold text-ink">{incident.appName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-ink/50" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink/40 font-semibold">
                  Perangkat Daerah (OPD)
                </p>
                <p className="text-sm font-semibold text-ink">{incident.opdName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-ink/50" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink/40 font-semibold">
                  Waktu Mulai & Durasi
                </p>
                <p className="text-xs font-medium text-ink">
                  {incident.startedAt} ({incident.duration})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <UserCheck className="h-4 w-4 text-ink/50" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink/40 font-semibold">
                  Penanggung Jawab / PIC
                </p>
                <p className="text-xs font-medium text-ink">{incident.assignedTo}</p>
              </div>
            </div>
          </div>

          {/* Description & Impact */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Deskripsi Kendala
              </h4>
              <p className="mt-1 text-sm text-ink/80 leading-relaxed bg-white p-3 rounded-lg border border-border">
                {incident.description}
              </p>
            </div>

            {incident.rootCause && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Dugaan Penyebab (Root Cause)
                </h4>
                <p className="mt-1 text-sm text-ink/80 bg-amber-50/60 p-3 rounded-lg border border-amber-200/70">
                  {incident.rootCause}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Dampak Layanan
              </h4>
              <p className="mt-1 text-xs text-ink/70 bg-canvas p-2.5 rounded-lg border border-border">
                {incident.impact}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50 mb-3">
              Kronologi & Catatan Penanganan
            </h4>
            <div className="relative pl-6 space-y-4 border-l-2 border-border ml-2">
              {incident.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand" />
                  <span className="font-mono text-xs font-bold text-brand">{item.time}</span>
                  <p className="text-xs text-ink/80 mt-0.5">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Note Form (If permitted) */}
          {canEdit && (
            <form onSubmit={handleAddNote} className="space-y-2 border-t border-border pt-4">
              <label className="block text-xs font-semibold text-ink">
                Tambahkan Update / Catatan Teknis:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Contoh: Tim database sedang restart cluster..."
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-xs focus:border-brand focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="flex items-center gap-1 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Kirim
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-canvas/40 px-6 py-4">
          <div className="text-xs text-ink/50">
            {canEdit ? (
              <span className="text-emerald-700 font-medium">
                ✓ Anda memiliki hak akses mengelola tiket ini
              </span>
            ) : (
              <span>Login sebagai Admin APTIKA / Admin OPD untuk mengubah status.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canEdit && incident.status !== "resolved" && (
              <>
                {incident.status === "open" && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(incident.id, "investigating")}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    Mulai Investigasi
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onUpdateStatus(incident.id, "resolved")}
                  className="flex items-center gap-1.5 rounded-lg bg-status-online px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-status-online/90"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Tandai Selesai (Resolve)
                </button>
              </>
            )}

            {canEdit && incident.status === "resolved" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(incident.id, "investigating")}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
              >
                Buka Kembali Tiket
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-white px-4 py-1.5 text-xs font-semibold text-ink/70 hover:bg-canvas"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
