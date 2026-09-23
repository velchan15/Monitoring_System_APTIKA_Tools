"use client";

import { useState } from "react";
import {
  RefreshCcw, Loader2, CheckCircle2, XCircle, Wifi, WifiOff,
  AlertTriangle, Send, Settings, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockIntegrations, testIntegrationConnection, triggerSync, updateIntegrationStatus
} from "@/lib/data/integrations";
import type { IntegrationItem, IntegrationStatus } from "@/lib/types/integration";

const STATUS_CFG: Record<IntegrationStatus, { label: string; class: string; icon: React.ElementType }> = {
  connected: { label: "Terhubung", class: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Wifi },
  degraded: { label: "Degraded", class: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle },
  disconnected: { label: "Terputus", class: "bg-red-100 text-red-700 border-red-200", icon: WifiOff },
  syncing: { label: "Sinkronisasi...", class: "bg-brand-soft text-brand border-brand/30", icon: RefreshCcw },
};

interface TestResult {
  success: boolean;
  latencyMs: number;
  message: string;
}

interface IntegrationCardProps {
  integration: IntegrationItem;
  onSelect: (id: string) => void;
  onSyncSuccess: (id: string, updatedCount: number) => void;
}

function IntegrationCard({ integration, onSelect, onSyncSuccess }: IntegrationCardProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [syncResult, setSyncResult] = useState<{ count: number } | null>(null);

  const stCfg = STATUS_CFG[integration.status];
  const StIcon = stCfg.icon;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testIntegrationConnection(integration.id);
    setTestResult(result);
    setIsTesting(false);
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const result = await triggerSync(integration.id);
    if (result.success) {
      setSyncResult({ count: result.updatedCount });
      onSyncSuccess(integration.id, result.updatedCount);
    }
    setIsSyncing(false);
    setTimeout(() => setSyncResult(null), 5000);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] rounded bg-canvas border border-border px-1.5 py-0.5 font-mono text-ink/50">{integration.category}</span>
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", stCfg.class)}>
              <StIcon className="h-2.5 w-2.5" /> {stCfg.label}
            </span>
          </div>
          <h4 className="text-sm font-bold text-ink">{integration.name}</h4>
          <p className="font-mono text-[10px] text-ink/45 mt-0.5">{integration.endpointOrTarget}</p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(integration.id)}
          className="text-ink/30 hover:text-ink/60 transition mt-1 flex-shrink-0 cursor-pointer"
          aria-label="Pengaturan integrasi"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-ink/65 leading-relaxed">{integration.description}</p>

      {/* Last sync */}
      {integration.lastSyncAt && (
        <div className="text-[10px] text-ink/40 font-mono">
          Terakhir sinkron: {integration.lastSyncAt}
        </div>
      )}

      {/* Result feedback */}
      {testResult && (
        <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold", testResult.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700")}>
          {testResult.success ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> : <XCircle className="h-3.5 w-3.5 flex-shrink-0" />}
          {testResult.message}
        </div>
      )}
      {syncResult && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold bg-brand-soft text-brand">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Sinkronisasi selesai — {syncResult.count} item diperbarui
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-canvas disabled:opacity-60 transition cursor-pointer"
        >
          {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          {isTesting ? "Menguji..." : "Uji Koneksi"}
        </button>

        {integration.syncIntervalMinutes !== undefined && integration.syncIntervalMinutes >= 0 && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || integration.status === "disconnected"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/15 disabled:opacity-60 transition cursor-pointer"
          >
            {isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
            {isSyncing ? "Sinkronisasi..." : "Sinkron Sekarang"}
          </button>
        )}
      </div>
    </div>
  );
}

interface ConfigPanelProps {
  integration: IntegrationItem;
  onClose: () => void;
  onDisconnect: (id: string) => void;
  onSave: (id: string) => void;
}

function ConfigPanel({ integration, onClose, onDisconnect, onSave }: ConfigPanelProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-canvas/60">
          <div>
            <h3 className="text-sm font-bold text-ink">{integration.name}</h3>
            <p className="text-[11px] text-ink/50">Konfigurasi Integrasi</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-ink/40 hover:text-ink rounded-lg cursor-pointer" aria-label="Tutup">
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {integration.configFields?.map((field) => (
            <div key={field.key}>
              <label className="block font-bold text-ink/50 uppercase tracking-wider text-[10px] mb-1.5">{field.label}</label>
              <input
                type={field.isSecret ? "password" : "text"}
                defaultValue={field.value}
                className="w-full rounded-lg border border-border px-3 py-2 text-xs text-ink font-mono focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder={field.isSecret ? "••••••••" : ""}
              />
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => { onDisconnect(integration.id); onClose(); }}
              className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
            >
              {integration.status !== "disconnected" ? "Putuskan Koneksi" : "Hapus Konfigurasi"}
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-ink hover:bg-canvas cursor-pointer">Batal</button>
              <button
                type="button"
                onClick={() => { onSave(integration.id); onClose(); }}
                className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntegrationsView() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(mockIntegrations);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedIntegration = integrations.find((i) => i.id === selectedId) || null;

  const handleDisconnect = async (id: string) => {
    await updateIntegrationStatus(id, "disconnected");
    setIntegrations(prev => prev.map(item => item.id === id ? { ...item, status: "disconnected" } : item));
  };

  const handleSyncSuccess = (id: string, updatedCount: number) => {
    const nowStr = "Baru saja (" + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB)";
    setIntegrations(prev => prev.map(item => item.id === id ? { ...item, status: "connected", lastSyncAt: nowStr } : item));
  };

  const handleSaveConfig = (id: string) => {
    setIntegrations(prev => prev.map(item => item.id === id ? { ...item, status: "connected" } : item));
  };

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-status-online" />
          <span className="font-semibold text-ink">{connectedCount} Integrasi Aktif</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-status-warning" />
          <span className="font-semibold text-ink">{integrations.filter((i) => i.status === "degraded").length} Degraded</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 shadow-sm">
          <WifiOff className="h-4 w-4 text-status-offline" />
          <span className="font-semibold text-ink">{integrations.filter((i) => i.status === "disconnected").length} Terputus</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onSelect={(id) => setSelectedId(id)}
            onSyncSuccess={handleSyncSuccess}
          />
        ))}
      </div>

      {selectedIntegration && (
        <ConfigPanel
          integration={selectedIntegration}
          onClose={() => setSelectedId(null)}
          onDisconnect={handleDisconnect}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
}