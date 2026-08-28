"use client";

import { useState } from "react";

import { MonitoringHeader } from "@/components/dashboard/MonitoringHeader";
import { MonitoringSidebar } from "@/components/dashboard/MonitoringSidebar";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { StatusTrendChart } from "@/components/dashboard/StatusTrendChart";
import { dashboardCopy, dashboardStatusMetrics } from "@/lib/dashboard-data";

export default function DashboardPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-canvas">
      <MonitoringHeader onOpenSidebar={() => setSidebarOpen(true)} />
      <MonitoringSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              {dashboardCopy.greeting}
            </h1>
            <p className="mt-1 text-sm text-ink/55">{dashboardCopy.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {dashboardStatusMetrics.map((metric) => (
              <StatusCard key={metric.key} metric={metric} />
            ))}
          </div>

          <div className="mt-4">
            <StatusTrendChart />
          </div>
        </main>
      </div>
    </div>
  );
}