import React, { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Spinner } from '@enterprise/ui';
import { useAuthStore } from '@/store/auth';

export const AuthGuard: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
};
