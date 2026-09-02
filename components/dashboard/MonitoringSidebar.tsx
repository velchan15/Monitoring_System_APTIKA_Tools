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

interface MonitoringSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

export function MonitoringSidebar({
  isOpen = false,
  onClose,
  activeTab,
  onSelectTab,
}: MonitoringSidebarProps) {
  const navGroups = [
    {
      title: "MONITORING UTAMA",
      items: [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "uptime", name: "Daftar Aplikasi & ...", icon: Server, badge: "215" },
        { id: "incidents", name: "Manajemen I...", icon: AlertTriangle, badge: "2 Aktif", badgeColor: "bg-red-100 text-red-700 font-bold" },
        { id: "ssl", name: "SSL Certificate", icon: ShieldCheck, badge: "1 Warn", badgeColor: "bg-amber-100 text-amber-800 font-bold" },
        { id: "response_time", name: "Response Time", icon: Clock },
      ],
    },
    {
      title: "PERANGKAT DAERAH",
      items: [
        { id: "opd", name: "Dashboard PD", icon: Building2, badge: "8 OPD" },
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
        { id: "notifikasi", name: "Notifikasi", icon: Bell },
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
        />
      )}

      {/* Sidebar Container Tema Terang */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200 transition-transform duration-200 flex flex-col justify-between font-sans text-slate-700",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div>
          {/* Logo Header Sidebar */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs">
                SM
              </div>
              <div>
                <h1 className="text-xs font-bold text-slate-900 tracking-wider uppercase leading-tight">
                  Sistem Monitoring ...
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
                className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Menu Navigasi */}
          <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-120px)]">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
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
                      onClick={() => onSelectTab(item.id as NavTabId)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group",
                        isActive
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-mono",
                            item.badgeColor
                              ? item.badgeColor
                              : isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Sidebar Profile */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
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