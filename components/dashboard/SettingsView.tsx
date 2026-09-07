"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Globe,
  KeyRound,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";

export function SettingsView() {
  const { user, setLoginModalOpen } = useAuth();
  const [interval, setInterval] = useState("30");
  const [telegramAlert, setTelegramAlert] = useState(true);
  const [emailAlert, setEmailAlert] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Account Info Card */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Informasi Akun Pengguna</h2>
        <p className="text-xs text-ink/45">Data sesi dan tingkat otorisasi sistem Anda saat ini</p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-canvas/40 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand font-mono text-base font-bold text-white shadow-sm">
              {user?.initials || "SA"}
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{user?.name}</p>
              <p className="text-xs text-ink/60">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">
                  {user?.roleLabel}
                </span>
                {user?.opdName && (
                  <span className="text-[11px] text-ink/50">({user.opdName})</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-bold text-brand shadow-xs hover:bg-canvas"
          >
            <KeyRound className="h-4 w-4" />
            Ganti / Beralih Akun
          </button>
        </div>
      </div>

      {/* Monitoring Preferences Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-ink">Frekuensi Pengecekan (Health Check)</h3>
          <p className="text-xs text-ink/45">Interval eksekusi ping robot monitoring background</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { val: "15", label: "15 Detik (Ultra Realtime)" },
              { val: "30", label: "30 Detik (Standar Rekomendasi)" },
              { val: "60", label: "60 Detik (Hemat Bandwidth)" },
            ].map((opt) => (
              <label
                key={opt.val}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-xs font-semibold transition-all ${
                  interval === opt.val
                    ? "border-brand bg-brand-soft/30 text-brand ring-1 ring-brand"
                    : "border-border bg-white text-ink hover:bg-canvas"
                }`}
              >
                <span>{opt.label}</span>
                <input
                  type="radio"
                  name="interval"
                  value={opt.val}
                  checked={interval === opt.val}
                  onChange={(e) => setInterval(e.target.value)}
                  className="accent-brand"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Webhook & Notification Alert */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-ink">Integrasi Saluran Notifikasi Darurat</h3>
          <p className="text-xs text-ink/45">Pemberitahuan otomatis saat terjadi insiden berstatus Kritis (P1)</p>

          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-canvas/50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-sky-500" />
                <div>
                  <p className="text-xs font-bold text-ink">Telegram Bot Command Center</p>
                  <p className="text-[11px] text-ink/50">Kirim broadcast ke kanal @JabarCC_Alerts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={telegramAlert}
                onChange={(e) => setTelegramAlert(e.target.checked)}
                className="h-4 w-4 rounded accent-brand"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-canvas/50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-ink">Email Alert Eskalasi OPD</p>
                  <p className="text-[11px] text-ink/50">Kirim notifikasi email otomatis ke PIC Teknis instansi terkait</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlert}
                onChange={(e) => setEmailAlert(e.target.checked)}
                className="h-4 w-4 rounded accent-brand"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-status-online">
              <CheckCircle2 className="h-4 w-4" />
              Pengaturan berhasil disimpan!
            </span>
          ) : (
            <span className="text-xs text-ink/40">Perubahan langsung aktif di sesi browser ini</span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            Simpan Konfigurasi
          </button>
        </div>
      </form>
    </div>
  );
}
