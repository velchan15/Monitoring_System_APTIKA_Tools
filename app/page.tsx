"use client";

import { useState } from "react";
import { Activity } from "lucide-react";

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

// New feature pages
import { IncidentManagementView } from "@/components/incidents/IncidentManagementView";
import { ResponseTimeView } from "@/components/responsetime/ResponseTimeView";
import { UptimeReportView } from "@/components/reports/UptimeReportView";
import { DisruptionReportView } from "@/components/reports/DisruptionReportView";
import { ExportReportView } from "@/components/reports/ExportReportView";
import { NotificationsView } from "@/components/notifications/NotificationsView";
import { UserRoleView } from "@/components/users/UserRoleView";
import { IntegrationsView } from "@/components/integrations/IntegrationsView";
import { AuditTrailView } from "@/components/audit/AuditTrailView";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { dashboardStatusMetrics } from "@/lib/dashboard-data";
import { mockIncidents } from "@/lib/data/incidents";

// ---- Live alert badge ----
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

// ---- Greeting ----
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

// ---- Page header helper ----
interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ElementType;
  tag?: string;
}

function PageHeader({ title, subtitle, icon: Icon, tag }: PageHeaderProps) {
  return (
    <div className="space-y-0.5">
      {tag && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand">
          {Icon && <Icon className="h-3 w-3" />}
          {tag}
        </span>
      )}
      <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="text-xs text-ink/55">{subtitle}</p>
    </div>
  );
}

// ---- Main dashboard content ----
function DashboardContent() {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTabId>("dashboard");

  // Derive active incident count for sidebar badge (spec 6.1)
  const activeIncidentCount = mockIncidents.filter(
    (i) => i.status === "open" || i.status === "investigating"
  ).length;

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
        activeIncidentCount={activeIncidentCount}
      />

      {/* Main layout: sidebar is w-64, so push main content by pl-64 on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-dvh">
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
              <DashboardGreeting name={user?.name} />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {dashboardStatusMetrics.map((metric) => (
                  <StatusCard key={metric.key} metric={metric} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <div className="xl:col-span-3" style={{ minHeight: 320 }}>
                  <StatusTrendChart title="Grafik Status Aplikasi" />
                </div>
                <div className="xl:col-span-2" style={{ minHeight: 320 }}>
                  <StatusDonutChart />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <div className="xl:col-span-3">
                  <DashboardIncidentList limit={5} />
                </div>
                <div className="xl:col-span-2">
                  <TopUptimeWidget limit={6} onViewAll={() => setActiveTab("uptime")} />
                </div>
              </div>

              <DashboardOpdSummary onViewAll={() => setActiveTab("opd")} />
            </>
          )}

          {/* ===================== UPTIME / APPLICATION LIST ===================== */}
          {activeTab === "uptime" && (
            <div className="space-y-4">
              <PageHeader
                title="Daftar Aplikasi & Uptime"
                subtitle="Pemantauan ketersediaan 30-hari, ping response time, dan validitas SSL per layanan"
                icon={Activity}
                tag="Status Layanan"
              />
              <UptimeList />
            </div>
          )}

          {/* ===================== INCIDENT MANAGEMENT ===================== */}
          {activeTab === "incidents" && (
            <div className="space-y-4">
              <PageHeader
                title="Manajemen Insiden & Gangguan"
                subtitle="Lacak, investigasi, dan selesaikan tiket gangguan layanan per Perangkat Daerah"
                tag="Tiket Insiden"
              />
              <IncidentManagementView />
            </div>
          )}

          {/* ===================== OPD DASHBOARD ===================== */}
          {activeTab === "opd" && (
            <div className="space-y-4">
              <PageHeader
                title="Dashboard Perangkat Daerah (OPD)"
                subtitle="Pemantauan kinerja sistem per instansi Pemerintah Provinsi Jawa Barat"
                tag="Per OPD"
              />
              <OpdSummaryGrid />
            </div>
          )}

          {/* ===================== SSL CERTIFICATE ===================== */}
          {activeTab === "ssl" && (
            <div className="space-y-4">
              <PageHeader
                title="Pemantauan Sertifikat SSL/TLS"
                subtitle="Audit keamanan dan peringatan dini masa berlaku sertifikat HTTPS seluruh domain"
                tag="Keamanan SSL"
              />
              <SslMonitorView />
            </div>
          )}

          {/* ===================== RESPONSE TIME ===================== */}
          {activeTab === "response_time" && (
            <div className="space-y-4">
              <PageHeader
                title="Waktu Respons Aplikasi (Response Time)"
                subtitle="Analisis latensi dan performa response time layanan digital per OPD secara periodik"
                tag="Analisis Latensi"
              />
              <ResponseTimeView />
            </div>
          )}

          {/* ===================== UPTIME REPORT ===================== */}
          {activeTab === "laporan_uptime" && (
            <div className="space-y-4">
              <PageHeader
                title="Laporan Uptime Layanan"
                subtitle="Rekap uptime, downtime kumulatif, dan kepatuhan SLA per aplikasi dan Perangkat Daerah"
                tag="Laporan Uptime"
              />
              <UptimeReportView />
            </div>
          )}

          {/* ===================== DISRUPTION REPORT ===================== */}
          {activeTab === "laporan_gangguan" && (
            <div className="space-y-4">
              <PageHeader
                title="Laporan Gangguan & Disruption"
                subtitle="Rekap historis insiden, analisis akar masalah, dan tren gangguan per periode"
                tag="Laporan Gangguan"
              />
              <DisruptionReportView />
            </div>
          )}

          {/* ===================== EXPORT REPORT ===================== */}
          {activeTab === "ekspor" && (
            <div className="space-y-4">
              <PageHeader
                title="Ekspor & Unduh Laporan"
                subtitle="Generate dan unduh laporan uptime, gangguan, atau SSL dalam format PDF, Excel, atau CSV"
                tag="Ekspor Data"
              />
              <ExportReportView />
            </div>
          )}

          {/* ===================== NOTIFICATIONS ===================== */}
          {activeTab === "notifikasi" && (
            <div className="space-y-4">
              <PageHeader
                title="Pusat Notifikasi"
                subtitle="Kelola notifikasi insiden, pengaturan kanal pengiriman, dan daftar penerima per OPD"
                tag="Notifikasi"
              />
              <NotificationsView />
            </div>
          )}

          {/* ===================== USER & ROLE ===================== */}
          {activeTab === "user_role" && (
            <div className="space-y-4">
              <PageHeader
                title="Manajemen Pengguna & Role"
                subtitle="Kelola akun pengguna, hak akses berbasis role (RBAC), dan lingkup akses per OPD"
                tag="Akses & Keamanan"
              />
              <UserRoleView />
            </div>
          )}

          {/* ===================== INTEGRATIONS ===================== */}
          {activeTab === "integrasi" && (
            <div className="space-y-4">
              <PageHeader
                title="Konfigurasi Integrasi Sistem"
                subtitle="Kelola koneksi ke Katalog Aplikasi, Telegram Bot, SMTP Email, dan webhook eksternal"
                tag="Integrasi"
              />
              <IntegrationsView />
            </div>
          )}

          {/* ===================== AUDIT TRAIL ===================== */}
          {activeTab === "audit_trail" && (
            <div className="space-y-4">
              <PageHeader
                title="Audit Trail & Log Aktivitas"
                subtitle="Rekam jejak aktivitas pengguna, perubahan konfigurasi, dan aksi kritis sistem"
                tag="Keamanan & Audit"
              />
              <AuditTrailView />
            </div>
          )}

          {/* ===================== LEGACY SETTINGS (SettingsView) ===================== */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <PageHeader
                title="Pengaturan Sistem & Akun"
                subtitle="Konfigurasi robot monitoring, webhook notifikasi, dan manajemen akses pengguna"
                tag="Pengaturan"
              />
              <SettingsView />
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