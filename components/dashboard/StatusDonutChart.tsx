"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

const statusIcons = {
  online: CheckCircle2,
  warning: AlertTriangle,
  offline: XCircle,
  maintenance: Wrench,
};

// Mendefinisikan tipe data yang diterima dari app/page.tsx
interface AppMetric {
  key: string;
  label: string;
  value: string;
  subtext: string;
  variant: string;
}

interface StatusDonutChartProps {
  appMetrics?: AppMetric[];
}

export function StatusDonutChart({ appMetrics = [] }: StatusDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Jika appMetrics belum tersedia, buat array default agar grafik tidak rusak
  const safeMetrics = appMetrics.length > 0 ? appMetrics : [
    { key: "total", value: "0" },
    { key: "online", value: "0" },
    { key: "warning", value: "0" },
    { key: "offline", value: "0" },
    { key: "maintenance", value: "0" },
  ];

  // Mengambil angka total langsung dari props (yang sudah dihitung di app/page.tsx)
  const totalApps = Number(safeMetrics.find(m => m.key === "total")?.value || 0);

  // Membentuk ulang data agar sesuai dengan format yang diminta Recharts PieChart
  const chartData = [
    {
      key: "online",
      name: "Online",
      value: Number(safeMetrics.find(m => m.key === "online")?.value || 0),
      color: "#10b981", // Hijau
    },
    {
      key: "warning",
      name: "Warning",
      value: Number(safeMetrics.find(m => m.key === "warning")?.value || 0),
      color: "#f59e0b", // Kuning/Oranye
    },
    {
      key: "offline",
      name: "Offline",
      value: Number(safeMetrics.find(m => m.key === "offline")?.value || 0),
      color: "#ef4444", // Merah
    },
    {
      key: "maintenance",
      name: "Maintenance",
      value: Number(safeMetrics.find(m => m.key === "maintenance")?.value || 0),
      color: "#8b5cf6", // Ungu
    },
  ].map(item => ({
    ...item,
    // Hitung persentase dinamis. Jika total 0, langsung jadikan 0 agar tidak error NaN
    percentage: totalApps > 0 ? Number(((item.value / totalApps) * 100).toFixed(2)) : 0,
  }));

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-white shadow-2xs">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-ink">Distribusi Status</h2>
        <p className="text-[11px] text-ink/45">Proporsi kondisi {totalApps} sistem saat ini</p>
      </div>

      {/* Main: Donut Left + List Right */}
      <div className="flex flex-1 items-center gap-0 px-2 pb-4">
        {/* Donut */}
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.key}`}
                    fill={entry.color}
                    stroke={activeIndex === index ? "#ffffff" : "transparent"}
                    strokeWidth={activeIndex === index ? 3 : 0}
                    opacity={activeIndex !== null && activeIndex !== index ? 0.6 : 1}
                    style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                          <span className="font-semibold text-ink">{data.name}</span>
                        </div>
                        <p className="mt-1 font-mono font-bold text-ink">
                          {data.value}{" "}
                          <span className="font-normal text-ink/50">({data.percentage}%)</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-bold tracking-tight text-ink">
              {activeIndex !== null ? chartData[activeIndex].value : totalApps}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
              {activeIndex !== null ? chartData[activeIndex].name : "Total"}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 space-y-2.5 pl-2">
          {chartData.map((item, idx) => {
            const isSelected = activeIndex === idx;

            return (
              <div
                key={item.key}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors",
                  isSelected ? "bg-canvas" : "hover:bg-canvas/60"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-ink/80">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 text-right font-mono text-xs">
                  <span className="font-bold text-ink">{item.value}</span>
                  <span className="w-14 text-right text-ink/50">
                    ({item.percentage === 0 ? "0%" : `${item.percentage}%`})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}