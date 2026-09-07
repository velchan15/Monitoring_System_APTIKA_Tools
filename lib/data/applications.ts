import { Application, ApplicationFilter } from "@/lib/types/application";
import { initialUptimeServices } from "@/lib/dashboard-data";

export const mockApplications: Application[] = initialUptimeServices.map((srv) => ({
  id: srv.id,
  name: srv.name,
  url: srv.url,
  opdName: srv.opdName,
  opdCode: srv.opdCode,
  status: srv.status,
  currentLatencyMs: srv.currentLatencyMs,
  uptime30Days: srv.uptime30Days,
  uptime90Days: srv.uptime90Days,
  sslStatus: srv.sslStatus,
  sslExpiryDays: srv.sslExpiryDays,
  sslIssuer: srv.sslIssuer,
  checkInterval: srv.checkInterval,
  lastChecked: srv.lastChecked,
}));

/**
 * Fetch applications list.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/applications`
 * Query contract: ?opdCode=...&status=...&searchQuery=...
 */
export async function getApplications(filter?: ApplicationFilter): Promise<Application[]> {
  await new Promise((r) => setTimeout(r, 60));

  let result = [...mockApplications];

  if (!filter) return result;

  if (filter.opdCode) {
    result = result.filter((a) => a.opdCode.toLowerCase() === filter.opdCode?.toLowerCase());
  }

  if (filter.status && filter.status !== "all") {
    result = result.filter((a) => a.status === filter.status);
  }

  if (filter.searchQuery && filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.url.toLowerCase().includes(q) ||
        a.opdName.toLowerCase().includes(q)
    );
  }

  return result;
}
