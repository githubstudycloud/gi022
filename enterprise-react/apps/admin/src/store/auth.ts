import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Permission =
  | 'user:read' | 'user:write' | 'user:delete'
  | 'content:read' | 'content:write' | 'content:delete'
  | 'system:admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
  permissions: Permission[];
}

// Role → Permissions mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: ['user:read', 'user:write', 'user:delete', 'content:read', 'content:write', 'content:delete', 'system:admin'],
  admin: ['user:read', 'user:write', 'content:read', 'content:write', 'content:delete'],
  editor: ['content:read', 'content:write'],
  viewer: ['content:read', 'user:read'],
};

export function getRolePermissions(roles: string[]): Permission[] {
  const all = new Set<Permission>();
  for (const role of roles) {
    for (const perm of ROLE_PERMISSIONS[role] ?? []) {
      all.add(perm);
    }
  }
  return Array.from(all);
}

interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: Omit<AdminUser, 'permissions'>, token: string) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (rawUser, token) => {
        const permissions = getRolePermissions(rawUser.roles);
        const user: AdminUser = { ...rawUser, permissions };
        set({ user, token, isAuthenticated: true });
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      hasPermission: (permission) => {
        return get().user?.permissions.includes(permission) ?? false;
      },

      hasAnyPermission: (permissions) => {
        const userPerms = get().user?.permissions ?? [];
        return permissions.some((p) => userPerms.includes(p));
      },
    }),
    { name: 'enterprise-admin-auth', partialize: (s) => ({ user: s.user, token: s.token }) },
  ),
);
