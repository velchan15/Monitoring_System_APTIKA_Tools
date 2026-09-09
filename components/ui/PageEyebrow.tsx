import React from "react";
import { cn } from "@/lib/utils";

interface PageEyebrowProps {
  children: React.ReactNode;
  variant?: "teal" | "blue" | "amber" | "slate";
  className?: string;
}

const eyebrowStyles = {
  teal: "text-teal-700 bg-teal-50 border-teal-200",
  blue: "text-brand bg-brand-soft border-brand/20",
  amber: "text-amber-800 bg-amber-50 border-amber-200",
  slate: "text-slate-600 bg-slate-100 border-slate-200",
};

export function PageEyebrow({
  children,
  variant = "teal",
  className,
}: PageEyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full border",
        eyebrowStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
