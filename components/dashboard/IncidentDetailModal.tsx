"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, Send, Calendar, Image as ImageIcon } from "lucide-react";
import { type IncidentItem, type IncidentStatus } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface IncidentDetailModalProps {
  incident: (IncidentItem & { screenshotUrl?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus, note?: string) => void;
}

export function IncidentDetailModal({ incident, isOpen, onClose, onUpdateStatus }: IncidentDetailModalProps) {
  const [noteInput, setNoteInput] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (incident?.screenshotUrl) {
      setScreenshot(incident.screenshotUrl);
    } else {
      setScreenshot(null);
    }
  }, [incident]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", handleKey); };
  }, [isOpen, onClose]);

  if (!isOpen || !incident) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onUpdateStatus(incident.id, incident.status, noteInput.trim());
    setNoteInput("");
  };

  const last7DaysData = [
    { date: "26 Agu 2026", uptime: "100%", ping: "42ms", status: "Normal" },
    { date: "27 Agu 2026", uptime: "100%", ping: "45ms", status: "Normal" },
    { date: "28 Agu 2026", uptime: "99.8%", ping: "58ms", status: "Warning (High Latency)" },
    { date: "29 Agu 2026", uptime: "100%", ping: "40ms", status: "Normal" },
    { date: "30 Agu 2026", uptime: "100%", ping: "44ms", status: "Normal" },
    { date: "31 Agu 2026", uptime: "100%", ping: "41ms", status: "Normal" },
    { date: "01 Sep 2026", uptime: "92.5%", ping: "Timeout", status: "Critical (Insiden Aktif)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-canvas">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand">{incident.ticketNumber}</span>
              <span className="text-ink/30">•</span>
              <span className="text-xs font-semibold text-ink/70">{incident.opdName}</span>
            </div>
            <h3 className="text-lg font-bold text-ink mt-0.5">{incident.appName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-ink/40 hover:text-ink hover:bg-border/60 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Modal */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-canvas p-3.5 rounded-xl border border-border">
            <div><span className="text-[10px] font-bold text-ink/45 uppercase block">Tingkat Keparahan</span><span className="font-semibold text-ink capitalize mt-0.5 block">{incident.severity}</span></div>
            <div><span className="text-[10px] font-bold text-ink/45 uppercase block">Waktu Mulai</span><span className="font-mono text-ink mt-0.5 block">{incident.startedAt}</span></div>
            <div><span className="text-[10px] font-bold text-ink/45 uppercase block">Durasi Gangguan</span><span className="font-mono text-ink mt-0.5 block">{incident.duration}</span></div>
            <div>
              <span className="text-[10px] font-bold text-ink/45 uppercase block">Status Tiket</span>
              <span className={cn("font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full text-[10px]", incident.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700")}>
                {incident.status === "resolved" ? "Selesai" : "Aktif"}
              </span>
            </div>
          </div>

          {/* Kronologi */}
          <div className="space-y-2">
            <h4 className="font-bold text-ink uppercase tracking-wider text-[10px]">Kronologi & Catatan Penanganan</h4>
            <div className="border border-border rounded-xl divide-y divide-border/60 bg-canvas/40">
              {incident.timeline.map((item, idx) => (
                <div key={idx} className="p-3 flex items-start gap-3">
                  <span className="font-mono text-[11px] font-bold text-brand shrink-0 w-16">{item.time}</span>
                  <p className="text-ink/80 text-xs">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* REKAP 7 HARI */}
          <div className="space-y-4 pt-2 border-t border-border">
            <div>
              <h4 className="font-bold text-ink uppercase tracking-wider text-[10px] mb-2.5 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand" />Rekap Status 7 Hari Terakhir</h4>
              <div className="overflow-hidden border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-canvas text-ink/50 uppercase font-semibold border-b border-border">
                    <tr><th className="py-2 px-3">Tanggal</th><th className="py-2 px-3 text-center">Uptime</th><th className="py-2 px-3 text-center">Latency</th><th className="py-2 px-3 text-right">Status Servis</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {last7DaysData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-canvas/50">
                        <td className="py-2 px-3 font-medium">{row.date}</td>
                        <td className="py-2 px-3 text-center font-mono text-status-online font-semibold">{row.uptime}</td>
                        <td className="py-2 px-3 text-center font-mono text-ink/60">{row.ping}</td>
                        <td className="py-2 px-3 text-right"><span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${row.status.includes("Critical") ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>{row.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bagian Tangkapan Layar (Otomatis Playwright Tanpa Tombol) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-ink uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand" /> Tangkapan Layar Saat Insiden (Real-time Playwright)
                </h4>
              </div>

              <div className="border border-border rounded-xl overflow-hidden bg-canvas">
                {screenshot ? (
                  <div className="relative flex justify-center bg-slate-900 min-h-[200px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={screenshot} 
                      alt="Tangkapan layar insiden" 
                      className="w-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/1280x720/1e293b/ef4444?text=Sistem+Sedang+Mengambil+Screenshot...";
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-border/40 flex flex-col items-center justify-center text-ink/40 p-4">
                    <ImageIcon className="w-8 h-8 mb-1.5 opacity-50 animate-pulse" />
                    <span className="text-xs font-semibold text-ink/60">Menunggu Playwright...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Tambah Catatan */}
          {incident.status !== "resolved" && (
            <form onSubmit={handleAddNote} className="pt-2">
              <label className="block font-bold text-ink uppercase tracking-wider text-[10px] mb-1.5">Tambahkan Update / Catatan Teknis:</label>
              <div className="flex gap-2">
                <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Contoh: Tim database sedang restart cluster..." className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand" />
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 transition"><Send className="w-3.5 h-3.5" /> Kirim</button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3 bg-canvas flex items-center justify-between">
          <span className="text-[11px] text-ink/50">{incident.status === "resolved" ? "Tiket ditutup." : "Anda memiliki hak akses."}</span>
          <div className="flex items-center gap-2">
            {incident.status !== "resolved" && (
              <button type="button" onClick={() => onUpdateStatus(incident.id, "resolved")} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"><CheckCircle2 className="w-4 h-4" /> Resolve</button>
            )}
            <button type="button" onClick={onClose} className="px-4 py-1.5 bg-ink text-white font-semibold rounded-lg hover:bg-ink/90 transition">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
}