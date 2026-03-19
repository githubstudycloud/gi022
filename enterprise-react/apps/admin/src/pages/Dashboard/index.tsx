import React from 'react';

import { Badge, Table, type TableColumn } from '@enterprise/ui';
import { formatDate } from '@enterprise/utils';
import { PermissionGuard } from '@/components/PermissionGuard';

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  time: string;
  status: 'success' | 'warning' | 'danger';
}

const activities: RecentActivity[] = [
  { id: 1, action: '用户登录', user: 'Alice', time: new Date().toISOString(), status: 'success' },
  { id: 2, action: '内容发布', user: 'Bob', time: new Date(Date.now() - 3600000).toISOString(), status: 'success' },
  { id: 3, action: '权限变更', user: 'Admin', time: new Date(Date.now() - 7200000).toISOString(), status: 'warning' },
];

const columns: TableColumn<RecentActivity>[] = [
  { key: 'action', title: '操作', dataIndex: 'action' },
  { key: 'user', title: '用户', dataIndex: 'user' },
  {
    key: 'time',
    title: '时间',
    dataIndex: 'time',
    render: (v) => formatDate(v as string, 'MM-DD HH:mm'),
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    render: (v) => <Badge variant={v as 'success' | 'warning' | 'danger'}>{String(v)}</Badge>,
  },
];

const DashboardPage: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">控制台</h1>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[
        { label: '总用户', value: '1,248', perm: null },
        { label: '今日活跃', value: '342', perm: null },
        { label: '内容数', value: '5,829', perm: 'content:read' as const },
        { label: '系统告警', value: '2', perm: 'system:admin' as const },
      ].map((item) =>
        item.perm ? (
          <PermissionGuard key={item.label} permission={item.perm}>
            <StatCard label={item.label} value={item.value} />
          </PermissionGuard>
        ) : (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ),
      )}
    </div>

    {/* Recent activity */}
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 text-base font-semibold text-gray-900">最近操作</h2>
      <Table data={activities} columns={columns} rowKey="id" size="sm" />
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default DashboardPage;
