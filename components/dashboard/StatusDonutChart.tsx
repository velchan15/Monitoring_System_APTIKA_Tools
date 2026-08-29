"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, Wrench } from "lucide-react";

import { statusDonutData, type StatusDonutSlice } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const statusIcons = {
  online: CheckCircle2,
  warning: AlertTriangle,
  offline: XCircle,
  maintenance: Wrench,
};

export function StatusDonutChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalApps = statusDonutData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-white shadow-2xs">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-ink">
          {activeIndex !== null ? "Distribusi Status" : "Distribusi Status"}
        </h2>
        <p className="text-[11px] text-ink/45">Proporsi kondisi {totalApps} sistem saat ini</p>
      </div>

      {/* Main: Donut Left + List Right */}
      <div className="flex flex-1 items-center gap-0 px-2 pb-4">
        {/* Donut */}
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDonutData}
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
                {statusDonutData.map((entry, index) => (
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
                    const data = payload[0].payload as StatusDonutSlice;
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
              {activeIndex !== null ? statusDonutData[activeIndex].value : totalApps}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
              {activeIndex !== null ? statusDonutData[activeIndex].name : "Total"}
            </span>
          </div>
        </div>

        {/* Legend List — matches reference style */}
        <div className="flex-1 space-y-2.5 pl-2">
          {statusDonutData.map((item, idx) => {
            const Icon = statusIcons[item.key as keyof typeof statusIcons];
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
