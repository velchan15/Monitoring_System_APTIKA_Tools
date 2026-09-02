"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { initialOpdSummaries, getApplicationsByOpd } from "@/lib/dashboard-data";
import { 
  Server, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  User, 
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Info,
  X,
  Calendar,
  Image as ImageIcon
} from "lucide-react";

export default function OpdDetailPage() {
  const params = useParams();
  const opdId = params.id as string;

  // State modal detail aplikasi
  const [selectedApp, setSelectedApp] = useState<{
    name: string;
    url: string;
    status: string;
  } | null>(null);

  const opd = initialOpdSummaries.find(
    (item) => item.code.toLowerCase() === opdId.toLowerCase()
  );
  const apps = getApplicationsByOpd(opdId);

  if (!opd) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-700">
        <h1 className="text-2xl font-bold mb-2">Perangkat Daerah Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-6">Kode OPD ({opdId}) tidak valid atau belum terdaftar.</p>
        <button 
          onClick={() => window.close()} 
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
        >
          Tutup Halaman
        </button>
      </div>
    );
  }

  // Data Rekap & Screenshot 7 Hari Terakhir
  const last7DaysData = [
    { date: "26 Agu 2026", uptime: "100%", ping: "42ms", status: "Normal" },
    { date: "27 Agu 2026", uptime: "100%", ping: "45ms", status: "Normal" },
    { date: "28 Agu 2026", uptime: "99.8%", ping: "58ms", status: "Warning (High Latency)" },
    { date: "29 Agu 2026", uptime: "100%", ping: "40ms", status: "Normal" },
    { date: "30 Agu 2026", uptime: "100%", ping: "44ms", status: "Normal" },
    { date: "31 Agu 2026", uptime: "100%", ping: "41ms", status: "Normal" },
    { date: "01 Sep 2026", uptime: "100%", ping: "43ms", status: "Normal (Hari Ini)" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Halaman */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-semibold tracking-wider text-teal-600 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Detail Perangkat Daerah
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
              {opd.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kode OPD: <span className="font-mono text-slate-700">{opd.code}</span> · {opd.category}
            </p>
          </div>
          <button
            onClick={() => window.close()}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Tutup Tab
          </button>
        </div>

        {/* 5 Card Ringkasan Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Total Aplikasi */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Aplikasi</span>
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{opd.totalApps}</div>
            <p className="text-xs text-slate-400 mt-1">Terdaftar di katalog</p>
          </div>

          {/* 2. Avg SLA Uptime */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Avg SLA Uptime</span>
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">{opd.avgUptime.toFixed(2)}%</div>
            <p className="text-xs text-slate-400 mt-1">Rata-rata 30 hari terakhir</p>
          </div>

          {/* 3. Avg Latensi */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Avg Latensi</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{opd.avgLatencyMs} <span className="text-sm font-normal text-slate-500">ms</span></div>
            <p className="text-xs text-slate-400 mt-1">Waktu respon rata-rata</p>
          </div>

          {/* 4. Aplikasi Terpantau */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Aplikasi Terpantau</span>
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {opd.onlineApps} <span className="text-sm font-normal text-slate-400">/ {opd.totalApps}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{opd.onlineApps} Online</span>
              {opd.offlineApps > 0 && (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-1"></span>
                  <span>{opd.offlineApps} Offline</span>
                </>
              )}
            </div>
          </div>

          {/* 5. Kontak PIC */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Kontak PIC</span>
              <User className="w-5 h-5 text-teal-600" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-900 truncate" title={opd.picName}>
                {opd.picName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{opd.picPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate" title={opd.picEmail}>{opd.picEmail}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Daftar Aplikasi & Uptime */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Daftar Aplikasi & Uptime ({apps.length})
          </h2>

          <div className="space-y-4">
            {apps.map((app) => {
              const isOffline = app.status === "DOWN";
              const isWarning = app.status === "WARNING";
              
              const statusDotColor = isOffline 
                ? "bg-red-500" 
                : isWarning 
                ? "bg-amber-500" 
                : "bg-emerald-500";

              return (
                <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-3">
                  {/* Baris Atas */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${statusDotColor}`} />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {app.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">{opd.code}</span>
                          <span>•</span>
                          <a 
                            href={app.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-slate-500 hover:text-teal-600 hover:underline inline-flex items-center gap-1 font-mono text-xs"
                          >
                            {app.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Button Detail + PING + SSL + SLA */}
                    <div className="flex items-center gap-4 self-end md:self-auto text-xs">
                      
                      {/* BUTTON DETAIL (Kiri PING) */}
                      <button
                        type="button"
                        onClick={() => setSelectedApp({ name: app.name, url: app.url, status: app.status })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition shadow-xs"
                      >
                        <Info className="w-3.5 h-3.5 text-teal-600" />
                        Detail
                      </button>

                      {/* PING */}
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PING</span>
                        <span className={`font-mono font-bold flex items-center justify-end gap-0.5 ${isOffline ? "text-red-600" : "text-slate-800"}`}>
                          <Zap className="w-3 h-3 text-amber-500" />
                          {isOffline ? "Timeout" : `${app.latency}ms`}
                        </span>
                      </div>

                      {/* SSL */}
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SSL</span>
                        <span className="font-mono font-bold text-emerald-600 flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          142h
                        </span>
                      </div>

                      {/* SLA 30H */}
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLA 30H</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {app.uptime.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bar Uptime 30 Hari */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1 h-6 w-full">
                      {Array.from({ length: 30 }).map((_, i) => {
                        let barColor = "bg-emerald-500";
                        if (isOffline && i === 29) barColor = "bg-red-500";
                        else if (isWarning && i === 29) barColor = "bg-amber-500";
                        else if (i === 18 && opd.healthStatus === "critical") barColor = "bg-red-500";
                        else if (i === 24 && opd.healthStatus !== "healthy") barColor = "bg-amber-500";

                        return (
                          <div
                            key={i}
                            className={`h-full flex-1 rounded-xs ${barColor} hover:opacity-80 transition cursor-pointer`}
                            title={`Hari ke-${i + 1}: ${barColor.includes("emerald") ? "100% Uptime" : barColor.includes("amber") ? "Degraded" : "Down"}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-medium">
                      <span>30 hari lalu</span>
                      <span>Hari ini</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* POP-UP MODAL DETAIL (REKAP 7 HARI & ROTASI SCREENSHOT) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-100/60 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Detail Monitoring 7 Hari Terakhir
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedApp.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{selectedApp.url}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Isi Modal */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* 1. Rekap Informasi 7 Hari Terakhir */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Rekap Status 7 Hari Terakhir
                </h4>
                
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="bg-slate-100 text-slate-500 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Tanggal</th>
                        <th className="py-2.5 px-4 text-center">Uptime</th>
                        <th className="py-2.5 px-4 text-center">Latency</th>
                        <th className="py-2.5 px-4 text-right">Status Servis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {last7DaysData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-medium text-slate-800">{row.date}</td>
                          <td className="py-2.5 px-4 text-center font-mono text-emerald-600 font-semibold">{row.uptime}</td>
                          <td className="py-2.5 px-4 text-center font-mono text-slate-600">{row.ping}</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              row.status.includes("Warning") ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Screenshot Aplikasi (Maksimal 7 Hari Terakhir) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    Screenshot Tampilan Aplikasi (7 Hari Terakhir)
                  </h4>
                  <span className="text-[11px] text-slate-400 italic">
                    *Gambar &gt;7 hari otomatis dihapus & ditimpa rotasi baru
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {last7DaysData.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <div className="h-28 bg-slate-200 flex flex-col items-center justify-center text-slate-400 p-2 relative group">
                        <ImageIcon className="w-8 h-8 mb-1 opacity-60" />
                        <span className="text-[10px] font-semibold text-slate-500">
                          Screenshot_{item.date.replace(/\s+/g, "_")}.png
                        </span>
                        <div className="absolute inset-0 bg-teal-900/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                          Lihat Full Resolusi
                        </div>
                      </div>
                      
                      <div className="p-2 bg-white border-t border-slate-200 flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-slate-700">{item.date}</span>
                        <span className="text-emerald-600 font-mono font-bold">Terverifikasi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}