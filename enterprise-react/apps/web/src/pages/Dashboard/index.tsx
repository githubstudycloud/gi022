import React from 'react';

import { Badge } from '@enterprise/ui';
import { formatDate } from '@enterprise/utils';
import { useAuthStore } from '@/store/auth';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, <strong>{user?.name}</strong> — {formatDate(new Date())}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Users', value: '1,248', badge: 'primary' as const },
          { label: 'Active Projects', value: '32', badge: 'success' as const },
          { label: 'Pending Tasks', value: '7', badge: 'warning' as const },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{item.label}</p>
              <Badge variant={item.badge}>+12%</Badge>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
