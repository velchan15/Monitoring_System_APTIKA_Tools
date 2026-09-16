"use client";

import { useState, useMemo } from "react";
import { Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Tipe data sesuai response dari backend
export interface Application {
  id: string;
  name: string;
  status: "ONLINE" | "WARNING" | "OFFLINE";
  department: {
    id: string;
    code: string;
    name: string;
  };
  latency?: number;
  uptimePercent?: number;
}

interface DashboardOpdProps {
  onViewAll?: () => void;
  applications: Application[]; // Tambah prop aplikasi
}

// ---- Fungsi Helper untuk Grouping & Kalkulasi Data Asli ----
function useProcessedOpdData(apps: Application[]) {
  return useMemo(() => {
    if (!apps || apps.length === 0) return [];

    const grouped = apps.reduce((acc, app) => {
      const deptCode = app.department.code;
      if (!acc[deptCode]) {
        acc[deptCode] = {
          code: deptCode,
          name: app.department.name,
          totalApps: 0,
          onlineApps: 0,
          warningApps: 0,
          offlineApps: 0,
          totalLatency: 0,
          totalUptime: 0,
          appsWithMetrics: 0,
          appsList: [],
        };
      }

      acc[deptCode].totalApps += 1;
      acc[deptCode].appsList.push(app.name);

      if (app.status === "ONLINE") acc[deptCode].onlineApps += 1;
      if (app.status === "WARNING") acc[deptCode].warningApps += 1;
      if (app.status === "OFFLINE") acc[deptCode].offlineApps += 1;

      // Fallback jika belum ada data metrik di db
      const latency = app.latency || 0;
      const uptime = app.uptimePercent || 100;

      acc[deptCode].totalLatency += latency;
      acc[deptCode].totalUptime += uptime;
      acc[deptCode].appsWithMetrics += 1;

      return acc;
    }, {} as Record<string, any>);

    const summariesArray = Object.values(grouped).map((opd: any) => {
      const avgLatencyMs =
        opd.appsWithMetrics > 0 ? Math.round(opd.totalLatency / opd.appsWithMetrics) : 0;
      const avgUptime =
        opd.appsWithMetrics > 0 ? opd.totalUptime / opd.appsWithMetrics : 100.0;

      // Tentukan status kesehatan berdasarkan jumlah aplikasi yang down/warning
      let healthStatus = "healthy";
      if (opd.offlineApps > 0) healthStatus = "critical";
      else if (opd.warningApps > 0) healthStatus = "warning";

      return { ...opd, avgLatencyMs, avgUptime, healthStatus };
    });

    // Urutkan: Critical dulu -> Warning -> Paling banyak app
    return summariesArray.sort((a, b) => {
      if (b.offlineApps !== a.offlineApps) return b.offlineApps - a.offlineApps;
      if (b.warningApps !== a.warningApps) return b.warningApps - a.warningApps;
      return b.totalApps - a.totalApps;
    });
  }, [apps]);
}

// ---- Ringkasan Kompak OPD di Dashboard Utama (Dibatasi 5 Kartu) ----
export function DashboardOpdSummary({ onViewAll, applications }: DashboardOpdProps) {
  const allOpds = useProcessedOpdData(applications);
  const opds = allOpds.slice(0, 5); // Ambil 5 yang paling butuh perhatian

  if (allOpds.length === 0) {
    return <div className="text-sm text-slate-500">Memuat data OPD...</div>;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-slate-900">Ringkasan per Perangkat Daerah</h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-xs font-semibold text-teal-600 hover:underline"
          >
            Lihat Semua PD <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {opds.map((opd) => (
          <button
            key={opd.code}
            type="button"
            onClick={() => window.open(`/opd/${opd.code}`, "_blank")}
            className="flex flex-col justify-between p-3 text-left transition-all rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:border-teal-500/50 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100/80 flex-shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate leading-snug" title={opd.name}>
                    {opd.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {opd.totalApps} App
                  </p>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Online</span>
                  <span className="font-mono font-bold text-emerald-600">{opd.onlineApps}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Warning</span>
                  <span className="font-mono font-bold text-amber-600">{opd.warningApps}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Offline</span>
                  <span className="font-mono font-bold text-red-600">{opd.offlineApps}</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 w-full text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Latency</span>
                <span className="font-mono font-semibold text-slate-700">{opd.avgLatencyMs} ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Uptime</span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    opd.healthStatus === "critical"
                      ? "text-red-600"
                      : opd.healthStatus === "warning"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  )}
                >
                  {opd.avgUptime.toFixed(2)}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Grid Halaman Penuh OPD (Menampilkan Semua Data) ----
export function OpdSummaryGrid({ applications }: { applications: Application[] }) {
  const opds = useProcessedOpdData(applications);
  const [healthFilter, setHealthFilter] = useState<string>("all");

  const filtered = opds.filter((opd) => {
    if (healthFilter === "healthy") return opd.healthStatus === "healthy";
    if (healthFilter === "warning") return opd.healthStatus === "warning";
    if (healthFilter === "critical") return opd.healthStatus === "critical";
    return true;
  });

  if (opds.length === 0) {
    return <div className="text-sm text-slate-500">Memuat data OPD...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
          {[
            { k: "all", l: "Semua OPD" },
            { k: "healthy", l: "Sehat" },
            { k: "warning", l: "Perhatian" },
            { k: "critical", l: "Kritis" },
          ].map((tab, idx) => (
            <button
              key={tab.k}
              type="button"
              onClick={() => setHealthFilter(tab.k)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                idx > 0 && "border-l border-slate-200",
                healthFilter === tab.k
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {tab.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((opd) => (
          <div
            key={opd.code}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-teal-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-700 border border-teal-200">
                  {opd.code.toUpperCase()}
                </span>
                <span 
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    opd.healthStatus === "critical" ? "bg-red-50 text-red-600 border-red-200" :
                    opd.healthStatus === "warning" ? "bg-amber-50 text-amber-600 border-amber-200" :
                    "bg-emerald-50 text-emerald-600 border-emerald-200"
                  )}
                >
                  {opd.healthStatus === "critical" ? "Kritis" : opd.healthStatus === "warning" ? "Perhatian" : "Sehat"}
                </span>
              </div>

              <h3 className="mt-2 text-xs font-bold text-slate-900 line-clamp-1" title={opd.name}>
                {opd.name}
              </h3>
              {/* Kategori diubah menjadi info insiden aktif (lebih relevan) */}
              <p className="text-[10px] text-slate-400">
                {opd.offlineApps > 0 || opd.warningApps > 0 
                  ? `${opd.offlineApps + opd.warningApps} Insiden Aktif` 
                  : 'Semua Layanan Normal'
                }
              </p>

              <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
                <div>
                  <p className="text-[9px] text-slate-400 font-semibold">Total</p>
                  <p className="font-mono text-xs font-bold text-slate-800">{opd.totalApps}</p>
                </div>
                <div>
                  <p className="text-[9px] text-emerald-600 font-semibold">Online</p>
                  <p className="font-mono text-xs font-bold text-emerald-600">{opd.onlineApps}</p>
                </div>
                <div>
                  <p className="text-[9px] text-red-600 font-semibold">Kendala</p>
                  <p className="font-mono text-xs font-bold text-red-600">
                    {opd.warningApps + opd.offlineApps}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.open(`/opd/${opd.code}`, "_blank")}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
            >
              Lihat {opd.appsList.length} Aplikasi
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}