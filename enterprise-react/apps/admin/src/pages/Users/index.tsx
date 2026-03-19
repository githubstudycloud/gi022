import React from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Table, type TableColumn } from '@enterprise/ui';
import { PermissionGuard } from '@/components/PermissionGuard';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const mockUsers: UserRow[] = [
  { id: '1', name: 'Alice Zhang', email: 'alice@example.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Bob Li', email: 'bob@example.com', role: 'editor', status: 'active' },
  { id: '3', name: 'Charlie Wang', email: 'charlie@example.com', role: 'viewer', status: 'inactive' },
];

const UsersPage: React.FC = () => {
  const columns: TableColumn<UserRow>[] = [
    { key: 'name', title: '姓名', dataIndex: 'name' },
    { key: 'email', title: '邮箱', dataIndex: 'email' },
    { key: 'role', title: '角色', dataIndex: 'role' },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (v) => (
        <Badge variant={v === 'active' ? 'success' : 'default'}>
          {v === 'active' ? '活跃' : '禁用'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      align: 'right',
      render: (_v, record) => (
        <div className="flex justify-end gap-2">
          <PermissionGuard permission="user:write">
            <Button size="sm" variant="outline">编辑</Button>
          </PermissionGuard>
          <PermissionGuard permission="user:delete">
            <Button size="sm" variant="danger">删除</Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <PermissionGuard permission="user:write">
          <Button asChild>
            <Link to="/admin/users/create">新建用户</Link>
          </Button>
        </PermissionGuard>
      </div>

      <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <Table data={mockUsers} columns={columns} rowKey="id" />
      </div>
    </div>
  );
};

export default UsersPage;
