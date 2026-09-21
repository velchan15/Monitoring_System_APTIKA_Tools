"use client";

import { useState, useEffect } from "react";
import { Activity, Mail, Lock, User, Loader2, UserPlus, ArrowLeft } from "lucide-react";

import { LoginModal } from "@/components/auth/LoginModal";
import { DashboardIncidentList } from "@/components/dashboard/IncidentTable";
import { MonitoringHeader } from "@/components/dashboard/MonitoringHeader";
import { MonitoringSidebar, type NavTabId } from "@/components/dashboard/MonitoringSidebar";
import { DashboardOpdSummary, OpdSummaryGrid } from "@/components/dashboard/OpdSummaryGrid";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { SslMonitorView } from "@/components/dashboard/SslMonitorView";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { StatusDonutChart } from "@/components/dashboard/StatusDonutChart";
import { StatusTrendChart } from "@/components/dashboard/StatusTrendChart";
import { TopUptimeWidget, UptimeList } from "@/components/dashboard/UptimeList";

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
import { mockIncidents } from "@/lib/data/incidents";

function LiveAlertBadge({ onlineCount, totalCount }: { onlineCount: number; totalCount: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs">
      <span className="h-2 w-2 rounded-full bg-status-online motion-safe:animate-ping" />
      {onlineCount} / {totalCount} Layanan Normal
    </div>
  );
}

function DashboardGreeting({ name, onlineCount, totalCount }: { name?: string; onlineCount: number; totalCount: number }) {
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
      <LiveAlertBadge onlineCount={onlineCount} totalCount={totalCount} />
    </div>
  );
}

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

function DashboardContent() {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTabId>("dashboard");

  // State untuk data aplikasi dinamis dari database
  const [appMetrics, setAppMetrics] = useState([
    { key: "total", label: "Total Aplikasi", value: "0", subtext: "Semua aplikasi terdaftar di Jabar", variant: "neutral" },
    { key: "online", label: "Online / Normal", value: "0", subtext: "0% beroperasi normal", variant: "online" },
    { key: "warning", label: "Warning / Degraded", value: "0", subtext: "Perlu penanganan teknis", variant: "warning" },
    { key: "offline", label: "Offline / Kritis", value: "0", subtext: "0% layanan terhenti", variant: "offline" },
    { key: "maintenance", label: "Maintenance", value: "0", subtext: "Tidak ada jadwal pemeliharaan", variant: "maintenance" },
  ]);

  // State baru untuk menyimpan data lengkap aplikasi
  const [applicationsData, setApplicationsData] = useState<any[]>([]);

  // Fungsi untuk menarik data dari API backend dengan penanganan status yang fleksibel
  const fetchAppMetrics = async () => {
    try {
      const res = await fetch("/api/applications");
      const jsonRes = await res.json();
      const data = jsonRes.data || jsonRes;

      if (Array.isArray(data)) {
        // Simpan data mentahnya ke state agar bisa dipakai komponen OPD
        setApplicationsData(data);

        const total = data.length;
        // Jika status kosong/null, otomatis dikategorikan sebagai ONLINE agar langsung muncul
        const online = data.filter((a: any) => !a.status || a.status === "ONLINE" || a.status === "NORMAL").length;
        const warning = data.filter((a: any) => a.status === "WARNING").length;
        const offline = data.filter((a: any) => a.status === "OFFLINE" || a.status === "CRITICAL").length;
        const maintenance = data.filter((a: any) => a.status === "MAINTENANCE").length;

        const onlinePct = total > 0 ? ((online / total) * 100).toFixed(2) : "0";
        const offlinePct = total > 0 ? ((offline / total) * 100).toFixed(2) : "0";

        setAppMetrics([
          { key: "total", label: "Total Aplikasi", value: String(total), subtext: "Semua aplikasi terdaftar di Jabar", variant: "neutral" },
          { key: "online", label: "Online / Normal", value: String(online), subtext: `${onlinePct}% beroperasi normal`, variant: "online" },
          { key: "warning", label: "Warning / Degraded", value: String(warning), subtext: "Perlu penanganan teknis", variant: "warning" },
          { key: "offline", label: "Offline / Kritis", value: String(offline), subtext: `${offlinePct}% layanan terhenti`, variant: "offline" },
          { key: "maintenance", label: "Maintenance", value: String(maintenance), subtext: "Tidak ada jadwal pemeliharaan", variant: "maintenance" },
        ]);
      }
    } catch (err) {
      console.error("Gagal melakukan auto-refresh data aplikasi:", err);
    }
  };

  // AUTO REFRESH SETIAP 30 DETIK
  useEffect(() => {
    fetchAppMetrics();
    const intervalId = setInterval(fetchAppMetrics, 30 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const onlineMetricVal = Number(appMetrics.find((m) => m.key === "online")?.value || 0);
  const totalMetricVal = Number(appMetrics.find((m) => m.key === "total")?.value || 0);

  const activeIncidentCount = mockIncidents.filter(
    (i) => i.status === "open" || i.status === "investigating"
  ).length;

  const handleNav = (tab: NavTabId | string) => {
    setActiveTab(tab as NavTabId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <MonitoringSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <div className="lg:pl-64 flex flex-col min-h-dvh">
        <MonitoringHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigateTab={handleNav}
        />

        <main className="flex-1 p-4 sm:p-5 space-y-4 md:space-y-6">
          {activeTab === "dashboard" && (
            <>
              <DashboardGreeting name={user?.name} onlineCount={onlineMetricVal} totalCount={totalMetricVal} />
              
              {/* PERBAIKAN 1: Pembungkus Kartu Metrik - Pastikan 5 kolom sejajar */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {appMetrics.map((metric) => (
                  <StatusCard key={metric.key} metric={metric as any} />
                ))}
              </div>
              
              {/* PERBAIKAN 2: Pembungkus Grafik - Pastikan sejajar 2:1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <StatusTrendChart title="Grafik Status Aplikasi" appMetrics={appMetrics} />
                </div>
                <div className="lg:col-span-1">
                  <StatusDonutChart appMetrics={appMetrics} />
                </div>
              </div>

              {/* PERBAIKAN 3: Pembungkus Daftar Insiden & Uptime - Pastikan sejajar 2:1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DashboardIncidentList limit={5} />
                </div>
                <div className="lg:col-span-1">
                  <TopUptimeWidget limit={6} onViewAll={() => setActiveTab("uptime")} />
                </div>
              </div>
              
              <DashboardOpdSummary 
                applications={applicationsData}
                onViewAll={() => setActiveTab("opd")} 
              />
            </>
          )}

          {activeTab === "uptime" && (
            <div className="space-y-4">
              <PageHeader title="Daftar Aplikasi & Uptime" subtitle="Pemantauan ketersediaan 30-hari, ping response time, dan validitas SSL per layanan" icon={Activity} tag="Status Layanan" />
              <UptimeList />
            </div>
          )}

          {activeTab === "incidents" && (
            <div className="space-y-4">
              <PageHeader title="Manajemen Insiden & Gangguan" subtitle="Lacak, investigasi, dan selesaikan tiket gangguan layanan per Perangkat Daerah" tag="Tiket Insiden" />
              <IncidentManagementView />
            </div>
          )}

          {activeTab === "opd" && (
            <div className="space-y-4">
              <PageHeader title="Dashboard Perangkat Daerah (OPD)" subtitle="Pemantauan kinerja sistem per instansi Pemerintah Provinsi Jawa Barat" tag="Per OPD" />
              <OpdSummaryGrid applications={applicationsData} />
            </div>
          )}

          {activeTab === "ssl" && (
            <div className="space-y-4">
              <PageHeader title="Pemantauan Sertifikat SSL/TLS" subtitle="Audit keamanan dan peringatan dini masa berlaku sertifikat HTTPS seluruh domain" tag="Keamanan SSL" />
              <SslMonitorView />
            </div>
          )}

          {activeTab === "response_time" && (
            <div className="space-y-4">
              <PageHeader title="Waktu Respons Aplikasi (Response Time)" subtitle="Analisis latensi dan performa response time layanan digital per OPD secara periodik" tag="Analisis Latensi" />
              <ResponseTimeView />
            </div>
          )}

          {activeTab === "laporan_uptime" && (
            <div className="space-y-4">
              <PageHeader title="Laporan Uptime Layanan" subtitle="Rekap uptime, downtime kumulatif, dan kepatuhan SLA per aplikasi dan Perangkat Daerah" tag="Laporan Uptime" />
              <UptimeReportView />
            </div>
          )}

          {activeTab === "laporan_gangguan" && (
            <div className="space-y-4">
              <PageHeader title="Laporan Gangguan & Disruption" subtitle="Rekap historis insiden, analisis akar masalah, dan tren gangguan per periode" tag="Laporan Gangguan" />
              <DisruptionReportView />
            </div>
          )}

          {activeTab === "ekspor" && (
            <div className="space-y-4">
              <PageHeader title="Ekspor & Unduh Laporan" subtitle="Generate dan unduh laporan uptime, gangguan, atau SSL dalam format PDF, Excel, atau CSV" tag="Ekspor Data" />
              <ExportReportView />
            </div>
          )}

          {activeTab === "notifikasi" && (
            <div className="space-y-4">
              <PageHeader title="Pusat Notifikasi" subtitle="Kelola notifikasi insiden, pengaturan kanal pengiriman, dan daftar penerima per OPD" tag="Notifikasi" />
              <NotificationsView />
            </div>
          )}

          {activeTab === "user_role" && (
            <div className="space-y-4">
              <PageHeader title="Manajemen Pengguna & Role" subtitle="Kelola akun pengguna, hak akses berbasis role (RBAC), dan lingkup akses per OPD" tag="Akses & Keamanan" />
              <UserRoleView />
            </div>
          )}

          {activeTab === "integrasi" && (
            <div className="space-y-4">
              <PageHeader title="Konfigurasi Integrasi Sistem" subtitle="Kelola koneksi ke Katalog Aplikasi, Telegram Bot, SMTP Email, dan webhook eksternal" tag="Integrasi" />
              <IntegrationsView />
            </div>
          )}

          {activeTab === "audit_trail" && (
            <div className="space-y-4">
              <PageHeader title="Audit Trail & Log Aktivitas" subtitle="Rekam jejak aktivitas pengguna, perubahan konfigurasi, dan aksi kritis sistem" tag="Keamanan & Audit" />
              <AuditTrailView />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <PageHeader title="Pengaturan Sistem & Akun" subtitle="Konfigurasi robot monitoring, webhook notifikasi, dan manajemen akses pengguna" tag="Pengaturan" />
              <SettingsView />
            </div>
          )}
        </main>

        <footer className="border-t border-border px-5 py-3 text-center text-[11px] text-ink/35">
          © 2026 Dinas Komunikasi dan Informatika Provinsi Jawa Barat · Monitoring System APTIKA v2.0
        </footer>
      </div>
      <LoginModal />
    </div>
  );
}

function RootAuthGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoadingCheck(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email atau password salah.");

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          username: username || email.split("@")[0],
          password,
          role: "operator",
          roleLabel: "Operator",
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mendaftarkan akun.");

      setSuccessMsg("Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.");
      setIsRegisterMode(false);
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCheck) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand font-mono text-base font-bold text-white shadow-md">
              SM
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {isRegisterMode ? "Pendaftaran Akun Baru" : "Portal Akses Pengguna"}
            </h1>
            <p className="text-xs text-slate-500">Monitoring System APTIKA Jabar</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
              {successMsg}
            </div>
          )}

          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@diskominfo.go.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-brand py-3 text-xs font-bold text-white shadow-md hover:bg-brand/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Masuk Sistem
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setError(""); setSuccessMsg(""); }}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Belum punya akun? Daftar di sini →
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Pengguna"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-xs text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="username_anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama@jabarprov.go.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-xs text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-xs text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-xl bg-brand py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Daftarkan Akun
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setError(""); setSuccessMsg(""); }}
                  className="text-xs font-semibold text-slate-600 hover:text-brand flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="h-3 w-3" /> Kembali ke Halaman Login
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
            Diskominfo Provinsi Jawa Barat · Single Sign-On Ready
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default RootAuthGate;