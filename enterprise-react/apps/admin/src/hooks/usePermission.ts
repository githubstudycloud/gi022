import { useAdminAuthStore, type Permission } from '@/store/auth';

/**
 * RBAC 权限 Hook
 * @example
 * const { can, canAny } = usePermission()
 * if (can('user:write')) { ... }
 */
export function usePermission() {
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const hasAnyPermission = useAdminAuthStore((s) => s.hasAnyPermission);

  return {
    can: (permission: Permission) => hasPermission(permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(permissions),
  };
}
