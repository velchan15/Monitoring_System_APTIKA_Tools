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
    // ID diubah menjadi wa-bot agar sinkron dengan logika tombol di IntegrationsView.tsx
    id: "wa-bot", 
    name: "WhatsApp Bot Command Center",
    category: "Messaging",
    description: "Bot WhatsApp (Puppeteer) untuk notifikasi insiden real-time ke nomor PIC teknis OPD.",
    status: "connected",
    lastSyncAt: "Baru saja",
    endpointOrTarget: "http://localhost:3005/api/send-wa",
    syncIntervalMinutes: 0,
    configFields: [
      { key: "wa_port", label: "Local Bot Port", value: "3005", isSecret: false },
      { key: "default_number", label: "Nomor Target Uji Coba", value: "6282315517254", isSecret: false },
      { key: "session_status", label: "Status Sesi", value: "AUTHENTICATED", isSecret: false },
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const integration = mockIntegrations.find((i) => i.id === id);
  
  if (!integration) return { success: false, latencyMs: 0, message: "Integrasi tidak ditemukan." };
  if (integration.status === "disconnected") return { success: false, latencyMs: 0, message: "Koneksi dimatikan oleh sistem." };

  try {
    // A. Logika Eksekusi SMTP Email (int-03)
    if (id === "int-03") {
      const res = await fetch(`${API_URL}/api/integrations/test-smtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: integration.configFields?.find(f => f.key === "smtp_host")?.value,
          port: integration.configFields?.find(f => f.key === "smtp_port")?.value,
          user: integration.configFields?.find(f => f.key === "smtp_user")?.value,
          pass: integration.configFields?.find(f => f.key === "smtp_password")?.value,
        })
      });
      return await res.json();
    }

    // B. Logika Eksekusi Webhook (int-04)
    if (id === "int-04") {
      const res = await fetch(`${API_URL}/api/integrations/test-webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: integration.endpointOrTarget })
      });
      return await res.json();
    }

    // C. Logika Eksekusi Katalog API (int-01) - Sementara masih simulasi karena biasanya butuh API Key spesifik
    const latency = Math.floor(Math.random() * 120) + 40;
    return { success: true, latencyMs: latency, message: `Koneksi API Katalog berhasil (${latency}ms)` };

  } catch (error) {
    return { success: false, latencyMs: 0, message: "Gagal terhubung ke Backend (Port 3001 mati)." };
  }
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