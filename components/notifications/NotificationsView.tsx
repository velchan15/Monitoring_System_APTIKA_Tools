"use client";

import { useState, useEffect } from "react";
import {
  Bell, Send, Mail, Webhook, Check, AlertTriangle, Info, CheckCircle2,
  XCircle, Users, ToggleLeft, ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockNotifications, mockChannels, mockRecipients,
  markNotificationRead, markAllNotificationsRead
} from "@/lib/data/notifications";
import type { NotificationItem, NotificationChannelConfig } from "@/lib/types/notification";

const SEVERITY_ICON: Record<string, React.ElementType> = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-status-offline",
  warning: "text-status-warning",
  info: "text-brand",
  success: "text-status-online",
};

const CHANNEL_ICON: Record<string, React.ElementType> = {
  telegram: Send,
  email: Mail,
  webhook: Webhook,
};

type ActiveTab = "inbox" | "pengaturan";

export function NotificationsView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("inbox");
  const [notifs, setNotifs] = useState<NotificationItem[]>(mockNotifications);
  const [channels, setChannels] = useState<NotificationChannelConfig[]>(mockChannels);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleChannel = (id: string) => {
    setChannels((prev) => prev.map((c) => c.id === id ? { ...c, isEnabled: !c.isEnabled } : c));
  };

  const TABS = [
    { k: "inbox" as ActiveTab, l: "Kotak Masuk", count: unreadCount },
    { k: "pengaturan" as ActiveTab, l: "Pengaturan Notifikasi" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="flex rounded-lg border border-border bg-canvas p-0.5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.k}
            type="button"
            onClick={() => setActiveTab(tab.k)}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
              activeTab === tab.k ? "bg-white text-brand shadow-sm" : "text-ink/50 hover:text-ink"
            )}
          >
            {tab.l}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-[10px] font-mono rounded-full bg-status-offline px-1.5 py-0.5 text-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* INBOX TAB */}
      {activeTab === "inbox" && (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-ink">Kotak Masuk Notifikasi</h3>
              <p className="text-xs text-ink/45">{unreadCount} notifikasi belum dibaca dari {notifs.length} total</p>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead} className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Tandai Semua Dibaca
              </button>
            )}
          </div>

          <div className="divide-y divide-border/60">
            {notifs.map((n) => {
              const SevIcon = SEVERITY_ICON[n.severity] || Info;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3.5 px-4 py-3.5 transition-colors",
                    !n.isRead ? "bg-brand-soft/10" : "hover:bg-canvas/60"
                  )}
                >
                  <SevIcon className={cn("h-4 w-4 mt-0.5 shrink-0", SEVERITY_CLASS[n.severity])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-xs font-semibold", !n.isRead ? "text-ink" : "text-ink/75")}>{n.title}</p>
                      <span className="text-[10px] text-ink/40 font-mono whitespace-nowrap flex-shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-ink/60 mt-0.5 line-clamp-2">{n.message}</p>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="mt-1.5 text-[10px] font-semibold text-brand hover:underline"
                      >
                        Tandai Dibaca
                      </button>
                    )}
                  </div>
                  {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-brand flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "pengaturan" && (
        <div className="space-y-4">
          {/* Channels */}
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-ink">Saluran Notifikasi</h3>
              <p className="text-xs text-ink/45">Konfigurasi metode pengiriman notifikasi insiden</p>
            </div>
            <div className="divide-y divide-border/60">
              {channels.map((ch) => {
                const CIcon = CHANNEL_ICON[ch.type] || Bell;
                const Toggle = ch.isEnabled ? ToggleRight : ToggleLeft;
                return (
                  <div key={ch.id} className="flex items-center justify-between gap-4 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-canvas">
                        <CIcon className="h-4 w-4 text-ink/60" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink">{ch.name}</p>
                        <p className="text-[11px] text-ink/50 font-mono">{ch.destination}</p>
                        <div className="flex gap-1 mt-0.5">
                          {ch.subscribedCategories.map((cat) => (
                            <span key={cat} className="text-[9px] rounded-full bg-brand-soft text-brand px-1.5 py-0.5 font-semibold uppercase">{cat}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn("text-[11px] font-semibold", ch.isEnabled ? "text-status-online" : "text-ink/40")}>
                        {ch.isEnabled ? "Aktif" : "Nonaktif"}
                      </span>
                      <button type="button" onClick={() => toggleChannel(ch.id)} aria-label={`Toggle ${ch.name}`}>
                        <Toggle className={cn("h-7 w-7 transition-colors", ch.isEnabled ? "text-teal-600" : "text-slate-300")} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipients */}
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Users className="h-4 w-4 text-ink/40" /> Daftar Penerima (PIC per OPD)
              </h3>
              <p className="text-xs text-ink/45">Kontak teknis yang akan menerima notifikasi eskalasi insiden</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-canvas/60">
                    {["OPD", "Nama PIC", "Email", "Telegram", "Status Alert"].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {mockRecipients.map((r) => (
                    <tr key={r.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] bg-brand-soft text-brand rounded px-1.5 py-0.5 font-semibold">{r.opdCode}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">{r.picName}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink/60">{r.email}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink/60">{r.telegramHandle || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          r.isAlertActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                          {r.isAlertActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
