"use client";

import {
  AlertOctagon,
  AppWindow,
  BarChart3,
  Bell,
  Building2,
  ChevronLeft,
  ClipboardList,
  Download,
  FileText,
  LayoutGrid,
  Puzzle,
  Settings,
  ShieldCheck,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export type NavTabId =
  | "dashboard"
  | "uptime"
  | "incidents"
  | "opd"
  | "ssl"
  | "settings"
  | "response_time"
  | "laporan_uptime"
  | "laporan_gangguan"
  | "ekspor"
  | "notifikasi"
  | "user_role"
  | "integrasi"
  | "audit_trail";

interface NavLeaf {
  id: NavTabId;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeClass?: string;
  isChild?: boolean;
}

interface NavSection {
  label: string;
  items: NavLeaf[];
}

const navSections: NavSection[] = [
  {
    label: "Monitoring Utama",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
      {
        id: "uptime",
        label: "Daftar Aplikasi & Uptime",
        icon: AppWindow,
        badge: "215",
        badgeClass: "bg-brand/20 text-brand-foreground/80",
      },
      {
        id: "incidents",
        label: "Manajemen Insiden",
        icon: AlertOctagon,
        badge: "2 Aktif",
        badgeClass: "bg-red-500 text-white",
      },
      {
        id: "ssl",
        label: "SSL Certificate",
        icon: ShieldCheck,
        badge: "1 Warn",
        badgeClass: "bg-amber-500 text-white",
      },
      {
        id: "response_time",
        label: "Response Time",
        icon: Timer,
      },
    ],
  },
  {
    label: "Perangkat Daerah",
    items: [
      {
        id: "opd",
        label: "Dashboard PD",
        icon: Building2,
        badge: "8 OPD",
        badgeClass: "bg-white/10 text-sidebar-foreground/70",
      },
    ],
  },
  {
    label: "Laporan",
    items: [
      { id: "laporan_uptime", label: "Laporan Uptime", icon: BarChart3 },
      { id: "laporan_gangguan", label: "Laporan Gangguan", icon: ClipboardList },
      { id: "ekspor", label: "Ekspor Laporan", icon: Download },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { id: "notifikasi", label: "Notifikasi", icon: Bell },
      { id: "user_role", label: "User & Role", icon: Users },
      { id: "integrasi", label: "Integrasi", icon: Puzzle },
      { id: "audit_trail", label: "Audit Trail", icon: FileText },
      { id: "settings", label: "Pengaturan Sistem", icon: Settings },
    ],
  },
];

interface MonitoringSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function MonitoringSidebar({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
}: MonitoringSidebarProps) {
  const { user, setLoginModalOpen } = useAuth();

  const handleItemClick = (id: NavTabId) => {
    onSelectTab(id);
    onClose();
  };

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={onClose}
          className="fixed inset-x-0 bottom-0 top-0 z-30 bg-ink/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 ease-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-[56px]" : "lg:w-60",
          "w-60"
        )}
      >
        {/* Brand Header */}
        <div className={cn(
          "flex h-14 shrink-0 items-center border-b border-white/8 px-3",
          isCollapsed ? "justify-center" : "gap-2.5"
        )}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand font-mono text-xs font-bold text-white shadow-sm">
            SM
          </span>
          {!isCollapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-bold tracking-tight text-white">
                SISTEM MONITORING APLIKASI
              </p>
              <p className="truncate text-[10px] text-sidebar-muted">
                PROVINSI JAWA BARAT
              </p>
            </div>
          )}
          {onToggleCollapse && !isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="ml-auto hidden rounded p-1 text-sidebar-muted hover:bg-white/10 hover:text-white lg:block"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5" aria-label="Navigasi utama">
          {navSections.map((section) => (
            <div key={section.label} className="mb-3">
              {!isCollapsed && (
                <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-muted/70">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ id, label, icon: Icon, badge, badgeClass }) => {
                  const isActive = activeTab === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => handleItemClick(id)}
                      title={isCollapsed ? label : undefined}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-all",
                        isActive
                          ? "bg-brand text-white shadow-sm"
                          : "text-sidebar-muted hover:bg-white/8 hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-white" : "text-sidebar-muted"
                        )}
                        aria-hidden="true"
                      />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{label}</span>
                          {badge && (
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold leading-tight",
                                badgeClass || "bg-white/15 text-white"
                              )}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-white/8 p-2">
          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white/10",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold shadow-xs",
                user?.avatarBg || "bg-brand text-white"
              )}
            >
              {user?.initials || "SA"}
            </span>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 text-left leading-tight">
                <p className="truncate text-[12px] font-semibold text-white">
                  {user?.name || "Admin"}
                </p>
                <p className="truncate text-[10px] text-sidebar-muted">
                  {user?.opdName || "Diskominfo Jabar"}
                </p>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
