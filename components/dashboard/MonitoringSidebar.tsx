"use client";

import React from "react";
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Building2,
  FileText,
  AlertOctagon,
  Download,
  Bell,
  Users,
  Share2,
  History,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarBadge, type SidebarBadgeVariant } from "@/components/ui/SidebarBadge";

export type NavTabId =
  | "dashboard"
  | "uptime"
  | "incidents"
  | "opd"
  | "ssl"
  | "response_time"
  | "laporan_uptime"
  | "laporan_gangguan"
  | "ekspor"
  | "notifikasi"
  | "user_role"
  | "integrasi"
  | "audit_trail"
  | "settings";

interface NavItem {
  id: NavTabId;
  name: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: SidebarBadgeVariant;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface MonitoringSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  activeIncidentCount?: number;
  unreadNotifCount?: number;
}

export function MonitoringSidebar({
  isOpen = false,
  onClose,
  activeTab,
  onSelectTab,
  activeIncidentCount = 2,
  unreadNotifCount = 0,
}: MonitoringSidebarProps) {
  const navGroups: NavGroup[] = [
    {
      title: "MONITORING UTAMA",
      items: [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "uptime", name: "Daftar Aplikasi & Uptime", icon: Server, badge: "215", badgeVariant: "neutral" },
        {
          id: "incidents",
          name: "Manajemen Insiden",
          icon: AlertTriangle,
          badge: activeIncidentCount > 0 ? `${activeIncidentCount} Aktif` : undefined,
          badgeVariant: "red",
        },
        { id: "ssl", name: "SSL Certificate", icon: ShieldCheck, badge: "1 Warn", badgeVariant: "amber" },
        { id: "response_time", name: "Response Time", icon: Clock },
      ],
    },
    {
      title: "PERANGKAT DAERAH",
      items: [
        { id: "opd", name: "Dashboard OPD", icon: Building2, badge: "8 OPD", badgeVariant: "blue" },
      ],
    },
    {
      title: "LAPORAN",
      items: [
        { id: "laporan_uptime", name: "Laporan Uptime", icon: FileText },
        { id: "laporan_gangguan", name: "Laporan Gangguan", icon: AlertOctagon },
        { id: "ekspor", name: "Ekspor Laporan", icon: Download },
      ],
    },
    {
      title: "PENGATURAN",
      items: [
        {
          id: "notifikasi",
          name: "Notifikasi",
          icon: Bell,
          badge: unreadNotifCount > 0 ? String(unreadNotifCount) : undefined,
          badgeVariant: "red",
        },
        { id: "user_role", name: "User & Role", icon: Users },
        { id: "integrasi", name: "Integrasi", icon: Share2 },
        { id: "audit_trail", name: "Audit Trail", icon: History },
      ],
    },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-200 flex flex-col justify-between font-sans text-slate-700",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Navigasi utama"
      >
        <div className="min-h-0 flex flex-col">
          {/* Logo Header Sidebar */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0">
                SM
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-bold text-slate-900 tracking-wider uppercase leading-tight whitespace-nowrap">
                  Sistem Monitoring APTIKA
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold">
                  PROVINSI JAWA BARAT
                </p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-600 flex-shrink-0"
                aria-label="Tutup navigasi"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Menu Navigasi */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-1.5">
                  {group.title}
                </p>

                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      title={item.name}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group",
                        isActive
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <SidebarBadge
                          variant={isActive ? "active" : (item.badgeVariant ?? "neutral")}
                          className="ml-1 flex-shrink-0"
                        >
                          {item.badge}
                        </SidebarBadge>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar Profile */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[11px] shadow-xs flex-shrink-0">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Super Admin APTIKA</p>
              <p className="text-[10px] text-slate-500 truncate">Diskominfo Jabar</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}