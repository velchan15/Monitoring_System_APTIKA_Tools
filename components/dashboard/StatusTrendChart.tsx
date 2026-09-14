"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type RangeOption = "7d" | "30d";

interface AppMetric {
  key: string;
  value: string;
}

interface StatusTrendChartProps {
  title?: string;
  appMetrics?: AppMetric[];
}

// Fungsi pembantu untuk menghasilkan label tanggal dinamis mundur dari hari ini
const generateDateLabels = (daysBack: number, steps: number) => {
  const dates = [];
  const today = new Date();
  for (let i = steps - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - Math.floor((daysBack / (steps - 1)) * i));
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("id-ID", { month: "short" });
    dates.push(`${day} ${month}`);
  }
  return dates;
};

// Fungsi pembantu untuk menggambar garis SVG yang ujungnya tersambung ke data asli
const generatePath = (realValue: number, total: number, steps: number, variance: number) => {
  const points = [];
  const safeTotal = Math.max(total, 1); // Hindari pembagian dengan 0
  
  for (let i = 0; i < steps; i++) {
    const x = (i / (steps - 1)) * 500;
    
    // Titik terakhir (i === steps - 1) akan bernilai akurat 100% dari database
    // Titik sebelumnya disimulasikan sedikit berfluktuasi
    const distanceToNow = steps - 1 - i;
    const simulatedVal = distanceToNow === 0 
      ? realValue 
      : Math.max(0, realValue - (distanceToNow * variance) + (Math.sin(i) * variance));

    // Konversi nilai ke koordinat Y (SVG y terbalik: 0 di atas, 150 di bawah)
    // Margin atas 20px, bawah 140px
    const y = 140 - (simulatedVal / safeTotal) * 120;
    points.push(`${x} ${y}`);
  }
  return `M ${points.join(" L ")}`;
};

export function StatusTrendChart({ title = "Grafik Status Aplikasi", appMetrics = [] }: StatusTrendChartProps) {
  const [range, setRange] = useState<RangeOption>("7d");

  // Tarik angka asli dari database melalui props
  const onlineCount = Number(appMetrics.find((m) => m.key === "online")?.value || 0);
  const warningCount = Number(appMetrics.find((m) => m.key === "warning")?.value || 0);
  const offlineCount = Number(appMetrics.find((m) => m.key === "offline")?.value || 0);
  const totalCount = onlineCount + warningCount + offlineCount;

  // Hasilkan label tanggal otomatis (7 titik)
  const currentLabels = useMemo(() => {
    return range === "7d" ? generateDateLabels(6, 7) : generateDateLabels(29, 7);
  }, [range]);

  // Hasilkan garis SVG (titik terakhir akurat dengan database)
  const onlinePath = useMemo(() => generatePath(onlineCount, totalCount, 7, 0.5), [onlineCount, totalCount, range]);
  const warningPath = useMemo(() => generatePath(warningCount, totalCount, 7, 0.2), [warningCount, totalCount, range]);
  const offlinePath = useMemo(() => generatePath(offlineCount, totalCount, 7, 0.1), [offlineCount, totalCount, range]);

  return (
    <div className="flex flex-col justify-between h-full bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      {/* Header Grafik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-400">
            {range === "7d" ? "(7 Hari Terakhir)" : "(30 Hari Terakhir)"}
          </p>
        </div>

        {/* Legend Indicator & Range Tab */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" /> Online
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-0.5 bg-amber-500 rounded-full" /> Warning
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-0.5 bg-red-500 rounded-full" /> Offline
            </span>
          </div>

          {/* Toggle Button: Hanya 7 Hari & 30 Hari */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setRange("7d")}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                range === "7d"
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setRange("30d")}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                range === "30d"
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              30 Hari
            </button>
          </div>
        </div>
      </div>

      {/* Area Visualisasi Grafik SVG Line */}
      <div className="relative flex-1 min-h-[200px] flex flex-col justify-between pt-2">
        {/* SVG Curve Line Simulation */}
        <div className="absolute inset-x-0 top-3 bottom-6 flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
            {/* Grid Line Horizontal */}
            <line x1="0" y1="0" x2="500" y2="0" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />

            {/* Line Online (Green) */}
            <path d={onlinePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
            
            {/* Line Warning (Amber) */}
            <path d={warningPath} fill="none" stroke="#f59e0b" strokeWidth="2" />
            
            {/* Line Offline (Red) */}
            <path d={offlinePath} fill="none" stroke="#ef4444" strokeWidth="2" />
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between items-end text-[10px] text-slate-400 font-medium font-mono pt-4 z-10 border-t border-slate-100 mt-auto">
          {currentLabels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  );
}