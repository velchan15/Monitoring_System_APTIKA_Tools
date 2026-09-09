export type UserRoleKey = "super_admin" | "admin_opd" | "operator" | "executive";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRoleKey;
  roleLabel: string;
  opdCode?: string;
  opdName?: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  avatarBg?: string;
}

export interface RoleDefinition {
  key: UserRoleKey;
  name: string;
  description: string;
  scopeDescription: string;
  userCount: number;
  permissions: string[];
}
