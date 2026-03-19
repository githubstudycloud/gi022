import React, { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Spinner } from '@enterprise/ui';
import { useAdminAuthStore } from '@/store/auth';

export const AdminAuthGuard: React.FC = () => {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
};
