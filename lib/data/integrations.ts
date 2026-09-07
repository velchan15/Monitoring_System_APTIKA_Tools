import { IntegrationItem, IntegrationStatus } from "@/lib/types/integration";

export const mockIntegrations: IntegrationItem[] = [
  {
    id: "int-01",
    name: "Katalog Aplikasi Provinsi Jawa Barat",
    category: "Catalog",
    description: "Sinkronisasi otomatis daftar aplikasi dari JDIH dan Portal Katalog Resmi Pemprov Jabar. Data diperbarui setiap hari pukul 00:00 WIB.",
    status: "connected",
    lastSyncAt: "29 Agu 2026, 00:00 WIB",
    endpointOrTarget: "https://api.jabarprov.go.id/catalog/apps",
    syncIntervalMinutes: 1440,
    configFields: [
      { key: "api_key", label: "API Key", value: "****-****-****-a1b2", isSecret: true },
      { key: "sync_interval_hours", label: "Interval Sinkronisasi (Jam)", value: "24", isSecret: false },
      { key: "base_url", label: "Base URL", value: "https://api.jabarprov.go.id/catalog", isSecret: false },
    ],
  },
  {
    id: "int-02",
    name: "Telegram Bot Command Center",
    category: "Messaging",
    description: "Bot Telegram untuk notifikasi insiden real-time ke kanal @JabarCC_Alerts dan pesan langsung ke PIC teknis OPD.",
    status: "connected",
    lastSyncAt: "29 Agu 2026, 07:22 WIB",
    endpointOrTarget: "@JabarCC_Alerts",
    syncIntervalMinutes: 0,
    configFields: [
      { key: "bot_token", label: "Bot Token", value: "********************", isSecret: true },
      { key: "chat_id", label: "Channel Chat ID", value: "-1001234567890", isSecret: false },
      { key: "parse_mode", label: "Parse Mode", value: "HTML", isSecret: false },
    ],
  },
  {
    id: "int-03",
    name: "SMTP Email Relay (Jabar Gov Server)",
    category: "Email",
    description: "Server relay email pemerintah untuk mengirim notifikasi eskalasi dan laporan periodik ke PIC OPD.",
    status: "degraded",
    lastSyncAt: "28 Agu 2026, 14:00 WIB",
    endpointOrTarget: "smtp.jabarprov.go.id:587",
    syncIntervalMinutes: 0,
    configFields: [
      { key: "smtp_host", label: "SMTP Host", value: "smtp.jabarprov.go.id", isSecret: false },
      { key: "smtp_port", label: "Port", value: "587", isSecret: false },
      { key: "smtp_user", label: "Username", value: "noreply@jabarprov.go.id", isSecret: false },
      { key: "smtp_password", label: "Password", value: "**********", isSecret: true },
    ],
  },
  {
    id: "int-04",
    name: "Webhook Pusdatin Jabar",
    category: "API Gateway",
    description: "Webhook endpoint ke sistem Pusdatin untuk forward event monitoring ke sistem BI Dashboard Pemprov.",
    status: "disconnected",
    lastSyncAt: "15 Jul 2026, 10:00 WIB",
    endpointOrTarget: "https://pusdatin.jabarprov.go.id/webhook/alert",
    syncIntervalMinutes: 0,
    configFields: [
      { key: "webhook_url", label: "Webhook URL", value: "https://pusdatin.jabarprov.go.id/webhook/alert", isSecret: false },
      { key: "webhook_secret", label: "Secret Token", value: "**********", isSecret: true },
    ],
  },
];

/**
 * Fetch all integrations.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/integrations`
 */
export async function getIntegrations(): Promise<IntegrationItem[]> {
  await new Promise((r) => setTimeout(r, 70));
  return mockIntegrations;
}

/**
 * Test connection for a specific integration.
 *
 * // TODO(backend): replace with POST to `/api/integrations/:id/test`
 * Response contract: { success: boolean; latencyMs: number; message: string }
 */
export async function testIntegrationConnection(id: string): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
}> {
  await new Promise((r) => setTimeout(r, 1200));
  const integration = mockIntegrations.find((i) => i.id === id);
  if (!integration) return { success: false, latencyMs: 0, message: "Integrasi tidak ditemukan." };

  if (integration.status === "disconnected") {
    return { success: false, latencyMs: 0, message: "Koneksi gagal. Endpoint tidak dapat dijangkau." };
  }
  const latency = Math.floor(Math.random() * 120) + 40;
  return { success: true, latencyMs: latency, message: `Koneksi berhasil (${latency}ms)` };
}

/**
 * Trigger a manual sync for a catalog-type integration.
 *
 * // TODO(backend): replace with POST to `/api/integrations/:id/sync`
 */
export async function triggerSync(id: string): Promise<{ success: boolean; updatedCount: number }> {
  await new Promise((r) => setTimeout(r, 2000));
  const integration = mockIntegrations.find((i) => i.id === id);
  if (!integration) return { success: false, updatedCount: 0 };

  integration.lastSyncAt = new Date().toLocaleString("id-ID") + " WIB";
  return { success: true, updatedCount: Math.floor(Math.random() * 15) + 1 };
}

/**
 * Update integration configuration.
 *
 * // TODO(backend): replace with PATCH to `/api/integrations/:id`
 * Payload: Partial<IntegrationItem>
 */
export async function updateIntegrationStatus(id: string, newStatus: IntegrationStatus): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  const integration = mockIntegrations.find((i) => i.id === id);
  if (integration) integration.status = newStatus;
}
