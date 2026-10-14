"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle2, RefreshCcw, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  severity?: "critical" | "warning" | "info" | "success";
  isRead: boolean;
  timestamp?: string;
  targetUrl?: string;
}

const SEVERITY_DOT = {
  critical: "bg-status-offline",
  warning: "bg-status-warning",
  success: "bg-status-online",
  info: "bg-brand",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UX State: Membatasi jumlah yang dirender di awal agar tidak lag
  const [visibleCount, setVisibleCount] = useState(15); 

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
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
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Gagal menandai dibaca:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n?.isRead).length;
  
  // Potong array notifikasi sesuai jumlah yang ingin ditampilkan
  const visibleNotifications = notifications.slice(0, visibleCount);

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
            onClick={() => {
              setVisibleCount(15); // Reset kembali ke 15 saat di-refresh
              fetchNotifications();
            }}
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
        <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
          
          {/* Container Scroll Internal (Max Height 600px) */}
          <div className="divide-y divide-border/60 max-h-[600px] overflow-y-auto">
            {visibleNotifications.map((n) => {
              const safeSeverity = n?.severity && SEVERITY_DOT[n.severity] ? n.severity : "info";
              
              // 1. Ambil judul dasar
              let displayTitle = (!n?.title || n.title === "undefined" || n.title === "null") ? "Peringatan Sistem" : n.title;

              // 2. Ekstrak nama aplikasi dari kalimat pesan jika judulnya masih "Peringatan Sistem"
              if (displayTitle === "Peringatan Sistem" && n?.message?.includes("terdeteksi DOWN")) {
                 displayTitle = n.message
                   .replace("Peringatan: Aplikasi ", "") 
                   .replace(" terdeteksi DOWN.", "");    
              }

              return (
                <div
                  key={n?.id || Math.random().toString()}
                  className={cn(
                    "p-4 flex items-start justify-between gap-4 transition-colors",
                    !n?.isRead ? "bg-brand-soft/20" : "hover:bg-canvas/40"
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", SEVERITY_DOT[safeSeverity])} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Judul Notifikasi */}
                        <p className="text-xs font-bold text-ink">{displayTitle}</p>
                        
                        {!n?.isRead && (
                          <span className="bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Baru</span>
                        )}
                      </div>
                      
                      <p className="text-xs text-ink/75 leading-relaxed">{n?.message || "Tidak ada detail pesan."}</p>
                      <p className="text-[10px] text-ink/40 font-mono">{n?.timestamp || "Waktu tidak diketahui"}</p>
                    </div>
                  </div>

                  {!n?.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(n?.id)}
                      className="shrink-0 text-[11px] font-semibold text-brand hover:underline whitespace-nowrap pt-1"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* UX: Tombol Tampilkan Lebih Banyak */}
          {visibleCount < notifications.length && (
            <div className="p-3 border-t border-border bg-canvas/30 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 15)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark hover:underline transition"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                Tampilkan lebih banyak ({notifications.length - visibleCount} tersisa)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}