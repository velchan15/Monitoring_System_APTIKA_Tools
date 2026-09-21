"use client";

import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/auth-context";

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
  unreadNotifCount?: number;
}

export function MonitoringSidebar({
  isOpen = false,
  onClose,
  activeTab,
  onSelectTab,
  unreadNotifCount = 0,
}: MonitoringSidebarProps) {
  const { user, isSuperAdmin } = useAuth();
  
  const [totalAppsCount, setTotalAppsCount] = useState<number | null>(null);
  const [activeIncidentCount, setActiveIncidentCount] = useState<number>(0);
  const [sslWarningCount, setSslWarningCount] = useState<number>(0);

  const fetchAppCount = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/applications");
      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      
      setTotalAppsCount(data.length);

      const sslWarnings = data.filter((app: any) => {
        if (!app.url || !app.sslValidTo) return false;
        const validToDate = new Date(app.sslValidTo);
        const daysLeft = Math.ceil((validToDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 30;
      }).length;
      
      setSslWarningCount(sslWarnings);
    } catch (error) {
      console.error("Gagal mengambil data aplikasi untuk sidebar:", error);
    }
  };

  const fetchIncidentCount = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:3001/api/incidents", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      
      const activeCount = data.filter((inc: any) => inc.status !== "resolved").length;
      setActiveIncidentCount(activeCount);
    } catch (error) {
      console.error("Gagal mengambil jumlah insiden untuk sidebar:", error);
    }
  };

  useEffect(() => {
    fetchAppCount();
    fetchIncidentCount();
    
    const interval = setInterval(() => {
      fetchAppCount();
      fetchIncidentCount();
    }, 30000);

    const handleAppChange = () => fetchAppCount();
    const handleIncidentChange = () => fetchIncidentCount();
    
    window.addEventListener("appDataChanged", handleAppChange);
    window.addEventListener("incidentDataChanged", handleIncidentChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("appDataChanged", handleAppChange);
      window.removeEventListener("incidentDataChanged", handleIncidentChange);
    };
  }, []);

  const navGroups: NavGroup[] = [
    {
      title: "MONITORING UTAMA",
      items: [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { 
          id: "uptime", 
          name: "Daftar Aplikasi & Uptime", 
          icon: Server, 
          badge: totalAppsCount !== null ? String(totalAppsCount) : "...", 
          badgeVariant: "neutral" 
        },
        {
          id: "incidents",
          name: "Manajemen Insiden",
          icon: AlertTriangle,
          badge: activeIncidentCount > 0 ? `${activeIncidentCount} Aktif` : undefined,
          badgeVariant: "red",
        },
        { 
          id: "ssl", 
          name: "SSL Certificate", 
          icon: ShieldCheck, 
          badge: sslWarningCount > 0 ? `${sslWarningCount} Warn` : undefined, 
          badgeVariant: "amber" 
        },
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
        ...(isSuperAdmin
          ? [
              { id: "user_role" as NavTabId, name: "User & Role", icon: Users },
              { id: "integrasi" as NavTabId, name: "Integrasi", icon: Share2 },
              { id: "audit_trail" as NavTabId, name: "Audit Trail", icon: History },
            ]
          : []),
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-200 flex flex-col justify-between font-sans text-slate-700",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Navigasi utama"
      >
        <div className="min-h-0 flex flex-col">
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

        <div className="p-3 border-t border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[11px] shadow-xs flex-shrink-0">
              {user?.initials || "US"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Pengguna"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.roleLabel || "Operator JDS"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}