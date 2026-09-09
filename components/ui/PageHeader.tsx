import React from "react";
import { cn } from "@/lib/utils";
import { PageEyebrow } from "./PageEyebrow";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1",
        className
      )}
    >
      <div>
        {eyebrow && (
          <div className="mb-1.5">
            <PageEyebrow>{eyebrow}</PageEyebrow>
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-xs text-ink/55">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
