"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  Menu,
  RefreshCcw,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { mockNotifications } from "@/lib/data/notifications";

interface MonitoringHeaderProps {
  onOpenSidebar: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function MonitoringHeader({ onOpenSidebar, onNavigateTab }: MonitoringHeaderProps) {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);

  // Prevent hydration error - only render date after mount
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
  const recentNotifs = mockNotifications.filter((n) => !n.isRead).slice(0, 3);

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const dateLabel = mounted
    ? `${days[currentTime.getDay()]}, ${currentTime.getDate()} ${months[currentTime.getMonth()]} ${currentTime.getFullYear()} · ${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")} WIB`
    : "Memuat...";

  const severityDotColor = (severity: string) => {
    if (severity === "critical") return "bg-status-offline";
    if (severity === "warning") return "bg-status-warning";
    return "bg-brand";
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-white px-4 shadow-2xs">
      {/* Left — hamburger on mobile */}
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-md p-1.5 text-ink/50 hover:bg-canvas lg:hidden"
          aria-label="Buka navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right toolbar */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Date badge */}
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-canvas/80 md:flex"
          aria-label="Tanggal dan waktu"
        >
          <Calendar className="h-3.5 w-3.5 text-brand" />
          {dateLabel}
          <ChevronDown className="h-3 w-3 text-ink/40 ml-0.5" />
        </button>

        {/* Auto-refresh indicator */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-medium text-status-online sm:flex">
          <RefreshCcw className="h-3.5 w-3.5" />
          Auto Refresh 30s
          <span className="h-1.5 w-1.5 rounded-full bg-status-online motion-safe:animate-pulse" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setNotifOpen(!isNotifOpen); setProfileMenuOpen(false); }}
            className="relative rounded-lg border border-border bg-canvas p-2 text-ink/60 hover:bg-border"
            aria-label="Notifikasi"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-status-offline font-mono text-[9px] font-bold text-white px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-white shadow-xl z-50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-xs font-bold text-ink">Notifikasi Terbaru</span>
                <button
                  type="button"
                  onClick={() => { onNavigateTab?.("notifikasi"); setNotifOpen(false); }}
                  className="text-[11px] font-semibold text-brand cursor-pointer hover:underline"
                >
                  Tandai Semua Dibaca
                </button>
              </div>
              <div className="divide-y divide-border/50">
                {recentNotifs.length === 0 ? (
                  <div className="px-4 py-5 text-center text-xs text-ink/50">
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  recentNotifs.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => { onNavigateTab?.(n.targetUrl ?? "notifikasi"); setNotifOpen(false); }}
                      className="w-full flex cursor-pointer gap-3 px-4 py-3 hover:bg-canvas/60 transition-colors text-left"
                    >
                      <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", severityDotColor(n.severity))} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink truncate">{n.title}</p>
                        <p className="text-[11px] text-ink/60 mt-0.5 line-clamp-1">{n.message}</p>
                        <span className="text-[10px] text-ink/40 font-mono">{n.timestamp}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-border px-4 py-2.5 text-center">
                <button
                  type="button"
                  onClick={() => { onNavigateTab?.("notifikasi"); setNotifOpen(false); }}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Lihat Semua Notifikasi →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(!isProfileMenuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg border border-border bg-canvas px-2 py-1.5 hover:bg-border transition-colors"
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold shadow-2xs",
                user?.avatarBg || "bg-brand text-white"
              )}
            >
              {user?.initials || "US"}
            </span>
            <div className="hidden text-left sm:block">
              <p className="text-[12px] font-semibold text-ink leading-tight">{user?.name || "Pengguna"}</p>
              <p className="text-[10px] text-ink/50 leading-tight">{user?.roleLabel || "Operator"}</p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-ink/40 sm:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-white shadow-xl z-50 animate-fade-in overflow-hidden">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold",
                      user?.avatarBg || "bg-brand text-white"
                    )}
                  >
                    {user?.initials || "US"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink">{user?.name}</p>
                    <p className="truncate text-[11px] text-ink/50">{user?.email}</p>
                    <span className="mt-0.5 inline-block rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand">
                      {user?.roleLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar / Ganti Akun
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}