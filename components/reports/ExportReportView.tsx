"use client";

import { useState } from "react";
import {
  Download, FileText, FileSpreadsheet, File, Clock, CheckCircle2, XCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockExportHistory, generateExportReport } from "@/lib/data/exports";
import type { ExportHistoryItem, ExportReportType, ExportFormat } from "@/lib/types/export";
import { initialOpdSummaries } from "@/lib/dashboard-data";

const FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  pdf: File,
  xlsx: FileSpreadsheet,
  csv: FileText,
};

const STATUS_CONFIG: Record<ExportHistoryItem["status"], { label: string; class: string; icon: React.ElementType }> = {
  completed: { label: "Selesai", class: "text-status-online", icon: CheckCircle2 },
  processing: { label: "Memproses...", class: "text-status-warning", icon: Loader2 },
  failed: { label: "Gagal", class: "text-status-offline", icon: XCircle },
};

const REPORT_TYPES: { value: ExportReportType; label: string }[] = [
  { value: "uptime", label: "Laporan Uptime Layanan" },
  { value: "disruption", label: "Laporan Gangguan / Insiden" },
  { value: "ssl", label: "Audit Sertifikat SSL" },
];

const FORMATS: { value: ExportFormat; label: string; icon: React.ElementType }[] = [
  { value: "pdf", label: "PDF", icon: File },
  { value: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet },
  { value: "csv", label: "CSV", icon: FileText },
];

export function ExportReportView() {
  const [reportType, setReportType] = useState<ExportReportType>("uptime");
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [opdCode, setOpdCode] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [history, setHistory] = useState(mockExportHistory);

  const showToast = (ok: boolean, msg: string) => {
    setToastMsg({ ok, msg });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setToastMsg(null);
    try {
      // TODO(backend): replace generateExportReport with POST to `/api/exports/generate`
      // See ExportRequest type in lib/types/export.ts for payload contract
      const result = await generateExportReport({
        reportType,
        startDate,
        endDate,
        format,
        opdCode: opdCode === "all" ? undefined : opdCode,
      });
      if (result.success) {
        showToast(true, `Laporan berhasil digenerate! ID: ${result.jobId}`);
        setHistory([...mockExportHistory]);
      } else {
        showToast(false, "Pembuatan laporan gagal. Coba lagi.");
      }
    } catch {
      showToast(false, "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Toast */}
      {toastMsg && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold animate-fade-in",
          toastMsg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-700"
        )}>
          {toastMsg.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0" />}
          {toastMsg.msg}
        </div>
      )}

      {/* Generator Form */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">Generator Laporan</h3>
          <p className="text-xs text-ink/45">Konfigurasi parameter laporan dan format yang ingin diekspor</p>
        </div>

        {/* Jenis Laporan */}
        <div>
          <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-2">Jenis Laporan</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {REPORT_TYPES.map((rt) => (
              <label
                key={rt.value}
                className={cn(
                  "flex items-center justify-between cursor-pointer rounded-xl border p-3.5 text-xs font-semibold transition-all",
                  reportType === rt.value ? "border-brand bg-brand-soft/30 text-brand ring-1 ring-brand" : "border-border text-ink hover:bg-canvas"
                )}
              >
                <span>{rt.label}</span>
                <input type="radio" name="reportType" value={rt.value} checked={reportType === rt.value} onChange={() => setReportType(rt.value)} className="accent-brand" />
              </label>
            ))}
          </div>
        </div>

        {/* Rentang Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-1.5">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-1.5">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        {/* OPD & Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-1.5">Perangkat Daerah</label>
            <select
              value={opdCode}
              onChange={(e) => setOpdCode(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none cursor-pointer"
            >
              <option value="all">Semua OPD (Laporan Agregat)</option>
              {initialOpdSummaries.map((opd) => (
                <option key={opd.code} value={opd.code}>{opd.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-1.5">Format Ekspor</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => {
                const FIcon = f.icon;
                return (
                  <label
                    key={f.value}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 cursor-pointer rounded-xl border p-2.5 text-xs font-semibold transition-all",
                      format === f.value ? "border-brand bg-brand-soft/30 text-brand ring-1 ring-brand" : "border-border text-ink hover:bg-canvas"
                    )}
                  >
                    <FIcon className="h-4 w-4" />
                    {f.label}
                    <input type="radio" name="format" value={f.value} checked={format === f.value} onChange={() => setFormat(f.value)} className="hidden" />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-[11px] text-ink/50">
            * File akan tersedia di riwayat ekspor di bawah setelah selesai.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand/90 transition-colors disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isGenerating ? "Memproses..." : "Buat & Unduh Laporan"}
          </button>
        </div>
      </div>

      {/* Export History */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-ink">Riwayat Ekspor</h3>
            <p className="text-xs text-ink/45">Laporan yang telah dibuat sebelumnya</p>
          </div>
          <Clock className="h-4 w-4 text-ink/30" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-border bg-canvas/60">
                {["Nama File", "Jenis Laporan", "Rentang Periode", "OPD", "Dibuat Pada", "Ukuran", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {history.map((item) => {
                const FIcon = FORMAT_ICONS[item.format];
                const stCfg = STATUS_CONFIG[item.status];
                const StIcon = stCfg.icon;
                return (
                  <tr key={item.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FIcon className="h-4 w-4 text-ink/40 flex-shrink-0" />
                        <span className="font-mono text-[10px] text-ink/80 line-clamp-1 max-w-[200px]">{item.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{item.reportTypeLabel}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-ink/60 whitespace-nowrap">{item.dateRange}</td>
                    <td className="px-4 py-3 text-ink/60">{item.opdLabel}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-ink/60 whitespace-nowrap">{item.createdAt}</td>
                    <td className="px-4 py-3 font-mono text-ink/50">{item.fileSizeFormatted}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", stCfg.class)}>
                        <StIcon className={cn("h-3.5 w-3.5", item.status === "processing" ? "animate-spin" : "")} />
                        {stCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => alert("TODO(backend): endpoint unduh file belum tersedia.")}
                          className="inline-flex items-center gap-1 text-brand hover:underline text-[11px] font-semibold"
                        >
                          <Download className="h-3 w-3" /> Unduh
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
