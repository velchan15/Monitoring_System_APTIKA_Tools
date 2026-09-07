import {
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { StatusKey, StatusMetric } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  StatusKey,
  { icon: LucideIcon; iconBg: string; iconColor: string; valueColor: string; labelColor: string }
> = {
  total: {
    icon: LayoutGrid,
    iconBg: "bg-blue-100",
    iconColor: "text-brand",
    valueColor: "text-ink",
    labelColor: "text-ink/55",
  },
  online: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-status-online",
    valueColor: "text-status-online",
    labelColor: "text-status-online/80",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-status-warning",
    valueColor: "text-status-warning",
    labelColor: "text-status-warning/80",
  },
  offline: {
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-status-offline",
    valueColor: "text-status-offline",
    labelColor: "text-status-offline/80",
  },
  maintenance: {
    icon: Wrench,
    iconBg: "bg-purple-100",
    iconColor: "text-status-maintenance",
    valueColor: "text-ink",
    labelColor: "text-ink/55",
  },
};

const statusBorderColors: Record<StatusKey, string> = {
  total: "border-border",
  online: "border-emerald-200",
  warning: "border-amber-200",
  offline: "border-red-200",
  maintenance: "border-purple-200",
};

interface StatusCardProps {
  metric: StatusMetric;
}

export function StatusCard({ metric }: StatusCardProps) {
  const style = statusStyles[metric.key];
  const Icon = style.icon;
  const borderColor = statusBorderColors[metric.key];

  return (
    <div className={cn("rounded-xl border bg-white p-4 shadow-2xs hover:shadow-sm transition-shadow", borderColor)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
          {metric.label}
        </p>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            style.iconBg
          )}
        >
          <Icon className={cn("h-4.5 w-4.5", style.iconColor)} aria-hidden="true" />
        </span>
      </div>
      <p className={cn("mt-2 font-mono text-3xl font-bold tabular-nums", style.valueColor)}>
        {metric.value.toLocaleString("id-ID")}
      </p>
      <p className={cn("mt-1 text-xs font-medium", style.labelColor)}>
        {metric.subLabel}
      </p>
    </div>
  );
}
