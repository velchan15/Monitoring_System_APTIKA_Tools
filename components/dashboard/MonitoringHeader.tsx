"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  Menu,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface MonitoringHeaderProps {
  onOpenSidebar: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function MonitoringHeader({ onOpenSidebar, onNavigateTab }: MonitoringHeaderProps) {
  const { user, setLoginModalOpen, logout } = useAuth();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  
  // State untuk mencegah Hydration Error
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live clock
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const dateLabel = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-white px-4 shadow-2xs">
      {/* Left */}
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
        {/* Date badge - Hanya dirender jika komponen sudah mounted di browser */}
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-canvas/80 md:flex"
        >
          <Calendar className="h-3.5 w-3.5 text-brand" />
          {mounted ? dateLabel : "Memuat..."}
          <ChevronDown className="h-3 w-3 text-ink/40 ml-0.5" />
        </button>

        {/* Auto-refresh */}
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
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-status-offline font-mono text-[9px] font-bold text-white">
              2
            </span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-white shadow-xl z-50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-xs font-bold text-ink">Notifikasi Terbaru</span>
                <span className="text-[11px] font-semibold text-brand cursor-pointer hover:underline">
                  Tandai Dibaca
                </span>
              </div>
              <div className="divide-y divide-border/50">
                <div
                  onClick={() => { onNavigateTab?.("incidents"); setNotifOpen(false); }}
                  className="flex cursor-pointer gap-3 px-4 py-3 hover:bg-canvas/60 transition-colors"
                >
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-status-offline" />
                  <div>
                    <p className="text-xs font-semibold text-ink">503 Service Unavailable — Disdukcapil</p>
                    <p className="text-[11px] text-ink/60 mt-0.5">SIPD Kependudukan gagal handshake database.</p>
                    <span className="text-[10px] text-ink/40 font-mono">15 menit lalu</span>
                  </div>
                </div>
                <div
                  onClick={() => { onNavigateTab?.("incidents"); setNotifOpen(false); }}
                  className="flex cursor-pointer gap-3 px-4 py-3 hover:bg-canvas/60 transition-colors"
                >
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-status-warning" />
                  <div>
                    <p className="text-xs font-semibold text-ink">High Latency — SIMPUS Jabar Online</p>
                    <p className="text-[11px] text-ink/60 mt-0.5">Waktu respons query melonjak &gt; 3800ms.</p>
                    <span className="text-[10px] text-ink/40 font-mono">45 menit lalu</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border px-4 py-2.5 text-center">
                <button
                  type="button"
                  onClick={() => { onNavigateTab?.("incidents"); setNotifOpen(false); }}
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
              {user?.initials || "SA"}
            </span>
            <div className="hidden text-left sm:block">
              <p className="text-[12px] font-semibold text-ink leading-tight">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-ink/50 leading-tight">{user?.roleLabel || "Super Admin"}</p>
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
                    {user?.initials || "SA"}
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
                  onClick={() => { setLoginModalOpen(true); setProfileMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-medium text-ink hover:bg-canvas"
                >
                  <Users className="h-4 w-4 text-brand" />
                  Ganti Akun / Role
                </button>
                <button
                  type="button"
                  onClick={() => { logout(); setProfileMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar Akun
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}