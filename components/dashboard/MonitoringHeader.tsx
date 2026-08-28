import { Bell, Calendar, ChevronDown, Menu, RefreshCcw } from "lucide-react";

import { headerMeta } from "@/lib/dashboard-data";

interface MonitoringHeaderProps {
  onOpenSidebar: () => void;
}

export function MonitoringHeader({ onOpenSidebar }: MonitoringHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-2 border-b border-border bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-md border border-border p-2 text-ink/60 hover:bg-canvas lg:hidden"
          aria-label="Buka navigasi"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand font-mono text-xs font-semibold text-white">
            SM
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">
              Sistem Monitoring Aplikasi
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
              Provinsi Jawa Barat
            </p>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-xs text-ink/60 md:flex">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {headerMeta.dateTimeLabel}
        </div>

        <div className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-status-online sm:flex">
          <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {headerMeta.autoRefreshLabel}
          <span className="h-1.5 w-1.5 rounded-full bg-status-online motion-safe:animate-pulse" />
        </div>

        <button
          type="button"
          className="relative rounded-md border border-border p-2 text-ink/60 hover:bg-canvas"
          aria-label={`Notifikasi, ${headerMeta.notificationCount} belum dibaca`}
        >
          <Bell className="h-4 w-4" />
          {headerMeta.notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-offline px-1 font-mono text-[10px] font-semibold text-white">
              {headerMeta.notificationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2.5 hover:bg-canvas"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-xs font-semibold text-brand">
            {headerMeta.operatorInitials}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-xs font-medium text-ink">
              {headerMeta.operatorName}
            </span>
            <span className="block text-[11px] text-ink/45">
              {headerMeta.operatorEmail}
            </span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-ink/40 sm:block" />
        </button>
      </div>
    </header>
  );
}
