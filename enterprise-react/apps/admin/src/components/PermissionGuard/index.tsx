import React from 'react';

import { type Permission } from '@/store/auth';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGuardProps {
  permission?: Permission;
  anyOf?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 权限守卫组件
 * @example
 * <PermissionGuard permission="user:write">
 *   <DeleteButton />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  anyOf,
  children,
  fallback = null,
}) => {
  const { can, canAny } = usePermission();

  const allowed =
    (permission ? can(permission) : true) &&
    (anyOf ? canAny(anyOf) : true);

  return allowed ? <>{children}</> : <>{fallback}</>;
};
