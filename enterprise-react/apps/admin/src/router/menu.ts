import type { Permission } from '@/store/auth';

export interface MenuRoute {
  key: string;
  label: string;
  path: string;
  icon?: string;
  permission?: Permission;
  children?: MenuRoute[];
}

export const menuRoutes: MenuRoute[] = [
  {
    key: 'dashboard',
    label: '控制台',
    path: '/admin/dashboard',
    icon: '📊',
  },
  {
    key: 'users',
    label: '用户管理',
    path: '/admin/users',
    icon: '👥',
    permission: 'user:read',
    children: [
      { key: 'users-list', label: '用户列表', path: '/admin/users', permission: 'user:read' },
      { key: 'users-create', label: '新建用户', path: '/admin/users/create', permission: 'user:write' },
    ],
  },
  {
    key: 'content',
    label: '内容管理',
    path: '/admin/content',
    icon: '📝',
    permission: 'content:read',
  },
  {
    key: 'system',
    label: '系统设置',
    path: '/admin/system',
    icon: '⚙️',
    permission: 'system:admin',
  },
];
