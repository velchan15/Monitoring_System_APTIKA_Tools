"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Image as ImageIcon,
  Loader2
} from "lucide-react";

// Tipe data berdasarkan response API
interface Application {
  id: string;
  name: string;
  url: string;
  status: "ONLINE" | "WARNING" | "OFFLINE";
  department?: {
    id: string;
    code: string;
    name: string;
  };
  latency?: number;
  uptimePercent?: number;
  lastChecked?: string;
}

export default function OpdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opdId = (params.id as string).toLowerCase();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedApp, setSelectedApp] = useState<{
    name: string;
    url: string;
    status: string;
  } | null>(null);

  const closeModal = useCallback(() => setSelectedApp(null), []);

  // Modal accessibility
  useEffect(() => {
    if (!selectedApp) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedApp, closeModal]);

  // Fetch data dari API Backend
  useEffect(() => {
    const fetchApps = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:3001/api/applications");
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        
        const jsonRes = await res.json();
        const data = jsonRes.data || jsonRes;
        
        if (Array.isArray(data)) {
          // Filter hanya aplikasi milik OPD ini
          const filteredApps = data.filter(
            (app: Application) => app.department?.code?.toLowerCase() === opdId
          );
          setApplications(filteredApps);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, [opdId]);

  // Kalkulasi Metrik OPD dari data asli
  const opdMetrics = useMemo(() => {
    if (applications.length === 0) return null;

    // Ambil nama departemen dari aplikasi pertama (karena semua di-filter dari OPD yg sama)
    const deptName = applications[0].department?.name || opdId.toUpperCase();
    const deptCode = applications[0].department?.code || opdId;

    let online = 0, warning = 0, offline = 0;
    let totalLatency = 0, totalUptime = 0, appsWithMetrics = 0;

    applications.forEach(app => {
      // Normalisasi status
      const status = (!app.status || app.status as any === "NORMAL") ? "ONLINE" : app.status;
      if (status === "ONLINE") online++;
      else if (status === "WARNING") warning++;
      else if (status === "OFFLINE" || status as any === "CRITICAL" || status as any === "DOWN") offline++;

      const latency = (app as any).latency || (app as any).avgResponseMs || 0;
      const uptime = (app as any).uptimePercent || (app as any).uptimePercentage || 100;

      totalLatency += latency;
      totalUptime += uptime;
      appsWithMetrics++;
    });

    return {
      name: deptName,
      code: deptCode,
      category: "Sektor Pemerintahan", // Sementara statis karena tidak ada di tabel department
      totalApps: applications.length,
      onlineApps: online,
      warningApps: warning,
      offlineApps: offline,
      avgLatencyMs: appsWithMetrics > 0 ? Math.round(totalLatency / appsWithMetrics) : 0,
      avgUptime: appsWithMetrics > 0 ? (totalUptime / appsWithMetrics) : 100,
      healthStatus: offline > 0 ? "critical" : warning > 0 ? "warning" : "healthy",
      // Data kontak belum ada di schema database, dikosongkan sementara
      picName: "Belum Diatur",
      picEmail: "-",
      picPhone: "-",
    };
  }, [applications, opdId]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !opdMetrics) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-700">
        <h1 className="text-2xl font-bold mb-2">Perangkat Daerah Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-6">
          {error || `Tidak ada data aplikasi untuk kode OPD (${opdId.toUpperCase()}).`}
        </p>
        <button 
          onClick={() => window.close()} 
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
        >
          Tutup Halaman
        </button>
      </div>
    );
  }

  // Data Rekap Status 7 Hari Terakhir (Statis untuk UI Mockup)
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
              {opdMetrics.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kode OPD: <span className="font-mono text-slate-700 uppercase">{opdMetrics.code}</span>
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
            <div className="text-3xl font-bold text-slate-900">{opdMetrics.totalApps}</div>
            <p className="text-xs text-slate-400 mt-1">Terdaftar di katalog</p>
          </div>

          {/* 2. Avg SLA Uptime */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Avg SLA Uptime</span>
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div className={`text-3xl font-bold ${opdMetrics.avgUptime < 95 ? 'text-red-600' : 'text-emerald-600'}`}>
              {opdMetrics.avgUptime.toFixed(2)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">Rata-rata uptime hari ini</p>
          </div>

          {/* 3. Avg Latensi */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Avg Latensi</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{opdMetrics.avgLatencyMs} <span className="text-sm font-normal text-slate-500">ms</span></div>
            <p className="text-xs text-slate-400 mt-1">Waktu respon rata-rata</p>
          </div>

          {/* 4. Aplikasi Terpantau */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Aplikasi Terpantau</span>
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {opdMetrics.onlineApps} <span className="text-sm font-normal text-slate-400">/ {opdMetrics.totalApps}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{opdMetrics.onlineApps} Online</span>
              {opdMetrics.offlineApps > 0 && (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-1"></span>
                  <span>{opdMetrics.offlineApps} Offline</span>
                </>
              )}
            </div>
          </div>

          {/* 5. Kontak PIC */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-1 opacity-75">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Kontak PIC</span>
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 italic">
                {opdMetrics.picName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{opdMetrics.picPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <span>{opdMetrics.picEmail}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Daftar Aplikasi & Uptime Monitor */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Daftar Aplikasi & Uptime ({applications.length})
          </h2>

          <div className="space-y-4">
            {applications.map((app) => {
              const status = (!app.status || app.status as any === "NORMAL") ? "ONLINE" : app.status;
              const isOffline = status === "OFFLINE" || status as any === "DOWN" || status as any === "CRITICAL";
              const isWarning = status === "WARNING";
              
              const statusDotColor = isOffline 
                ? "bg-red-500" 
                : isWarning 
                ? "bg-amber-500" 
                : "bg-emerald-500";
              
              const appLatency = (app as any).latency || (app as any).avgResponseMs || 0;
              const appUptime = (app as any).uptimePercent || (app as any).uptimePercentage || 100;

              return (
                <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-3">
                  {/* Header Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${statusDotColor} motion-safe:animate-pulse`} />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {app.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700 uppercase">{opdMetrics.code}</span>
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

                    {/* Tombol Detail + Metrik */}
                    <div className="flex items-center gap-4 self-end md:self-auto text-xs">
                      
                      {/* Tombol Detail */}
                      <button
                        type="button"
                        onClick={() => setSelectedApp({ name: app.name, url: app.url, status: status })}
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
                          {isOffline ? "Timeout" : `${appLatency}ms`}
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLA Harian</span>
                        <span className={`font-mono font-bold text-sm ${appUptime < 95 ? 'text-red-600' : 'text-slate-900'}`}>
                          {typeof appUptime === 'number' ? appUptime.toFixed(2) : '100.00'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visualisasi Bar Uptime 30 Hari */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1 h-6 w-full">
                      {Array.from({ length: 30 }).map((_, i) => {
                        let barColor = "bg-emerald-500";
                        if (isOffline && i === 29) barColor = "bg-red-500";
                        else if (isWarning && i === 29) barColor = "bg-amber-500";
                        else if (i === 18 && opdMetrics.healthStatus === "critical") barColor = "bg-red-500";
                        else if (i === 24 && opdMetrics.healthStatus !== "healthy") barColor = "bg-amber-500";

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

      {/* POP-UP MODAL DETAIL (REKAP 7 HARI & SINGLE SCREENSHOT) */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`Detail monitoring ${selectedApp.name}`}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
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
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Isi Modal */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* 1. Rekap Tabel 7 Hari Terakhir */}
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

              {/* 2. Screenshot Aplikasi (1 Gambar Terbaru & Efisien) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    Tangkapan Layar Terbaru
                  </h4>
                  <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono font-semibold border border-teal-200">
                    Auto-overwrite
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div className="h-48 bg-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 relative group">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-60" />
                    <span className="text-xs font-semibold text-slate-600">
                      Belum ada tangkapan layar tersedia
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Menunggu eksekusi worker screenshot berikutnya
                    </span>
                  </div>
                  
                  <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Status Saat Ini</span>
                    </div>
                    <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${
                      selectedApp.status === "OFFLINE" ? "text-red-700 bg-red-50 border-red-200" :
                      selectedApp.status === "WARNING" ? "text-amber-700 bg-amber-50 border-amber-200" :
                      "text-emerald-700 bg-emerald-50 border-emerald-200"
                    }`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 text-right">
              <button
                type="button"
                onClick={closeModal}
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