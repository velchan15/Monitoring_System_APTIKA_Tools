import { NotificationItem, NotificationChannelConfig, RecipientContact } from "@/lib/types/notification";

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-01",
    title: "503 Service Unavailable — SIPD Kependudukan",
    message: "Server aplikasi SIPD-Kependudukan Terpadu gagal merespons request API selama 3 menit berturut-turut. Tim teknis sedang menangani.",
    timestamp: "29 Agu 2026, 07:22 WIB",
    isRead: false,
    severity: "critical",
    category: "incident",
    targetUrl: "incidents",
    opdCode: "DISDUKCAPIL",
  },
  {
    id: "notif-02",
    title: "High Latency — SIMPUS Jabar Online",
    message: "Waktu respons query rekam medis puskesmas melonjak di atas 3800ms. Melebihi threshold normal (1500ms).",
    timestamp: "29 Agu 2026, 06:45 WIB",
    isRead: false,
    severity: "warning",
    category: "incident",
    targetUrl: "incidents",
    opdCode: "DINKES",
  },
  {
    id: "notif-03",
    title: "SSL Certificate Akan Kadaluarsa dalam 4 Hari",
    message: "Sertifikat SSL Portal PPID Terbuka (*.ppid.jabarprov.go.id) akan berakhir pada 2 September 2026. Segera perpanjang.",
    timestamp: "28 Agu 2026, 14:05 WIB",
    isRead: false,
    severity: "warning",
    category: "ssl",
    targetUrl: "ssl",
    opdCode: "DISKOMINFO",
  },
  {
    id: "notif-04",
    title: "Insiden Diselesaikan — e-SAMSAT Disk I/O",
    message: "Insiden penggunaan disk storage 88% pada node penyimpanan Bapenda berhasil diselesaikan. Kapasitas kembali normal (42%).",
    timestamp: "28 Agu 2026, 10:05 WIB",
    isRead: true,
    severity: "success",
    category: "incident",
    targetUrl: "incidents",
    opdCode: "BAPENDA",
  },
  {
    id: "notif-05",
    title: "Sinkronisasi Katalog Aplikasi Berhasil",
    message: "Katalog Aplikasi Provinsi Jawa Barat berhasil disinkronkan. 215 aplikasi terdaftar, 3 aplikasi baru terdeteksi.",
    timestamp: "28 Agu 2026, 08:00 WIB",
    isRead: true,
    severity: "info",
    category: "system",
  },
  {
    id: "notif-06",
    title: "Auto-Refresh Monitoring Terjadwal",
    message: "Siklus auto-refresh pemantauan 30 detik berjalan normal. 215 endpoint berhasil diquery.",
    timestamp: "29 Agu 2026, 08:30 WIB",
    isRead: true,
    severity: "info",
    category: "system",
  },
];

export const mockChannels: NotificationChannelConfig[] = [
  {
    id: "ch-01", name: "Telegram Bot Command Center",
    type: "telegram", destination: "@JabarCC_Alerts",
    isEnabled: true,
    subscribedCategories: ["incident", "ssl"],
    minSeverity: "warning",
  },
  {
    id: "ch-02", name: "Email Alert Eskalasi OPD",
    type: "email", destination: "aptika-alerts@jabarprov.go.id",
    isEnabled: true,
    subscribedCategories: ["incident", "ssl", "system"],
    minSeverity: "critical",
  },
  {
    id: "ch-03", name: "Webhook Pusdatin Jabar",
    type: "webhook", destination: "https://pusdatin.jabarprov.go.id/webhook/alert",
    isEnabled: false,
    subscribedCategories: ["incident"],
    minSeverity: "critical",
  },
];

export const mockRecipients: RecipientContact[] = [
  {
    id: "rec-01", opdCode: "DISKOMINFO", opdName: "Dinas Komunikasi dan Informatika",
    picName: "Dr. Hendra Wijaya, S.Kom., M.T.",
    email: "aptika@diskominfo.jabarprov.go.id", telegramHandle: "@hendra_aptika",
    phone: "0812-3456-7890", isAlertActive: true,
  },
  {
    id: "rec-02", opdCode: "DISDUKCAPIL", opdName: "Dinas Kependudukan dan Pencatatan Sipil",
    picName: "Ir. Hj. Sri Rahayu, M.M.",
    email: "it@disdukcapil.jabarprov.go.id", telegramHandle: "@sri_rahayu_dc",
    phone: "0811-9876-5432", isAlertActive: true,
  },
  {
    id: "rec-03", opdCode: "DINKES", opdName: "Dinas Kesehatan",
    picName: "dr. R. Ahmad Fauzi, Sp.A.",
    email: "pusdatin@dinkes.jabarprov.go.id", telegramHandle: "@dr_fauzi",
    phone: "0813-2233-4455", isAlertActive: true,
  },
  {
    id: "rec-04", opdCode: "BAPENDA", opdName: "Badan Pendapatan Daerah",
    picName: "Drs. M. Taufik Hidayat, M.Si.",
    email: "ti@bapenda.jabarprov.go.id",
    phone: "0815-6677-8899", isAlertActive: false,
  },
];

/**
 * Fetch notifications list.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/notifications`
 * Query params: ?isRead=true|false&category=...&severity=...
 */
export async function getNotifications(params?: { onlyUnread?: boolean }): Promise<NotificationItem[]> {
  await new Promise((r) => setTimeout(r, 60));
  if (params?.onlyUnread) return mockNotifications.filter((n) => !n.isRead);
  return mockNotifications;
}

/**
 * Get unread notification count for header badge.
 *
 * // TODO(backend): replace with fetch to `/api/notifications/count?isRead=false`
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const all = await getNotifications();
  return all.filter((n) => !n.isRead).length;
}

/**
 * Mark a notification as read.
 *
 * // TODO(backend): replace with PATCH to `/api/notifications/:id/read`
 */
export async function markNotificationRead(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 40));
  const n = mockNotifications.find((n) => n.id === id);
  if (n) n.isRead = true;
}

/**
 * Mark all notifications as read.
 *
 * // TODO(backend): replace with POST to `/api/notifications/read-all`
 */
export async function markAllNotificationsRead(): Promise<void> {
  await new Promise((r) => setTimeout(r, 60));
  mockNotifications.forEach((n) => { n.isRead = true; });
}

/**
 * Fetch notification channel configurations.
 *
 * // TODO(backend): replace with fetch to `/api/notification-channels`
 */
export async function getNotificationChannels(): Promise<NotificationChannelConfig[]> {
  await new Promise((r) => setTimeout(r, 60));
  return mockChannels;
}

/**
 * Fetch notification recipients.
 *
 * // TODO(backend): replace with fetch to `/api/notification-recipients`
 */
export async function getNotificationRecipients(): Promise<RecipientContact[]> {
  await new Promise((r) => setTimeout(r, 60));
  return mockRecipients;
}
