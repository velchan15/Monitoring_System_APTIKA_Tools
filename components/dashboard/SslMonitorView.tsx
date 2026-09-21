"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function SslMonitorView() {
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "warning" | "valid">("all");

  useEffect(() => {
    fetch("http://localhost:3001/api/applications")
      .then((res) => res.json())
      .then((json) => {
        const data = json.data || json;
        
        const validSslApps = data
          .filter((app: any) => app.url && app.sslValidTo)
          .map((app: any) => {
            const validToDate = new Date(app.sslValidTo);
            const daysLeft = Math.ceil((validToDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            let status = "valid";
            if (daysLeft < 0) status = "expired";
            else if (daysLeft <= 30) status = "warning";
            
            return {
              id: app.id,
              name: app.name,
              url: app.url,
              opdName: app.department?.name || app.opdName || "Pemerintah Provinsi Jawa Barat",
              sslIssuer: app.sslIssuer || "Unknown CA",
              sslExpiryDays: daysLeft,
              sslStatus: status,
              sslProtocol: app.sslProtocol || "TLS / HTTPS"
            };
          });

        setServices(validSslApps);
      })
      .catch((err) => console.error("Gagal fetch data SSL:", err));
  }, []);

  const sslServices = useMemo(() => {
    return services.filter((srv) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          srv.name.toLowerCase().includes(q) ||
          srv.url.toLowerCase().includes(q) ||
          (srv.opdName && srv.opdName.toLowerCase().includes(q)) ||
          (srv.sslIssuer && srv.sslIssuer.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filter === "warning" && srv.sslStatus !== "warning" && srv.sslStatus !== "expired") return false;
      if (filter === "valid" && srv.sslStatus !== "valid") return false;
      return true;
    });
  }, [services, searchQuery, filter]);

  const warningCount = services.filter((s) => s.sslStatus === "warning" || s.sslStatus === "expired").length;

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-ink">
                Pemantauan Sertifikat Keamanan SSL/TLS
              </h2>
              {warningCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 animate-pulse">
                  {warningCount} Perlu Perpanjangan
                </span>
              )}
            </div>
            <p className="text-xs text-ink/45">
              Deteksi otomatis masa berlaku sertifikat HTTPS pada seluruh domain sub/domain Pemerintah Jawa Barat
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40" />
            <input
              type="text"
              placeholder="Cari domain, penerbit SSL, OPD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-canvas/40 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex rounded-lg border border-border bg-canvas p-0.5">
            {[
              { key: "all", label: "Semua Sertifikat" },
              { key: "warning", label: `Mendekati Kadaluarsa (${warningCount})` },
              { key: "valid", label: "Valid & Aman" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key as typeof filter)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  filter === tab.key
                    ? "bg-white text-brand shadow-sm"
                    : "text-ink/50 hover:text-ink"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SSL List Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-canvas/60 text-[11px] font-semibold uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3 sm:px-5">Domain & Layanan</th>
              <th className="px-4 py-3">Perangkat Daerah</th>
              {/* Tambahan whitespace-nowrap agar header tidak terlipat */}
              <th className="px-4 py-3 whitespace-nowrap">Penerbit Sertifikat (CA)</th>
              <th className="px-4 py-3 whitespace-nowrap">Sisa Masa Aktif</th>
              <th className="px-4 py-3 whitespace-nowrap">Status Enkripsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sslServices.map((srv) => {
              const isExpired = srv.sslStatus === "expired";
              const isWarning = srv.sslStatus === "warning";

              return (
                <tr key={srv.id} className="hover:bg-canvas/40 transition-colors">
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-semibold text-ink">{srv.name}</p>
                    <a
                      href={srv.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-brand hover:underline"
                    >
                      <Lock className="h-3 w-3 text-emerald-600" />
                      {srv.url}
                    </a>
                  </td>

                  <td className="px-4 py-3 font-medium text-ink/70">
                    {srv.opdName}
                  </td>

                  {/* Tambahan whitespace-nowrap pada sel CA */}
                  <td className="px-4 py-3 font-mono text-[11px] text-ink/60 whitespace-nowrap">
                    {srv.sslIssuer}
                  </td>

                  {/* Tambahan whitespace-nowrap pada sel Badge Kedaluwarsa */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 font-mono text-xs font-bold text-red-700">
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                        Kedaluwarsa {Math.abs(srv.sslExpiryDays)} Hari
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        {srv.sslExpiryDays} Hari Lagi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {srv.sslExpiryDays} Hari
                      </span>
                    )}
                  </td>

                  {/* Tambahan whitespace-nowrap pada sel Badge Protokol */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {srv.sslProtocol}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}