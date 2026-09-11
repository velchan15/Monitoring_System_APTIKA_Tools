"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
  isRead: boolean;
  timestamp: string;
  targetUrl?: string;
}

const SEVERITY_DOT = {
  critical: "bg-status-offline",
  warning: "bg-status-warning",
  success: "bg-status-online",
  info: "bg-brand",
};

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Gagal menandai dibaca:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-ink">Kotak Masuk Notifikasi</h2>
          <p className="text-xs text-ink/50 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca dari ${notifications.length} total` : "Semua notifikasi telah dibaca"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAsRead("all")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-soft text-brand font-semibold rounded-lg hover:bg-brand/20 transition text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Semua Dibaca
            </button>
          )}
          <button
            type="button"
            onClick={fetchNotifications}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-canvas text-ink/70 font-semibold rounded-lg hover:bg-border transition text-xs"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Segarkan
          </button>
        </div>
      </div>

      {/* List Notifikasi */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-xl border border-border text-xs text-ink/50 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand" /> Memuat daftar notifikasi...
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState title="Tidak ada notifikasi" description="Kotak masuk Anda bersih dari pemberitahuan gangguan." icon={Bell} />
      ) : (
        <div className="bg-white rounded-xl border border-border divide-y divide-border/60 shadow-sm overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "p-4 flex items-start justify-between gap-4 transition-colors",
                !n.isRead ? "bg-brand-soft/20" : "hover:bg-canvas/40"
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", SEVERITY_DOT[n.severity] || SEVERITY_DOT.info)} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-ink">{n.title}</p>
                    {!n.isRead && (
                      <span className="bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Baru</span>
                    )}
                  </div>
                  <p className="text-xs text-ink/75 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-ink/40 font-mono">{n.timestamp}</p>
                </div>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => markAsRead(n.id)}
                  className="shrink-0 text-[11px] font-semibold text-brand hover:underline whitespace-nowrap pt-1"
                >
                  Tandai Dibaca
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}