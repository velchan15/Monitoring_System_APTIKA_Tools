import { AuditLogEntry, AuditFilter } from "@/lib/types/audit";

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-01", timestamp: "29 Agu 2026, 08:35 WIB",
    userName: "Super Admin APTIKA", userEmail: "admin.aptika@jabarprov.go.id", userRole: "Super Admin",
    actionType: "resolve", actionTitle: "Menyelesaikan Insiden",
    targetEntity: "INC-2026-0828-04 (e-SAMSAT Jabar Mobile)",
    ipAddress: "10.0.1.55",
    details: { field: "status", oldValue: "open", newValue: "resolved", summary: "Disk I/O kembali normal." },
  },
  {
    id: "audit-02", timestamp: "29 Agu 2026, 08:10 WIB",
    userName: "Super Admin APTIKA", userEmail: "admin.aptika@jabarprov.go.id", userRole: "Super Admin",
    actionType: "update", actionTitle: "Memperbarui Konfigurasi Monitoring",
    targetEntity: "Konfigurasi Check Interval",
    ipAddress: "10.0.1.55",
    details: { field: "checkInterval", oldValue: "60 detik", newValue: "30 detik" },
  },
  {
    id: "audit-03", timestamp: "28 Agu 2026, 17:00 WIB",
    userName: "Super Admin APTIKA", userEmail: "admin.aptika@jabarprov.go.id", userRole: "Super Admin",
    actionType: "create", actionTitle: "Menambahkan Pengguna Baru",
    targetEntity: "User: Fitri Ramdani (fitri.ramdani@jabarprov.go.id)",
    ipAddress: "10.0.1.55",
    details: { summary: "Role: Operator. OPD: Tidak ada (lintas-OPD)." },
  },
  {
    id: "audit-04", timestamp: "28 Agu 2026, 16:30 WIB",
    userName: "Sri Rahayu", userEmail: "sri.rahayu@disdukcapil.jabarprov.go.id", userRole: "Admin OPD",
    actionType: "update", actionTitle: "Mengubah Status Insiden",
    targetEntity: "INC-2026-0829-01 (SIPD Kependudukan)",
    ipAddress: "10.20.15.102",
    details: { field: "status", oldValue: "open", newValue: "investigating", summary: "Tim teknis DB sudah dihubungi." },
  },
  {
    id: "audit-05", timestamp: "28 Agu 2026, 14:10 WIB",
    userName: "Rian Prasetya", userEmail: "rian.prasetya@jabarprov.go.id", userRole: "Operator",
    actionType: "sync", actionTitle: "Sinkronisasi Katalog Aplikasi",
    targetEntity: "Katalog Aplikasi Pemprov Jabar",
    ipAddress: "10.0.1.88",
    details: { summary: "215 aplikasi disinkronkan, 3 aplikasi baru terdeteksi." },
  },
  {
    id: "audit-06", timestamp: "28 Agu 2026, 09:00 WIB",
    userName: "Super Admin APTIKA", userEmail: "admin.aptika@jabarprov.go.id", userRole: "Super Admin",
    actionType: "export", actionTitle: "Mengunduh Laporan",
    targetEntity: "Laporan_Uptime_Agustus_2026_Semua_OPD.xlsx",
    ipAddress: "10.0.1.55",
    details: { summary: "Period: 01-31 Agu 2026, format Excel, scope: Semua OPD." },
  },
  {
    id: "audit-07", timestamp: "27 Agu 2026, 13:00 WIB",
    userName: "Super Admin APTIKA", userEmail: "admin.aptika@jabarprov.go.id", userRole: "Super Admin",
    actionType: "update", actionTitle: "Mengubah Role Pengguna",
    targetEntity: "User: Ridwan Maulana",
    ipAddress: "10.0.1.55",
    details: { field: "role", oldValue: "Operator", newValue: "Admin OPD" },
  },
  {
    id: "audit-08", timestamp: "27 Agu 2026, 11:00 WIB",
    userName: "dr. Ahmad Fauzi", userEmail: "ahmad.fauzi@dinkes.jabarprov.go.id", userRole: "Admin OPD",
    actionType: "auth", actionTitle: "Login ke Sistem",
    targetEntity: "Session (Dinas Kesehatan)",
    ipAddress: "172.16.8.42",
    details: { summary: "Login berhasil dari IP jaringan internal Dinkes." },
  },
  {
    id: "audit-09", timestamp: "26 Agu 2026, 15:30 WIB",
    userName: "Super Admin APTIKA", userEmail: "admin.aptika@jabarprov.go.id", userRole: "Super Admin",
    actionType: "delete", actionTitle: "Menonaktifkan Pengguna",
    targetEntity: "User: Fitri Ramdani",
    ipAddress: "10.0.1.55",
    details: { field: "isActive", oldValue: "true", newValue: "false" },
  },
  {
    id: "audit-10", timestamp: "26 Agu 2026, 09:00 WIB",
    userName: "Rian Prasetya", userEmail: "rian.prasetya@jabarprov.go.id", userRole: "Operator",
    actionType: "create", actionTitle: "Mendaftarkan Aplikasi Baru",
    targetEntity: "Aplikasi: SIPPD Perencanaan (Bappeda Jabar)",
    ipAddress: "10.0.1.88",
    details: { summary: "URL: https://bappeda.jabarprov.go.id/sippd, check interval: 60 detik." },
  },
];

/**
 * Fetch audit log entries.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/audit-logs`
 * Query params: ?actionType=...&userEmail=...&searchQuery=...&startDate=...&endDate=...
 */
export async function getAuditLogs(filter?: AuditFilter): Promise<AuditLogEntry[]> {
  await new Promise((r) => setTimeout(r, 70));
  let result = [...mockAuditLogs];

  if (!filter) return result;

  if (filter.actionType && filter.actionType !== "all") {
    result = result.filter((a) => a.actionType === filter.actionType);
  }
  if (filter.userEmail && filter.userEmail !== "all") {
    result = result.filter((a) => a.userEmail === filter.userEmail);
  }
  if (filter.searchQuery?.trim()) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(
      (a) =>
        a.actionTitle.toLowerCase().includes(q) ||
        a.targetEntity.toLowerCase().includes(q) ||
        a.userName.toLowerCase().includes(q) ||
        (a.details?.summary?.toLowerCase().includes(q) ?? false)
    );
  }
  return result;
}
