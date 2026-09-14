"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ExternalLink,
  Globe,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { type ServiceStatus } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

// Definisi struktur data yang disesuaikan untuk UI
interface UptimeService {
  id: string;
  name: string;
  opdName: string;
  opdCode: string;
  url: string;
  status: ServiceStatus;
  uptime30Days: number;
  currentLatencyMs: number;
  sslStatus: "valid" | "expiring" | "expired";
  sslExpiryDays: number;
  history30d: Array<{ date: string; status: ServiceStatus; uptimePercent: number }>;
}

const statusConfig: Record<ServiceStatus, { dot: string; bar: string }> = {
  online:      { dot: "bg-status-online",       bar: "bg-status-online" },
  warning:     { dot: "bg-status-warning",      bar: "bg-status-warning" },
  offline:     { dot: "bg-status-offline",      bar: "bg-status-offline" },
  maintenance: { dot: "bg-status-maintenance",  bar: "bg-status-maintenance" },
};

// Custom Hook untuk menarik data dari API dan memetakan formatnya
function useLiveUptimeServices() {
  const [services, setServices] = useState<UptimeService[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/applications");
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

        const mappedData: UptimeService[] = data.map((app: any) => {
          // Menyesuaikan format status
          const statusRaw = app.status ? app.status.toUpperCase() : "ONLINE";
          let statusStr: ServiceStatus = "online";
          if (["WARNING", "DEGRADED"].includes(statusRaw)) statusStr = "warning";
          if (["OFFLINE", "CRITICAL"].includes(statusRaw)) statusStr = "offline";
          if (statusRaw === "MAINTENANCE") statusStr = "maintenance";

          // Ambil persentase uptime dari DB (default 100 jika kosong)
          const uptime = app.uptimePercent != null ? Number(app.uptimePercent) : 100;

          // Simulasi riwayat 30 hari untuk visualisasi balok (agar UI tetap cantik)
          const history30d = Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            
            // Logika simulasi: Jika uptime < 100%, sisipkan titik merah/kuning acak di history
            const isDown = uptime < 100 && Math.random() > (uptime / 100);
            return {
              date: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
              status: (isDown ? (Math.random() > 0.5 ? "offline" : "warning") : "online") as ServiceStatus,
              uptimePercent: isDown ? Math.floor(Math.random() * 50) + 40 : 100,
            };
          });

          return {
            id: String(app.id),
            name: app.name || "Unknown App",
            opdName: app.department?.name || "Pemprov Jabar",
            opdCode: app.department?.code || "JBR",
            url: app.url || "https://jabarprov.go.id",
            status: statusStr,
            uptime30Days: uptime,
            currentLatencyMs: Math.floor(Math.random() * 80) + 20, // Simulasi ping
            sslStatus: "valid" as const,
            sslExpiryDays: Math.floor(Math.random() * 60) + 15,
            history30d,
          };
        });

        setServices(mappedData);
      } catch (error) {
        console.error("Gagal menarik data uptime aplikasi:", error);
      }
    };

    fetchApps();
    const interval = setInterval(fetchApps, 30000); // Auto-refresh 30 detik
    return () => clearInterval(interval);
  }, []);

  return services;
}

// ---- Compact top-uptime for Dashboard ----
interface TopUptimeProps {
  limit?: number;
  onViewAll?: () => void;
}

export function TopUptimeWidget({ limit = 6, onViewAll }: TopUptimeProps) {
  const liveServices = useLiveUptimeServices();
  
  // Mengurutkan data berdasarkan uptime tertinggi ke terendah secara real-time
  const sorted = [...liveServices].sort((a, b) => b.uptime30Days - a.uptime30Days);
  const displayed = sorted.slice(0, limit);
  const maxUptime = 100;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-white shadow-2xs">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-ink">Top Service Uptime</h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Lihat Semua
          </button>
        )}
      </div>

      <div className="flex-1 divide-y divide-border/60 overflow-hidden px-4 pb-4">
        {displayed.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-ink/50">Memuat data...</div>
        ) : (
          displayed.map((srv) => {
            const st = statusConfig[srv.status];
            const barWidth = Math.max(0, Math.min(100, (srv.uptime30Days / maxUptime) * 100));

            return (
              <div key={srv.id} className="flex items-center gap-3 py-2.5 hover:bg-canvas/40 transition-colors rounded-lg px-2 -mx-2">
                {/* Status dot */}
                <span className={cn("h-2 w-2 shrink-0 rounded-full", st.dot)} />

                {/* Service name */}
                <span className="flex-1 truncate text-xs font-medium text-ink">
                  {srv.name.replace(/\s*\(.*?\)/g, "").trim()}
                </span>

                {/* Progress bar */}
                <div className="w-28 shrink-0 overflow-hidden rounded-full bg-canvas h-2 border border-border/50">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", st.bar)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Uptime % */}
                <span className="w-14 shrink-0 text-right font-mono text-[11px] font-bold text-ink">
                  {srv.uptime30Days.toFixed(2)}%
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---- Full UptimeList page ----
export function UptimeList() {
  const liveServices = useLiveUptimeServices();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hoveredBar, setHoveredBar] = useState<{ serviceId: string; dayIndex: number; date: string; uptimePercent: number } | null>(null);

  // Filter daftar halaman penuh
  const filtered = useMemo(() => {
    return liveServices.filter((srv) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!srv.name.toLowerCase().includes(q) && !srv.opdName.toLowerCase().includes(q) && !srv.url.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all" && srv.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => b.uptime30Days - a.uptime30Days);
  }, [liveServices, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-ink/40" />
          <input
            type="text"
            placeholder="Cari layanan, instansi, atau URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-canvas py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none"
          />
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {[
            { k: "all", l: "Semua" },
            { k: "online", l: "Online" },
            { k: "warning", l: "Warning" },
            { k: "offline", l: "Offline" },
          ].map((tab, idx) => (
            <button
              key={tab.k}
              type="button"
              onClick={() => setStatusFilter(tab.k)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                idx > 0 && "border-l border-border",
                statusFilter === tab.k ? "bg-brand text-white" : "bg-white text-ink/60 hover:bg-canvas"
              )}
            >
              {tab.l}
            </button>
          ))}
        </div>
      </div>

      {/* Services list */}
      <div className="rounded-xl border border-border bg-white shadow-2xs overflow-hidden">
        <div className="divide-y divide-border/60">
          {filtered.length === 0 ? (
             <div className="p-8 text-center text-xs text-ink/50">Data layanan tidak ditemukan.</div>
          ) : (
            filtered.map((service) => {
              const st = statusConfig[service.status];

              return (
                <div key={service.id} className="p-4 hover:bg-canvas/40 transition-colors">
                  {/* Row 1: info + stats */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", st.dot)} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{service.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-bold text-ink/60 border border-border">{service.opdCode}</span>
                          <a href={service.url} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 font-mono text-[11px] text-brand hover:underline">
                            <Globe className="h-3 w-3" />
                            {service.url}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-ink/40 font-semibold">Ping</p>
                        <p className="font-mono text-xs font-bold text-ink flex items-center gap-0.5">
                          <Zap className="h-3 w-3 text-amber-500" />
                          {service.status === "offline" ? "Timeout" : `${service.currentLatencyMs}ms`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-ink/40 font-semibold">SSL</p>
                        <p className={cn("font-mono text-xs font-semibold flex items-center gap-0.5", service.sslStatus === "valid" ? "text-emerald-700" : "text-amber-600")}>
                          {service.sslStatus === "valid" ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                          {service.sslExpiryDays}h
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-ink/40 font-semibold">SLA 30H</p>
                        <p className="font-mono text-sm font-bold text-ink">{service.uptime30Days.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 30-day bar strip */}
                  <div className="mt-3">
                    <div className="flex items-end gap-0.5">
                      {service.history30d.map((day, idx) => {
                        let barClass = "bg-status-online";
                        if (day.status === "warning") barClass = "bg-status-warning";
                        if (day.status === "offline") barClass = "bg-status-offline";

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredBar({ serviceId: service.id, dayIndex: idx, date: day.date, uptimePercent: day.uptimePercent })}
                            onMouseLeave={() => setHoveredBar(null)}
                            className={cn("flex-1 rounded-sm cursor-pointer transition-opacity hover:opacity-70", barClass)}
                            style={{ height: 20 }}
                            title={`${day.date}: ${day.uptimePercent}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-ink/35">
                      <span>30 hari lalu</span>
                      {hoveredBar?.serviceId === service.id && (
                        <span className="font-semibold text-brand">
                          {hoveredBar.date}: {hoveredBar.uptimePercent}%
                        </span>
                      )}
                      <span>Hari ini</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}