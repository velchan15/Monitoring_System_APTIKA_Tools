import React from "react";
import { cn } from "@/lib/utils";

export type StatusType = "online" | "warning" | "offline" | "maintenance" | "resolved" | "active";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<string, { label: string; class: string; dot: string }> = {
  online: {
    label: "Normal / Online",
    class: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  UP: {
    label: "Online",
    class: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  warning: {
    label: "Warning / Degraded",
    class: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  WARNING: {
    label: "Warning",
    class: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  offline: {
    label: "Kritis / Offline",
    class: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  DOWN: {
    label: "Offline",
    class: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  critical: {
    label: "Kritis",
    class: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  maintenance: {
    label: "Pemeliharaan",
    class: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  resolved: {
    label: "Selesai",
    class: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  active: {
    label: "Aktif",
    class: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  normal: {
    label: "Normal",
    class: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  high: {
    label: "Tinggi",
    class: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
};

export function StatusBadge({
  status,
  label,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    class: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.class,
        className
      )}
    >
      <span className={cn("rounded-full shrink-0", size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2", config.dot)} />
      {label || config.label}
    </span>
  );
}
