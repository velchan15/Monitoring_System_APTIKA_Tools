import { UserAccount, RoleDefinition } from "@/lib/types/user";

export const mockUsers: UserAccount[] = [
  {
    id: "user-superadmin", name: "Super Admin APTIKA", email: "admin.aptika@jabarprov.go.id",
    username: "superadmin.aptika", role: "super_admin", roleLabel: "Super Admin",
    isActive: true, lastLoginAt: "29 Agu 2026, 08:30 WIB", createdAt: "01 Jan 2025",
    avatarBg: "bg-brand text-white",
  },
  {
    id: "user-opd-disdukcapil", name: "Sri Rahayu", email: "sri.rahayu@disdukcapil.jabarprov.go.id",
    username: "sri.rahayu", role: "admin_opd", roleLabel: "Admin OPD",
    opdCode: "DISDUKCAPIL", opdName: "Dinas Kependudukan dan Pencatatan Sipil",
    isActive: true, lastLoginAt: "29 Agu 2026, 07:10 WIB", createdAt: "15 Mar 2025",
    avatarBg: "bg-amber-600 text-white",
  },
  {
    id: "user-opd-dinkes", name: "dr. Ahmad Fauzi", email: "ahmad.fauzi@dinkes.jabarprov.go.id",
    username: "ahmad.fauzi", role: "admin_opd", roleLabel: "Admin OPD",
    opdCode: "DINKES", opdName: "Dinas Kesehatan",
    isActive: true, lastLoginAt: "28 Agu 2026, 16:45 WIB", createdAt: "20 Feb 2025",
    avatarBg: "bg-emerald-600 text-white",
  },
  {
    id: "user-opd-bapenda", name: "Taufik Hidayat", email: "taufik@bapenda.jabarprov.go.id",
    username: "taufik.hidayat", role: "admin_opd", roleLabel: "Admin OPD",
    opdCode: "BAPENDA", opdName: "Badan Pendapatan Daerah",
    isActive: true, lastLoginAt: "27 Agu 2026, 09:00 WIB", createdAt: "10 Apr 2025",
    avatarBg: "bg-indigo-600 text-white",
  },
  {
    id: "user-operator-01", name: "Ridwan Maulana", email: "ridwan.maulana@jabarprov.go.id",
    username: "ridwan.maulana", role: "operator", roleLabel: "Operator",
    isActive: true, lastLoginAt: "29 Agu 2026, 08:00 WIB", createdAt: "01 Jun 2025",
    avatarBg: "bg-teal-600 text-white",
  },
  {
    id: "user-operator-02", name: "Fitri Ramdani", email: "fitri.ramdani@jabarprov.go.id",
    username: "fitri.ramdani", role: "operator", roleLabel: "Operator",
    isActive: false, lastLoginAt: "20 Jul 2026, 14:30 WIB", createdAt: "15 Jul 2025",
    avatarBg: "bg-rose-600 text-white",
  },
  {
    id: "user-exec-01", name: "Kab. Dinas Kominfo", email: "kabid@diskominfo.jabarprov.go.id",
    username: "kabid.kominfo", role: "executive", roleLabel: "Eksekutif",
    opdCode: "DISKOMINFO", opdName: "Dinas Komunikasi dan Informatika",
    isActive: true, lastLoginAt: "28 Agu 2026, 11:00 WIB", createdAt: "01 Jan 2025",
    avatarBg: "bg-purple-600 text-white",
  },
];

export const mockRoles: RoleDefinition[] = [
  {
    key: "super_admin", name: "Super Admin",
    description: "Administrator penuh sistem APTIKA Monitoring — akses ke semua OPD, semua fitur, manajemen user, dan konfigurasi sistem.",
    scopeDescription: "Lintas semua Perangkat Daerah",
    userCount: 1,
    permissions: ["Baca semua data", "Kelola semua insiden", "Kelola user & role", "Konfigurasi integrasi", "Export laporan", "Audit trail"],
  },
  {
    key: "admin_opd", name: "Admin Perangkat Daerah (OPD)",
    description: "Administrator tingkat OPD — akses monitoring, insiden, dan laporan khusus untuk instansi yang bersangkutan.",
    scopeDescription: "Scoped per OPD yang ditugaskan",
    userCount: 4,
    permissions: ["Baca data OPD sendiri", "Kelola insiden OPD sendiri", "Export laporan OPD", "Lihat audit trail OPD"],
  },
  {
    key: "operator", name: "Operator / Viewer",
    description: "Operator monitoring — dapat melihat semua dashboard dan data, namun tidak dapat mengubah konfigurasi atau mengelola insiden.",
    scopeDescription: "Read-only lintas semua OPD",
    userCount: 2,
    permissions: ["Baca semua data (read-only)", "Lihat dashboard", "Lihat insiden (view only)"],
  },
  {
    key: "executive", name: "Eksekutif (Executive Viewer)",
    description: "Pimpinan instansi — akses dashboard ringkasan dan laporan eksekutif. Tidak dapat mengubah data operasional.",
    scopeDescription: "Dashboard ringkasan & laporan",
    userCount: 1,
    permissions: ["Lihat dashboard ringkasan", "Unduh laporan eksekutif"],
  },
];

/**
 * Fetch user accounts.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/users`
 * Query params: ?role=...&opdCode=...&isActive=...&searchQuery=...
 */
export async function getUsers(params?: {
  searchQuery?: string;
  role?: string;
  isActive?: boolean;
}): Promise<UserAccount[]> {
  await new Promise((r) => setTimeout(r, 70));
  let result = [...mockUsers];
  if (params?.role && params.role !== "all") {
    result = result.filter((u) => u.role === params.role);
  }
  if (params?.isActive !== undefined) {
    result = result.filter((u) => u.isActive === params.isActive);
  }
  if (params?.searchQuery?.trim()) {
    const q = params.searchQuery.toLowerCase();
    result = result.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) ||
             (u.opdName?.toLowerCase().includes(q) ?? false)
    );
  }
  return result;
}

/**
 * Fetch role definitions.
 *
 * // TODO(backend): replace this function body with a fetch to `/api/roles`
 */
export async function getRoles(): Promise<RoleDefinition[]> {
  await new Promise((r) => setTimeout(r, 50));
  return mockRoles;
}

/**
 * Create or update a user account.
 *
 * // TODO(backend): replace with POST/PATCH to `/api/users`
 * Payload: Partial<UserAccount>
 */
export async function saveUser(user: Partial<UserAccount>): Promise<{ success: boolean; userId: string }> {
  await new Promise((r) => setTimeout(r, 800));
  if (user.id) {
    const idx = mockUsers.findIndex((u) => u.id === user.id);
    if (idx >= 0) mockUsers[idx] = { ...mockUsers[idx], ...user };
  } else {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: user.name || "",
      email: user.email || "",
      username: user.username || (user.email?.split("@")[0] ?? ""),
      role: user.role || "operator",
      roleLabel: user.roleLabel || "Operator",
      opdCode: user.opdCode,
      opdName: user.opdName,
      isActive: user.isActive ?? true,
      lastLoginAt: "-",
      createdAt: new Date().toLocaleDateString("id-ID"),
    };
    mockUsers.push(newUser);
    return { success: true, userId: newUser.id };
  }
  return { success: true, userId: user.id! };
}
