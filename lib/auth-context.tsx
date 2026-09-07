"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "super_admin" | "admin_opd" | "operator";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  roleLabel: string;
  opdCode?: string;
  opdName?: string;
  avatarBg: string;
}

export const PRESET_ACCOUNTS: UserProfile[] = [
  {
    id: "user-superadmin",
    name: "Super Admin APTIKA",
    email: "admin.aptika@jabarprov.go.id",
    initials: "SA",
    role: "super_admin",
    roleLabel: "Super Admin (Diskominfo APTIKA)",
    avatarBg: "bg-brand text-white",
  },
  {
    id: "user-opd-disdukcapil",
    name: "Sri Rahayu (Admin Disdukcapil)",
    email: "sri.rahayu@disdukcapil.jabarprov.go.id",
    initials: "SR",
    role: "admin_opd",
    roleLabel: "Admin Perangkat Daerah",
    opdCode: "DISDUKCAPIL",
    opdName: "Dinas Kependudukan dan Pencatatan Sipil",
    avatarBg: "bg-amber-600 text-white",
  },
  {
    id: "user-opd-dinkes",
    name: "dr. Ahmad Fauzi (Admin Dinkes)",
    email: "ahmad.fauzi@dinkes.jabarprov.go.id",
    initials: "AF",
    role: "admin_opd",
    roleLabel: "Admin Perangkat Daerah",
    opdCode: "DINKES",
    opdName: "Dinas Kesehatan",
    avatarBg: "bg-emerald-600 text-white",
  },
  {
    id: "user-operator",
    name: "Operator Monitoring Command Center",
    email: "operator.cc@jabarprov.go.id",
    initials: "OP",
    role: "operator",
    roleLabel: "Operator / Viewer",
    avatarBg: "bg-indigo-600 text-white",
  },
];

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  loginAsPreset: (presetId: string) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  canManageIncidents: (opdCode?: string) => boolean;
  canManageServices: (opdCode?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "aptika_monitoring_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(PRESET_ACCOUNTS[0]);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // fallback to default
    }
  }, []);

  const loginAsPreset = (presetId: string) => {
    const found = PRESET_ACCOUNTS.find((p) => p.id === presetId) || PRESET_ACCOUNTS[0];
    setUser(found);
    setLoginModalOpen(false);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
    } catch {
      // ignore
    }
  };

  const login = (email: string, role: UserRole = "operator") => {
    const matched = PRESET_ACCOUNTS.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
      } catch {
        // ignore
      }
      setLoginModalOpen(false);
      return true;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0].toUpperCase(),
      email,
      initials: email.slice(0, 2).toUpperCase(),
      role,
      roleLabel:
        role === "super_admin"
          ? "Super Admin APTIKA"
          : role === "admin_opd"
          ? "Admin Perangkat Daerah"
          : "Operator JDS",
      avatarBg: "bg-brand text-white",
    };

    setUser(newUser);
    setLoginModalOpen(false);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const canManageIncidents = (opdCode?: string) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    if (user.role === "admin_opd" && (!opdCode || user.opdCode === opdCode)) return true;
    return false;
  };

  const canManageServices = (opdCode?: string) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    if (user.role === "admin_opd" && (!opdCode || user.opdCode === opdCode)) return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginAsPreset,
        logout,
        isLoginModalOpen,
        setLoginModalOpen,
        canManageIncidents,
        canManageServices,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
