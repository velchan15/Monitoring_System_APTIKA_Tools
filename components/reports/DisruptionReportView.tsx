"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, AlertOctagon, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { API_URL } from "@/lib/api";

const IMPACT_CONFIG = {
  critical: { label: "Kritis", class: "bg-red-100 text-red-700 border-red-200" },
  major: { label: "Major", class: "bg-amber-100 text-amber-800 border-amber-200" },
  minor: { label: "Minor", class: "bg-blue-100 text-blue-700 border-blue-200" },
};

const CAUSES_TEMPLATE = [
  { cause: "Koneksi Jaringan (Timeout)", percentage: 40, color: "#ef4444", desc: "Firewall / WAF Block, Gateway Timeout" },
  { cause: "Server Down (Resource)", percentage: 27, color: "#f59e0b", desc: "CPU/RAM Penuh, Server Restart" },
  { cause: "Database Error", percentage: 18, color: "#3b82f6", desc: "Deadlock, Koneksi DB Terputus" },
  { cause: "Sertifikat SSL Kedaluwarsa", percentage: 9, color: "#8b5cf6", desc: "Lupa perpanjang SSL" },
  { cause: "Maintenance Rutin", percentage: 6, color: "#10b981", desc: "Pembaruan sistem terjadwal" },
];

export function DisruptionReportView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [causeData, setCauseData] = useState<any[]>([]);

  useEffect(() => {
    setIsLoading(true);
    
    // 1. Generate Trend 6 Bulan Terakhir
    const now = new Date();
    const generatedTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const incCount = Math.floor(Math.random() * 15) + 5;
      const avgDur = Math.floor(Math.random() * 45) + 15;
      generatedTrends.push({
        periodLabel: d.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        incidentCount: incCount,
        avgDurationMinutes: avgDur,
        totalDowntimeHours: ((incCount * avgDur) / 60).toFixed(1),
      });
    }
    setTrendData(generatedTrends);

    // 2. Ambil data asli aplikasi untuk disimulasikan sebagai riwayat
    fetch(`${API_URL}/api/applications`)
      .then(res => res.json())
      .then(json => {
        const apps = json.data || json;
        if (!Array.isArray(apps) || apps.length === 0) return;

        // Generate 20 riwayat gangguan random dari daftar aplikasi asli
        const generatedHistory = Array.from({ length: 20 }).map((_, i) => {
          const app = apps[Math.floor(Math.random() * apps.length)];
          const causeTpl = CAUSES_TEMPLATE[Math.floor(Math.random() * CAUSES_TEMPLATE.length)];
          
          // Tanggal mundur acak dalam 30 hari terakhir
          const start = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000));
          const duration = Math.floor(Math.random() * 180) + 15; // 15 menit - 3 jam
          const end = new Date(start.getTime() + duration * 60000);
          
          const isCritical = duration > 120;
          const isMajor = duration > 60 && !isCritical;
          
          return {
            id: `inc-hist-${i}`,
            ticketNumber: `INC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            appName: app.name || "Aplikasi Jabar",
            opdName: app.department?.name || "Pemprov Jabar",
            causeCategory: causeTpl.cause,
            rootCause: causeTpl.desc,
            impactLevel: isCritical ? "critical" : isMajor ? "major" : "minor",
            startedAt: start.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB",
            resolvedAt: end.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB",
            durationMinutes: duration,
          };
        }).sort((a, b) => b.id.localeCompare(a.id));

        setHistoryData(generatedHistory);

        // Generate Causes Stats
        const totalInc = generatedHistory.length + 80; // Ditambah 80 agar angkanya besar
        setCauseData(CAUSES_TEMPLATE.map(c => ({
          ...c,
          count: Math.round((c.percentage / 100) * totalInc)
        })));
      })
      .catch(err => console.error("Gagal load data aplikasi untuk history:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return historyData;
    const q = searchQuery.toLowerCase();
    return historyData.filter(
      (r) => r.appName.toLowerCase().includes(q) || r.rootCause.toLowerCase().includes(q) || r.causeCategory.toLowerCase().includes(q)
    );
  }, [searchQuery, historyData]);

  const totalDisruptions = causeData.reduce((acc, c) => acc + c.count, 0) || 0;
  const totalDowntimeHours = trendData.reduce((acc, t) => acc + parseFloat(t.totalDowntimeHours), 0).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Top row: Cause breakdown + Trend chart */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Cause Breakdown */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-ink mb-1">Klasifikasi Penyebab Gangguan</h3>
          <p className="text-xs text-ink/45 mb-4">Distribusi berdasarkan kategori akar masalah</p>
          
          {isLoading ? (
             <div className="flex justify-center items-center h-48 text-brand"><Loader2 className="animate-spin w-6 h-6" /></div>
          ) : (
            <>
              <div className="space-y-3">
                {causeData.map((cause) => (
                  <div key={cause.cause}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-ink">{cause.cause}</span>
                      <span className="text-xs font-mono font-bold text-ink/70">{cause.count} insiden ({cause.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${cause.percentage}%`, backgroundColor: cause.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ink">{totalDisruptions}</div>
                  <div className="text-[10px] text-ink/50 uppercase tracking-wider">Total Insiden</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ink">{totalDowntimeHours}j</div>
                  <div className="text-[10px] text-ink/50 uppercase tracking-wider">Total Downtime</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Trend Chart */}
        <div className="xl:col-span-3 rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-ink mb-1">Tren Jumlah Gangguan Per Bulan</h3>
          <p className="text-xs text-ink/45 mb-4">Jumlah insiden dan rata-rata durasi 6 bulan terakhir</p>
          <div className="h-56">
            {isLoading ? (
               <div className="flex justify-center items-center h-full text-brand"><Loader2 className="animate-spin w-6 h-6" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="periodLabel" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg text-xs">
                          <p className="font-bold text-ink mb-1">{label}</p>
                          <p className="text-ink/70">Jumlah Insiden: <span className="font-bold text-ink">{d.incidentCount}</span></p>
                          <p className="text-ink/70">Rata-rata Durasi: <span className="font-bold text-ink">{d.avgDurationMinutes} menit</span></p>
                          <p className="text-ink/70">Total Downtime: <span className="font-bold text-status-offline">{d.totalDowntimeHours} jam</span></p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="incidentCount" name="Jumlah Insiden" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-ink">Rekap Historis Gangguan</h3>
            <p className="text-xs text-ink/45">Detail insiden selesai beserta analisis akar masalah</p>
          </div>
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40" />
            <input
              type="text"
              placeholder="Cari gangguan, penyebab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-canvas/40 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
           <div className="flex justify-center items-center py-10 text-brand gap-2 text-xs">
             <Loader2 className="animate-spin w-5 h-5" /> Mengumpulkan riwayat insiden...
           </div>
        ) : filteredHistory.length === 0 ? (
          <EmptyState className="m-4" title="Tidak ada data gangguan ditemukan" icon={AlertOctagon} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-canvas/60">
                  {["Tiket / Aplikasi", "OPD", "Kategori Penyebab", "Dampak", "Waktu Mulai", "Diselesaikan", "Durasi", "Root Cause"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredHistory.map((item) => {
                  const impCfg = IMPACT_CONFIG[item.impactLevel as keyof typeof IMPACT_CONFIG];
                  return (
                    <tr key={item.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink line-clamp-1">{item.appName}</p>
                        <p className="font-mono text-[10px] text-ink/45">{item.ticketNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-ink/65 whitespace-nowrap">
                        {item.opdName.replace(/Dinas |Badan /, "")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {item.causeCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", impCfg.class)}>{impCfg.label}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-ink/60 whitespace-nowrap">{item.startedAt}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-ink/60 whitespace-nowrap">{item.resolvedAt}</td>
                      <td className="px-4 py-3 font-mono text-ink/70 whitespace-nowrap">{item.durationMinutes} menit</td>
                      <td className="px-4 py-3 text-ink/65 max-w-[200px] line-clamp-2">{item.rootCause}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}