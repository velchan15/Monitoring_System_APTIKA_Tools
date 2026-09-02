"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type RangeOption = "7d" | "30d";

interface StatusTrendChartProps {
  title?: string;
}

export function StatusTrendChart({ title = "Grafik Status Aplikasi" }: StatusTrendChartProps) {
  const [range, setRange] = useState<RangeOption>("7d");

  // Mock data titik grafik berdasarkan rentang waktu
  const labels7d = ["23 Agu", "24 Agu", "25 Agu", "26 Agu", "27 Agu", "28 Agu", "29 Agu"];
  const labels30d = ["02 Agu", "07 Agu", "12 Agu", "17 Agu", "22 Agu", "27 Agu", "01 Sep"];

  const currentLabels = range === "7d" ? labels7d : labels30d;

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
              7 Hari Terakhir
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
              30 Hari Terakhir
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
            <path
              d={range === "7d" 
                ? "M 0 15 L 80 18 L 160 14 L 240 12 L 320 15 L 400 15 L 500 13" 
                : "M 0 20 L 80 12 L 160 18 L 240 10 L 320 14 L 400 16 L 500 12"}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            {/* Line Warning (Amber) */}
            <path
              d={range === "7d"
                ? "M 0 138 L 80 135 L 160 140 L 240 138 L 320 136 L 400 138 L 500 137"
                : "M 0 135 L 80 139 L 160 136 L 240 140 L 320 137 L 400 135 L 500 138"}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            {/* Line Offline (Red) */}
            <path
              d={range === "7d"
                ? "M 0 145 L 80 146 L 160 144 L 240 145 L 320 145 L 400 146 L 500 145"
                : "M 0 144 L 80 145 L 160 146 L 240 144 L 320 145 L 400 144 L 500 145"}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            />
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