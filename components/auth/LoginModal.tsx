"use client";

import { useState } from "react";
import {
  Building2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { PRESET_ACCOUNTS, useAuth, type UserRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, loginAsPreset, login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("super_admin");
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");

  if (!isLoginModalOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login(email, role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={() => setLoginModalOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-sidebar px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-mono text-xs font-bold text-white">
              SM
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Portal Akses Pengguna</h3>
              <p className="text-[11px] text-sidebar-muted">Monitoring System APTIKA Jabar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLoginModalOpen(false)}
            className="rounded-lg p-1 text-sidebar-muted hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border bg-canvas/40 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("preset")}
            className={cn(
              "border-b-2 px-4 py-2 text-xs font-semibold transition-colors",
              activeTab === "preset"
                ? "border-brand text-brand"
                : "border-transparent text-ink/50 hover:text-ink"
            )}
          >
            Pilih Akun Demo (1-Klik)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={cn(
              "border-b-2 px-4 py-2 text-xs font-semibold transition-colors",
              activeTab === "custom"
                ? "border-brand text-brand"
                : "border-transparent text-ink/50 hover:text-ink"
            )}
          >
            Login Manual
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === "preset" ? (
            <div className="space-y-3">
              <p className="text-xs text-ink/60">
                Pilih peran akun untuk menguji fitur dengan hak akses yang berbeda:
              </p>

              <div className="space-y-2">
                {PRESET_ACCOUNTS.map((preset) => {
                  const isCurrent = user?.id === preset.id;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => loginAsPreset(preset.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all",
                        isCurrent
                          ? "border-brand bg-brand-soft/40 shadow-sm ring-1 ring-brand"
                          : "border-border bg-white hover:border-brand/40 hover:bg-canvas/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                            preset.avatarBg
                          )}
                        >
                          {preset.initials}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-ink">{preset.name}</p>
                          <p className="text-[11px] text-ink/50">{preset.email}</p>
                          <span className="mt-0.5 inline-block rounded bg-canvas px-1.5 py-0.2 text-[10px] font-semibold text-ink/70 border border-border">
                            {preset.roleLabel}
                          </span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-brand hover:underline">
                          Pilih →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink">Alamat Email:</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink/40" />
                  <input
                    type="email"
                    required
                    placeholder="nama@jabarprov.go.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-xs text-ink focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink">Pilih Tingkat Akses:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand focus:outline-none"
                >
                  <option value="super_admin">Super Admin APTIKA (Akses Penuh)</option>
                  <option value="admin_opd">Admin Perangkat Daerah (OPD)</option>
                  <option value="operator">Operator / Viewer (Read Only)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-brand py-2 text-xs font-bold text-white shadow-sm hover:bg-brand/90 transition-colors"
              >
                Masuk Sistem
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-canvas/30 px-6 py-3 text-center text-[11px] text-ink/45">
          Diskominfo Provinsi Jawa Barat · Single Sign-On Ready
        </div>
      </div>
    </div>
  );
}
