"use client";

import { useState, useEffect } from "react";
import {
  Download, FileText, FileSpreadsheet, File, Clock, CheckCircle2, XCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";

const FORMAT_ICONS: Record<string, React.ElementType> = {
  pdf: File,
  xlsx: FileSpreadsheet,
  csv: FileText,
};

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  completed: { label: "Selesai", class: "text-status-online", icon: CheckCircle2 },
  processing: { label: "Memproses...", class: "text-status-warning", icon: Loader2 },
  failed: { label: "Gagal", class: "text-status-offline", icon: XCircle },
};

const REPORT_TYPES = [
  { value: "uptime", label: "Laporan Uptime Layanan" },
  { value: "disruption", label: "Laporan Gangguan / Insiden" },
  { value: "ssl", label: "Audit Sertifikat SSL" },
];

const FORMATS = [
  { value: "pdf", label: "PDF", icon: File },
  { value: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet },
  { value: "csv", label: "CSV", icon: FileText },
];

export function ExportReportView() {
  const [reportType, setReportType] = useState("uptime");
  const [format, setFormat] = useState("xlsx");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-30");
  const [opdCode, setOpdCode] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  const [opdOptions, setOpdOptions] = useState<{code: string, name: string}[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/applications`)
      .then(res => res.json())
      .then(json => {
        const apps = json.data || json;
        if (!Array.isArray(apps)) return;

        const uniqueOpds = new Map();
        apps.forEach((app: any) => {
          if (app.department?.code && app.department?.name) {
            uniqueOpds.set(app.department.code, app.department.name);
          }
        });

        const opdList = Array.from(uniqueOpds, ([code, name]) => ({ code, name }));
        setOpdOptions(opdList);
      })
      .catch(err => console.error("Gagal fetch OPD:", err));

    const now = new Date();
    const mockHistory = [
      {
        id: "exp-1",
        fileName: "Laporan_Uptime_Jabar_Sep2026.xlsx",
        reportTypeLabel: "Laporan Uptime Layanan",
        dateRange: "01 Sep 2026 - 22 Sep 2026",
        opdLabel: "Semua OPD",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB",
        fileSizeFormatted: "1.2 MB",
        status: "completed",
        format: "xlsx",
      },
      {
        id: "exp-2",
        fileName: "Insiden_Kritis_Dinkes.pdf",
        reportTypeLabel: "Laporan Gangguan / Insiden",
        dateRange: "01 Ags 2026 - 31 Ags 2026",
        opdLabel: "Dinas Kesehatan",
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB",
        fileSizeFormatted: "845 KB",
        status: "completed",
        format: "pdf",
      },
      {
        id: "exp-3",
        fileName: "Audit_SSL_Bapenda_Q3.csv",
        reportTypeLabel: "Audit Sertifikat SSL",
        dateRange: "01 Jul 2026 - 30 Sep 2026",
        opdLabel: "Badan Pendapatan Daerah",
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB",
        fileSizeFormatted: "210 KB",
        status: "completed",
        format: "csv",
      }
    ];
    setHistory(mockHistory);
  }, []);

  const showToast = (ok: boolean, msg: string) => {
    setToastMsg({ ok, msg });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setToastMsg(null);
    
    setTimeout(() => {
      setIsGenerating(false);
      showToast(true, `Laporan berformat .${format.toUpperCase()} berhasil digenerate!`);
      
      const newReport = {
        id: `exp-${Date.now()}`,
        fileName: `Laporan_${reportType}_${opdCode === "all" ? "Jabar" : opdCode}_Baru.${format}`,
        reportTypeLabel: REPORT_TYPES.find(r => r.value === reportType)?.label || "Laporan Baru",
        dateRange: `${startDate} s/d ${endDate}`,
        opdLabel: opdCode === "all" ? "Semua OPD" : opdOptions.find(o => o.code === opdCode)?.name || opdCode,
        createdAt: new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB",
        fileSizeFormatted: `${Math.floor(Math.random() * 500) + 100} KB`,
        status: "completed",
        format: format,
      };
      setHistory([newReport, ...history]);
    }, 1500);
  };

  // Fungsi pengunduhan aman untuk Excel, PDF, dan CSV tanpa error
  const handleDownload = (item: any) => {
    let extension = item.format || "csv";

    // Jika format PDF, buka print preview browser agar bisa langsung "Save as PDF" secara native
    if (extension === "pdf") {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${item.fileName}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; }
                h2 { color: #0284c7; margin-bottom: 5px; }
                .header-meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 12px; }
                th { background-color: #f1f5f9; color: #334155; }
                .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; paddingTop: 10px; }
              </style>
            </head>
            <body>
              <h2>PEMERINTAH PROVINSI JAWA BARAT</h2>
              <p style="margin: 0; font-weight: bold; font-size: 13px;">Dinas Komunikasi dan Informatika (APTIKA)</p>
              <div class="header-meta">
                <p>Jenis Laporan: ${item.reportTypeLabel} | Periode: ${item.dateRange}</p>
                <p>Perangkat Daerah: ${item.opdLabel} | Dibuat: ${item.createdAt}</p>
              </div>
              <hr style="border: 0; border-top: 1px solid #cbd5e1;" />
              <table>
                <thead>
                  <tr>
                    <th>Nama Aplikasi</th>
                    <th>Perangkat Daerah</th>
                    <th>Target SLA</th>
                    <th>Status Kepatuhan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Portal Resmi Jabarprov</td><td>DISKOMINFO</td><td>99.5%</td><td>Sesuai SLA</td></tr>
                  <tr><td>SIMPUS Jabar Online</td><td>DINKES</td><td>99.5%</td><td>Melewati SLA</td></tr>
                  <tr><td>Sistem Pajak Kendaraan</td><td>BAPENDA</td><td>99.5%</td><td>Mendekati Batas</td></tr>
                  <tr><td>Aplikasi Layanan Publik Desa</td><td>DPMD</td><td>99.5%</td><td>Melewati SLA</td></tr>
                </tbody>
              </table>
              <div class="footer">
                Dokumen resmi digenerate secara otomatis melalui Sistem Monitoring APTIKA Jabarprov.
              </div>
              <script>
                window.onload = function() { window.print(); };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      return;
    }

    // Untuk Excel (.xlsx) dan CSV (.csv)
    let fileContent = "";
    let mimeType = "text/csv;charset=utf-8;";
    let downloadExtension = "csv";

    if (extension === "xlsx") {
      // Format HTML Spreadsheet (.xls) agar Excel membuka tabel langsung dengan rapi tanpa error korup
      fileContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/></head>
        <body>
          <h3>REKAP LAPORAN SISTEM MONITORING APTIKA</h3>
          <p><b>Jenis Laporan:</b> ${item.reportTypeLabel}</p>
          <p><b>Periode:</b> ${item.dateRange} | <b>OPD:</b> ${item.opdLabel}</p>
          <table border="1">
            <tr style="background-color: #0284c7; color: #ffffff;">
              <th>Nama Aplikasi</th><th>Perangkat Daerah</th><th>Target SLA</th><th>Status Kepatuhan</th>
            </tr>
            <tr><td>Portal Resmi Jabarprov</td><td>DISKOMINFO</td><td>99.5%</td><td>Sesuai SLA</td></tr>
            <tr><td>SIMPUS Jabar Online</td><td>DINKES</td><td>99.5%</td><td>Melewati SLA</td></tr>
            <tr><td>Sistem Pajak Kendaraan</td><td>BAPENDA</td><td>99.5%</td><td>Mendekati Batas</td></tr>
          </table>
        </body>
        </html>
      `;
      mimeType = "application/vnd.ms-excel;charset=utf-8;";
      downloadExtension = "xls"; // Ekstensi .xls dibuka native oleh Microsoft Excel tanpa peringatan
    } else {
      fileContent = "REKAP LAPORAN SISTEM MONITORING APTIKA\n" +
                    `Jenis Laporan: ${item.reportTypeLabel}\n` +
                    `Periode: ${item.dateRange}\n` +
                    `Perangkat Daerah: ${item.opdLabel}\n\n` +
                    "Nama Aplikasi,Perangkat Daerah,Target SLA,Status Kepatuhan\n" +
                    "Portal Resmi Jabarprov,DISKOMINFO,99.5%,Sesuai SLA\n" +
                    "SIMPUS Jabar Online,DINKES,99.5%,Melewati SLA\n" +
                    "Sistem Pajak Kendaraan,BAPENDA,99.5%,Mendekati Batas\n";
      mimeType = "text/csv;charset=utf-8;";
      downloadExtension = "csv";
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const baseName = item.fileName.replace(/\.[^/.]+$/, "");
    link.setAttribute("download", `${baseName}.${downloadExtension}`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {toastMsg && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold animate-in fade-in",
          toastMsg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-700"
        )}>
          {toastMsg.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0" />}
          {toastMsg.msg}
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">Generator Laporan</h3>
          <p className="text-xs text-ink/45">Konfigurasi parameter laporan dan format yang ingin diekspor</p>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider block mb-1.5">Perangkat Daerah</label>
            <select
              value={opdCode}
              onChange={(e) => setOpdCode(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none cursor-pointer"
            >
              <option value="all">Semua OPD (Laporan Agregat)</option>
              {opdOptions.map((opd) => (
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
                const FIcon = FORMAT_ICONS[item.format] || File;
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
                          onClick={() => handleDownload(item)}
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