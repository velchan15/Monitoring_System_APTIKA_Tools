import React from "react";
import { cn } from "@/lib/utils";

export type SidebarBadgeVariant =
  | "neutral"
  | "red"
  | "amber"
  | "blue"
  | "emerald"
  | "active";

interface SidebarBadgeProps {
  children: React.ReactNode;
  variant?: SidebarBadgeVariant;
  className?: string;
}

const variantClasses: Record<SidebarBadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-600 border border-slate-200",
  red: "bg-red-100 text-red-700 font-bold border border-red-200",
  amber: "bg-amber-100 text-amber-800 font-bold border border-amber-200",
  blue: "bg-blue-100 text-blue-700 font-bold border border-blue-200",
  emerald: "bg-emerald-100 text-emerald-800 font-bold border border-emerald-200",
  active: "bg-white/20 text-white font-medium",
};

export function SidebarBadge({
  children,
  variant = "neutral",
  className,
}: SidebarBadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
