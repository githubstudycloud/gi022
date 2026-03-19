import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Spinner } from '@enterprise/ui';

export const RootLayout: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  </div>
);
