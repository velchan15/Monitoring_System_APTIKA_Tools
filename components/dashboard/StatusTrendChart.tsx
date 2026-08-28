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
  trendRangeLabels,
  type TrendRange,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const rangeOrder: TrendRange[] = ["harian", "mingguan", "bulanan"];

const seriesMeta = [
  { key: "online" as const, label: "Online", color: "#0E9F6E" },
  { key: "warning" as const, label: "Warning", color: "#D97706" },
  { key: "offline" as const, label: "Offline", color: "#DC2626" },
];

export function StatusTrendChart() {
  const [range, setRange] = useState<TrendRange>("harian");
  const data = statusTrendData[range];

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Grafik Status Aplikasi</p>
          <p className="text-xs text-ink/45">
            Tren jumlah aplikasi per status — {trendRangeLabels[range].toLowerCase()}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Rentang waktu grafik"
          className="flex rounded-lg border border-border bg-canvas p-0.5"
        >
          {rangeOrder.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={range === key}
              onClick={() => setRange(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                range === key
                  ? "bg-white text-brand shadow-sm"
                  : "text-ink/50 hover:text-ink"
              )}
            >
              {trendRangeLabels[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-ink/60">
        {seriesMeta.map((series) => (
          <span key={series.key} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: series.color }}
              aria-hidden="true"
            />
            {series.label}
          </span>
        ))}
      </div>

      <div className="mt-3 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#8792A8" }}
              tickLine={false}
              axisLine={{ stroke: "#E3E6EC" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8792A8" }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                borderColor: "#E3E6EC",
                fontSize: 12,
              }}
              labelStyle={{ color: "#12161F", fontWeight: 600 }}
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
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}