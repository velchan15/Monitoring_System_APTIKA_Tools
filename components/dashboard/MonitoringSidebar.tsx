"use client";

import {
  AlertOctagon,
  AppWindow,
  Bell,
  Building2,
  LayoutGrid,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavLeaf {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

interface NavSection {
  label: string;
  items: NavLeaf[];
}

// Navigasi ini kreasi sendiri (bukan salinan referensi) — dikelompokkan
// mengikuti area kerja yang sudah dibahas di rancangan backend: monitoring inti,
// organisasi (perangkat daerah), dan pengaturan. Semua item selain "Dashboard"
// masih placeholder, belum terhubung ke rute lain di tahap 1.
const navSections: NavSection[] = [
  {
    label: "Monitoring",
    items: [
      { label: "Dashboard", icon: LayoutGrid, active: true },
      { label: "Daftar Aplikasi", icon: AppWindow },
      { label: "Insiden", icon: AlertOctagon },
      { label: "SSL Certificate", icon: ShieldCheck },
    ],
  },
  {
    label: "Organisasi",
    items: [{ label: "Perangkat Daerah", icon: Building2 }],
  },
  {
    label: "Lainnya",
    items: [
      { label: "Notifikasi", icon: Bell },
      { label: "Pengaturan", icon: Settings },
    ],
  },
];

interface MonitoringSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonitoringSidebar({ isOpen, onClose }: MonitoringSidebarProps) {
  return (
    <>
      {/* Overlay untuk menutup drawer di layar sempit (3:4 ke bawah) */}
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={onClose}
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-ink/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-16 z-40 flex w-64 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground",
          "transition-transform duration-200 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 space-y-5 px-3 py-5" aria-label="Navigasi utama">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map(({ label, icon: Icon, active }) => (
                  <button
                    key={label}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-left text-sm transition-colors",
                      active
                        ? "border-brand bg-sidebar-active font-medium text-white"
                        : "border-transparent text-sidebar-muted hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-[11px] text-sidebar-muted">
          Tahap 1 · Dashboard shell
        </div>
      </aside>
    </>
  );
}
