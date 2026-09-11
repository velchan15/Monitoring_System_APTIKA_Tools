"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "super_admin" | "admin_opd" | "operator" | "executive";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials?: string;
  role: UserRole;
  roleLabel?: string;
  opdCode?: string;
  opdName?: string;
  avatarBg?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  switchUser: (selectedUser: UserProfile) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  isSuperAdmin: boolean;
  isAdminOpd: boolean;
  isOperator: boolean;
  isExecutive: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canEditIncidents: (targetOpdCode?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const formatUserData = (rawUser: any): UserProfile => {
    const rawRoleStr = String(rawUser.role?.name || rawUser.role?.key || rawUser.role || "operator").toLowerCase();
    
    let roleKey: UserRole = "operator";
    let label = "Operator / Viewer";

    if (rawRoleStr.includes("super") || rawRoleStr === "admin") {
      roleKey = "super_admin";
      label = "Super Admin APTIKA";
    } else if (rawRoleStr.includes("opd") || rawRoleStr.includes("admin_opd")) {
      roleKey = "admin_opd";
      label = "Admin Perangkat Daerah";
    } else if (rawRoleStr.includes("exec") || rawRoleStr.includes("eksekutif")) {
      roleKey = "executive";
      label = "Eksekutif Viewer";
    }

    return {
      ...rawUser,
      role: roleKey,
      initials: rawUser.initials || rawUser.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "US",
      roleLabel: label,
      avatarBg: rawUser.avatarBg || "bg-brand text-white",
    };
  };

  useEffect(() => {
    try {
      // Mengubah localStorage menjadi sessionStorage
      const savedUser = sessionStorage.getItem("user");
      if (savedUser) {
        setUser(formatUserData(JSON.parse(savedUser)));
      }
    } catch (e) {
      console.error("Gagal membaca session pengguna", e);
    }
  }, []);

  const switchUser = (selectedUser: UserProfile) => {
    const formatted = formatUserData(selectedUser);
    setUser(formatted);
    // Mengubah localStorage menjadi sessionStorage
    sessionStorage.setItem("user", JSON.stringify(formatted));
    setLoginModalOpen(false);
    window.location.reload();
  };

  const logout = () => {
    setUser(null);
    // Mengubah localStorage menjadi sessionStorage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.reload();
  };

  const isSuperAdmin = user?.role === "super_admin";
  const isAdminOpd = user?.role === "admin_opd";
  const isOperator = user?.role === "operator";
  const isExecutive = user?.role === "executive";

  const canManageUsers = isSuperAdmin;
  const canManageSettings = isSuperAdmin;

  const canEditIncidents = (targetOpdCode?: string) => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (isAdminOpd && targetOpdCode && user.opdCode === targetOpdCode) return true;
    if (isOperator) return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        switchUser,
        logout,
        isLoginModalOpen,
        setLoginModalOpen,
        isSuperAdmin,
        isAdminOpd,
        isOperator,
        isExecutive,
        canManageUsers,
        canManageSettings,
        canEditIncidents,
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