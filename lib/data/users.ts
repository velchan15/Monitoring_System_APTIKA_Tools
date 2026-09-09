import { UserAccount, RoleDefinition } from "@/lib/types/user";

const API_BASE = "http://localhost:3001/api";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getUsers(params?: {
  searchQuery?: string;
  role?: string;
  isActive?: boolean;
}): Promise<UserAccount[]> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengambil data pengguna");
    let result: UserAccount[] = await res.json();

    if (params?.role && params.role !== "all") {
      result = result.filter((u) => u.role === params.role);
    }
    if (params?.isActive !== undefined) {
      result = result.filter((u) => u.isActive === params.isActive);
    }
    if (params?.searchQuery?.trim()) {
      const q = params.searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.opdName?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getRoles(): Promise<RoleDefinition[]> {
  try {
    const res = await fetch(`${API_BASE}/roles`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengambil data role");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function saveUser(user: Partial<UserAccount>): Promise<{ success: boolean; userId: string }> {
  try {
    const method = user.id ? "PATCH" : "POST";
    const url = user.id ? `${API_BASE}/users/${user.id}` : `${API_BASE}/users`;

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menyimpan pengguna");

    return { success: true, userId: data.id || user.id! };
  } catch (err) {
    console.error(err);
    return { success: false, userId: "" };
  }
}