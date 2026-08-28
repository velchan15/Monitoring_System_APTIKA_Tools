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
  {
    icon: LucideIcon;
    iconClass: string;
    ringClass: string;
    subLabelClass: string;
  }
> = {
  total: {
    icon: LayoutGrid,
    iconClass: "text-brand",
    ringClass: "bg-brand-soft",
    subLabelClass: "text-ink/45",
  },
  online: {
    icon: CheckCircle2,
    iconClass: "text-status-online",
    ringClass: "bg-status-online/10",
    subLabelClass: "text-status-online",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-status-warning",
    ringClass: "bg-status-warning/10",
    subLabelClass: "text-status-warning",
  },
  offline: {
    icon: XCircle,
    iconClass: "text-status-offline",
    ringClass: "bg-status-offline/10",
    subLabelClass: "text-status-offline",
  },
  maintenance: {
    icon: Wrench,
    iconClass: "text-status-maintenance",
    ringClass: "bg-status-maintenance/10",
    subLabelClass: "text-ink/45",
  },
};

interface StatusCardProps {
  metric: StatusMetric;
}

export function StatusCard({ metric }: StatusCardProps) {
  const style = statusStyles[metric.key];
  const Icon = style.icon;

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
          {metric.label}
        </p>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            style.ringClass
          )}
        >
          <Icon className={cn("h-5 w-5", style.iconClass)} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-ink">
        {metric.value.toLocaleString("id-ID")}
      </p>
      <p className={cn("mt-1 text-xs font-medium", style.subLabelClass)}>
        {metric.subLabel}
      </p>
    </div>
  );
}
