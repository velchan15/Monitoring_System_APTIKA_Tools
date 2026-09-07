"use client";

import { useState, useMemo } from "react";
import {
  Users, Search, Plus, Edit2, UserX, UserCheck, Shield,
  ChevronDown, X, Loader2, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockUsers, mockRoles, saveUser } from "@/lib/data/users";
import type { UserAccount, RoleDefinition } from "@/lib/types/user";
import { EmptyState } from "@/components/ui/EmptyState";
import { initialOpdSummaries } from "@/lib/dashboard-data";

type ActiveTab = "pengguna" | "role";

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  admin_opd: "bg-brand-soft text-brand border-brand/30",
  operator: "bg-slate-100 text-slate-600 border-slate-200",
  executive: "bg-amber-100 text-amber-700 border-amber-200",
};

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  username: string;
  role: string;
  roleLabel: string;
  opdCode: string;
  opdName: string;
  isActive: boolean;
}

const INITIAL_FORM: UserFormData = {
  name: "", email: "", username: "", role: "operator", roleLabel: "Operator",
  opdCode: "", opdName: "", isActive: true,
};

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin_opd", label: "Admin Perangkat Daerah (OPD)" },
  { value: "operator", label: "Operator / Viewer" },
  { value: "executive", label: "Eksekutif (Executive Viewer)" },
];

interface UserFormModalProps {
  editingUser: UserAccount | null;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
}

function UserFormModal({ editingUser, onClose, onSave }: UserFormModalProps) {
  const [form, setForm] = useState<UserFormData>(
    editingUser ? {
      id: editingUser.id,
      name: editingUser.name,
      email: editingUser.email,
      username: editingUser.username,
      role: editingUser.role,
      roleLabel: editingUser.roleLabel,
      opdCode: editingUser.opdCode || "",
      opdName: editingUser.opdName || "",
      isActive: editingUser.isActive,
    } : INITIAL_FORM
  );
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email tidak valid";
    if (!form.username.trim()) e.username = "Username wajib diisi";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSaving(true);
    try { await onSave(form); onClose(); }
    finally { setIsSaving(false); }
  };

  const setField = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-canvas/60">
          <h3 className="text-sm font-bold text-ink">{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
          <button type="button" onClick={onClose} className="p-1.5 text-ink/40 hover:text-ink hover:bg-border/60 rounded-lg transition" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Name */}
          <div>
            <label className="block font-bold text-ink/60 uppercase tracking-wider text-[10px] mb-1.5">Nama Lengkap *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Mis. Dr. Hendra Wijaya, S.Kom., M.T."
              className={cn("w-full rounded-lg border px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand", errors.name ? "border-red-400" : "border-border")}
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-bold text-ink/60 uppercase tracking-wider text-[10px] mb-1.5">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="nama@jabarprov.go.id"
              className={cn("w-full rounded-lg border px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand", errors.email ? "border-red-400" : "border-border")}
            />
            {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="block font-bold text-ink/60 uppercase tracking-wider text-[10px] mb-1.5">Username *</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
              placeholder="nama.lengkap"
              className={cn("w-full rounded-lg border px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand", errors.username ? "border-red-400" : "border-border")}
            />
            {errors.username && <p className="text-red-500 text-[10px] mt-1">{errors.username}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block font-bold text-ink/60 uppercase tracking-wider text-[10px] mb-1.5">Role / Hak Akses</label>
            <div className="relative">
              <select
                value={form.role}
                onChange={(e) => {
                  const opt = ROLE_OPTIONS.find((o) => o.value === e.target.value);
                  setField("role", e.target.value);
                  setField("roleLabel", opt?.label || "");
                }}
                className="w-full appearance-none rounded-lg border border-border px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
              >
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-ink/40 pointer-events-none" />
            </div>
          </div>

          {/* OPD (only for admin_opd/executive) */}
          {(form.role === "admin_opd" || form.role === "executive") && (
            <div>
              <label className="block font-bold text-ink/60 uppercase tracking-wider text-[10px] mb-1.5">Perangkat Daerah (OPD)</label>
              <div className="relative">
                <select
                  value={form.opdCode}
                  onChange={(e) => {
                    const opd = initialOpdSummaries.find((o) => o.code === e.target.value);
                    setField("opdCode", e.target.value);
                    setField("opdName", opd?.name || "");
                  }}
                  className="w-full appearance-none rounded-lg border border-border px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  <option value="">-- Pilih OPD --</option>
                  {initialOpdSummaries.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-ink/40 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="font-bold text-ink/60 uppercase tracking-wider text-[10px]">Status Pengguna</label>
            <button
              type="button"
              onClick={() => setField("isActive", !form.isActive)}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors", form.isActive ? "bg-emerald-100 border-emerald-200 text-emerald-800" : "bg-slate-100 border-slate-200 text-slate-600")}
            >
              {form.isActive ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
              {form.isActive ? "Aktif" : "Nonaktif"}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-ink hover:bg-canvas">Batal</button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {isSaving ? "Menyimpan..." : "Simpan Pengguna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleCard({ role }: { role: RoleDefinition }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-ink">{role.name}</h4>
          <p className="text-[11px] text-ink/50 mt-0.5">{role.scopeDescription}</p>
        </div>
        <span className="text-[11px] font-mono bg-canvas border border-border rounded-full px-2 py-0.5 text-ink/60 whitespace-nowrap">
          {role.userCount} pengguna
        </span>
      </div>
      <p className="text-xs text-ink/65 leading-relaxed">{role.description}</p>
      <div>
        <p className="text-[10px] font-bold text-ink/45 uppercase tracking-wider mb-1.5">Hak Akses:</p>
        <div className="flex flex-wrap gap-1">
          {role.permissions.map((p) => (
            <span key={p} className="text-[10px] bg-brand-soft text-brand rounded-full px-2 py-0.5 font-semibold">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UserRoleView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("pengguna");
  const [users, setUsers] = useState<UserAccount[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formModal, setFormModal] = useState<{ open: boolean; user: UserAccount | null }>({ open: false, user: null });

  const filtered = useMemo(() => {
    let result = users;
    if (roleFilter !== "all") result = result.filter((u) => u.role === roleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.opdName?.toLowerCase().includes(q) ?? false));
    }
    return result;
  }, [users, roleFilter, searchQuery]);

  const handleSave = async (data: UserFormData) => {
    await saveUser({ ...data, role: data.role as import("@/lib/types/user").UserRoleKey });
    setUsers([...mockUsers]);
  };

  const handleToggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const TABS = [
    { k: "pengguna" as ActiveTab, l: "Daftar Pengguna", count: users.length },
    { k: "role" as ActiveTab, l: "Manajemen Role" },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex rounded-lg border border-border bg-canvas p-0.5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.k}
            type="button"
            onClick={() => setActiveTab(tab.k)}
            className={cn("rounded-md px-4 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5", activeTab === tab.k ? "bg-white text-brand shadow-sm" : "text-ink/50 hover:text-ink")}
          >
            {tab.l}
            {tab.count !== undefined && (
              <span className={cn("text-[10px] font-mono rounded-full px-1.5 py-0.5", activeTab === tab.k ? "bg-brand-soft text-brand" : "bg-border text-ink/60")}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* PENGGUNA TAB */}
      {activeTab === "pengguna" && (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/40" />
              <input
                type="text"
                placeholder="Cari nama, email, OPD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-canvas/40 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 focus:border-brand focus:bg-white focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-border bg-canvas/40 py-1.5 px-3 text-xs text-ink focus:border-brand focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Role</option>
                {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setFormModal({ open: true, user: null })}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand/90 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Pengguna
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState className="m-4" title="Tidak ada pengguna ditemukan" icon={Users} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-border bg-canvas/60">
                    {["Pengguna", "Role", "OPD / Lingkup", "Login Terakhir", "Status", "Aksi"].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-ink/50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg font-mono text-[11px] font-bold shrink-0", user.avatarBg || "bg-brand text-white")}>
                            {user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-ink">{user.name}</p>
                            <p className="font-mono text-[10px] text-ink/45">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", ROLE_BADGE[user.role] || "bg-slate-100 text-slate-600 border-slate-200")}>
                          {user.roleLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/60">{user.opdCode ? `${user.opdCode} — ${user.opdName}` : "Lintas OPD"}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-ink/55">{user.lastLoginAt}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", user.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => setFormModal({ open: true, user })} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-ink/70 hover:bg-canvas">
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user.id)}
                            className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold", user.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50")}
                          >
                            {user.isActive ? <><UserX className="h-3 w-3" />Nonaktifkan</> : <><UserCheck className="h-3 w-3" />Aktifkan</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-border px-4 py-2.5 text-[11px] text-ink/45">
            Menampilkan {filtered.length} dari {users.length} pengguna terdaftar
          </div>
        </div>
      )}

      {/* ROLE TAB */}
      {activeTab === "role" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockRoles.map((role) => (
            <RoleCard key={role.key} role={role} />
          ))}
        </div>
      )}

      {formModal.open && (
        <UserFormModal
          editingUser={formModal.user}
          onClose={() => setFormModal({ open: false, user: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
