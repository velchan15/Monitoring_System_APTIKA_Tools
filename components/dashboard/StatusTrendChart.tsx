"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  statusTrendData,
  type TrendRange,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const rangeOptions: { key: TrendRange; label: string }[] = [
  { key: "harian", label: "7 Hari Terakhir" },
  { key: "mingguan", label: "4 Minggu Terakhir" },
  { key: "bulanan", label: "30 Hari Terakhir" },
];

const seriesMeta = [
  { key: "online" as const, label: "Online", color: "#0E9F6E" },
  { key: "warning" as const, label: "Warning", color: "#D97706" },
  { key: "offline" as const, label: "Offline", color: "#DC2626" },
];

interface StatusTrendChartProps {
  title?: string;
}

export function StatusTrendChart({ title = "Grafik Status Aplikasi" }: StatusTrendChartProps) {
  const [range, setRange] = useState<TrendRange>("harian");
  const data = statusTrendData[range];
  const rangeLabel = rangeOptions.find((r) => r.key === range)?.label || "";

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-white shadow-2xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <p className="text-[11px] text-ink/45">({rangeLabel})</p>
        </div>

        {/* Legend inline */}
        <div className="flex items-center gap-4">
          {seriesMeta.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-xs text-ink/60">
              <span
                className="inline-block h-0.5 w-5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>

        {/* Range selector — inline buttons matching reference */}
        <div className="flex items-center gap-0 rounded-lg border border-border overflow-hidden">
          {rangeOptions.map((opt, idx) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setRange(opt.key)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium transition-colors",
                idx > 0 && "border-l border-border",
                range === opt.key
                  ? "bg-brand text-white"
                  : "bg-white text-ink/60 hover:bg-canvas hover:text-ink"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2 pb-4" style={{ minHeight: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 4" stroke="#E3E6EC" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#8792A8" }}
              tickLine={false}
              axisLine={{ stroke: "#E3E6EC" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#8792A8" }}
              tickLine={false}
              axisLine={false}
              width={32}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                borderColor: "#E3E6EC",
                fontSize: 12,
                boxShadow: "0 8px 16px -4px rgba(0,0,0,0.12)",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#12161F", fontWeight: 600, marginBottom: 4 }}
            />
            {seriesMeta.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={series.color}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: series.color }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "white" }}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}