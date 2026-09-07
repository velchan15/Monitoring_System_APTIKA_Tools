import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Tidak ada data ditemukan",
  description = "Silakan ubah filter atau kata kunci pencarian Anda.",
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-canvas/30",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-canvas text-ink/40 mb-3 border border-border">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-ink/50 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
