"use client";

import { useState } from "react";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { LoginModal } from "@/components/auth/LoginModal";
import { DashboardIncidentList, IncidentTable } from "@/components/dashboard/IncidentTable";
import { MonitoringHeader } from "@/components/dashboard/MonitoringHeader";
import { MonitoringSidebar, type NavTabId } from "@/components/dashboard/MonitoringSidebar";
import { DashboardOpdSummary, OpdSummaryGrid } from "@/components/dashboard/OpdSummaryGrid";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { SslMonitorView } from "@/components/dashboard/SslMonitorView";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { StatusDonutChart } from "@/components/dashboard/StatusDonutChart";
import { StatusTrendChart } from "@/components/dashboard/StatusTrendChart";
import { TopUptimeWidget, UptimeList } from "@/components/dashboard/UptimeList";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { dashboardStatusMetrics } from "@/lib/dashboard-data";

// ---- Active Incident/Offline summary badge ----
function LiveAlertBadge() {
  const onlineMetric = dashboardStatusMetrics.find((m) => m.key === "online");
  const totalMetric = dashboardStatusMetrics.find((m) => m.key === "total");
  if (!onlineMetric || !totalMetric) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs">
      <span className="h-2 w-2 rounded-full bg-status-online motion-safe:animate-ping" />
      {onlineMetric.value} / {totalMetric.value} Layanan Normal
    </div>
  );
}

// ---- Quick Stats strip for dashboard header ----
function DashboardGreeting({ name }: { name?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Selamat datang, {name || "Operator"} 👋
        </h1>
        <p className="mt-0.5 text-xs text-ink/55">
          Monitoring ketersediaan, performa server, dan status layanan digital Pemerintah Provinsi Jawa Barat secara realtime.
        </p>
      </div>
      <LiveAlertBadge />
    </div>
  );
}

// ---- Main dashboard content ----
function DashboardContent() {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTabId>("dashboard");

  const handleNav = (tab: NavTabId | string) => {
    setActiveTab(tab as NavTabId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Sidebar */}
      <MonitoringSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main layout: push content when sidebar is visible on desktop */}
      <div className="lg:pl-60 flex flex-col min-h-dvh">
        {/* Sticky Header */}
        <MonitoringHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigateTab={handleNav}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-5 space-y-4">

          {/* ===================== DASHBOARD ===================== */}
          {activeTab === "dashboard" && (
            <>
              {/* Greeting */}
              <DashboardGreeting name={user?.name} />

              {/* 5 Status Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {dashboardStatusMetrics.map((metric) => (
                  <StatusCard key={metric.key} metric={metric} />
                ))}
              </div>

              {/* Chart Row: Trend Chart left (wider) + Donut Chart right */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <div className="xl:col-span-3" style={{ minHeight: 320 }}>
                  <StatusTrendChart title="Grafik Status Aplikasi" />
                </div>
                <div className="xl:col-span-2" style={{ minHeight: 320 }}>
                  <StatusDonutChart />
                </div>
              </div>

              {/* Lower Row: Incident Table left + Top Uptime right */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <div className="xl:col-span-3">
                  <DashboardIncidentList limit={5} />
                </div>
                <div className="xl:col-span-2">
                  <TopUptimeWidget
                    limit={6}
                    onViewAll={() => setActiveTab("uptime")}
                  />
                </div>
              </div>

              {/* OPD Summary full row */}
              <DashboardOpdSummary onViewAll={() => setActiveTab("opd")} />
            </>
          )}

          {/* ===================== UPTIME PAGE ===================== */}
          {activeTab === "uptime" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-ink">Daftar Aplikasi & Uptime</h1>
                <p className="mt-0.5 text-xs text-ink/55">Pemantauan ketersediaan 30-hari, ping response time, dan validitas SSL per layanan</p>
              </div>
              <UptimeList />
            </div>
          )}

          {/* ===================== INCIDENTS PAGE ===================== */}
          {activeTab === "incidents" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-ink">Manajemen Insiden & Gangguan</h1>
                <p className="mt-0.5 text-xs text-ink/55">Lacak, investigasi, dan selesaikan tiket gangguan layanan per Perangkat Daerah</p>
              </div>
              <IncidentTable />
            </div>
          )}

          {/* ===================== OPD PAGE ===================== */}
          {activeTab === "opd" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-ink">Dashboard Perangkat Daerah (OPD)</h1>
                <p className="mt-0.5 text-xs text-ink/55">Pemantauan kinerja sistem per instansi Pemerintah Provinsi Jawa Barat</p>
              </div>
              <OpdSummaryGrid />
            </div>
          )}

          {/* ===================== SSL PAGE ===================== */}
          {activeTab === "ssl" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-ink">Pemantauan Sertifikat SSL/TLS</h1>
                <p className="mt-0.5 text-xs text-ink/55">Audit keamanan dan peringatan dini masa berlaku sertifikat HTTPS seluruh domain</p>
              </div>
              <SslMonitorView />
            </div>
          )}

          {/* ===================== SETTINGS PAGE ===================== */}
          {(activeTab === "settings" || activeTab === "notifikasi" || activeTab === "user_role" || activeTab === "integrasi" || activeTab === "audit_trail") && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-ink">Pengaturan Sistem & Akun</h1>
                <p className="mt-0.5 text-xs text-ink/55">Konfigurasi robot monitoring, webhook notifikasi, dan manajemen akses pengguna</p>
              </div>
              <SettingsView />
            </div>
          )}

          {/* ===================== OTHER NAV ITEMS (placeholder) ===================== */}
          {(activeTab === "response_time" || activeTab === "laporan_uptime" || activeTab === "laporan_gangguan" || activeTab === "ekspor") && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Layers className="h-12 w-12 text-ink/20 mb-4" />
              <h2 className="text-lg font-bold text-ink">Fitur Dalam Pengembangan</h2>
              <p className="mt-1 text-sm text-ink/50">Halaman ini akan tersedia di pembaruan selanjutnya.</p>
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className="mt-6 flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
              >
                Kembali ke Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-5 py-3 text-center text-[11px] text-ink/35">
          © 2026 Dinas Komunikasi dan Informatika Provinsi Jawa Barat · Monitoring System APTIKA v2.0
        </footer>
      </div>

      {/* Global Auth Modal */}
      <LoginModal />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}