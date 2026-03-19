import React from 'react';

import { PermissionGuard } from '@/components/PermissionGuard';

const SystemPage: React.FC = () => (
  <PermissionGuard
    permission="system:admin"
    fallback={
      <div className="flex h-64 items-center justify-center text-gray-500">
        无权限访问此页面
      </div>
    }
  >
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">系统设置</h1>
      <p className="text-gray-500">System settings module — superadmin only.</p>
    </div>
  </PermissionGuard>
);

export default SystemPage;
