export type StatusKey = "total" | "online" | "warning" | "offline" | "maintenance";

export interface StatusMetric {
  key: StatusKey;
  label: string;
  value: number;
  subLabel: string;
}

// Mock data tahap 1 — nanti akan digantikan oleh data dari API monitoring.
export const dashboardStatusMetrics: StatusMetric[] = [
  {
    key: "total",
    label: "Total Aplikasi",
    value: 215,
    subLabel: "Semua aplikasi terdaftar",
  },
  {
    key: "online",
    label: "Online",
    value: 209,
    subLabel: "97.21% dari total aplikasi",
  },
  {
    key: "warning",
    label: "Warning",
    value: 4,
    subLabel: "Perlu perhatian",
  },
  {
    key: "offline",
    label: "Offline",
    value: 2,
    subLabel: "0.93% dari total aplikasi",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    value: 0,
    subLabel: "Tidak ada maintenance",
  },
];

export interface HeaderMeta {
  dateTimeLabel: string;
  autoRefreshLabel: string;
  notificationCount: number;
  operatorName: string;
  operatorEmail: string;
  operatorInitials: string;
}

export const headerMeta: HeaderMeta = {
  dateTimeLabel: "Jumat, 28 Agustus 2026 · 09:41 WIB",
  autoRefreshLabel: "Auto Refresh 60s",
  notificationCount: 3,
  operatorName: "Operator Diskominfo",
  operatorEmail: "operator@diskominfo.jabarprov.go.id",
  operatorInitials: "OD",
};

// Teks sambutan di atas kartu status — statis untuk tahap 1.
export const dashboardCopy = {
  greeting: `Selamat datang, ${headerMeta.operatorName} 👋`,
  subtitle:
    "Berikut ringkasan kondisi aplikasi di lingkungan Pemerintah Provinsi Jawa Barat.",
};

export interface TrendPoint {
  label: string;
  online: number;
  warning: number;
  offline: number;
}

export type TrendRange = "harian" | "mingguan" | "bulanan";

export const trendRangeLabels: Record<TrendRange, string> = {
  harian: "Harian",
  mingguan: "Mingguan",
  bulanan: "Bulanan",
};

// Mock data grafik tren — nanti diganti hasil agregasi check_results_hourly
// dari backend (lihat rancangan bagian 8 & 9).
export const statusTrendData: Record<TrendRange, TrendPoint[]> = {
  harian: [
    { label: "22 Agu", online: 206, warning: 6, offline: 3 },
    { label: "23 Agu", online: 207, warning: 5, offline: 3 },
    { label: "24 Agu", online: 205, warning: 7, offline: 3 },
    { label: "25 Agu", online: 208, warning: 4, offline: 3 },
    { label: "26 Agu", online: 210, warning: 3, offline: 2 },
    { label: "27 Agu", online: 208, warning: 5, offline: 2 },
    { label: "28 Agu", online: 209, warning: 4, offline: 2 },
  ],
  mingguan: [
    { label: "Mgg 1", online: 201, warning: 9, offline: 5 },
    { label: "Mgg 2", online: 203, warning: 8, offline: 4 },
    { label: "Mgg 3", online: 205, warning: 7, offline: 3 },
    { label: "Mgg 4", online: 204, warning: 6, offline: 5 },
    { label: "Mgg 5", online: 207, warning: 5, offline: 3 },
    { label: "Mgg 6", online: 206, warning: 6, offline: 3 },
    { label: "Mgg 7", online: 208, warning: 4, offline: 3 },
    { label: "Mgg 8", online: 209, warning: 4, offline: 2 },
  ],
  bulanan: [
    { label: "Mar", online: 188, warning: 10, offline: 6 },
    { label: "Apr", online: 192, warning: 9, offline: 5 },
    { label: "Mei", online: 197, warning: 8, offline: 5 },
    { label: "Jun", online: 201, warning: 7, offline: 4 },
    { label: "Jul", online: 205, warning: 6, offline: 4 },
    { label: "Agu", online: 209, warning: 4, offline: 2 },
  ],
};