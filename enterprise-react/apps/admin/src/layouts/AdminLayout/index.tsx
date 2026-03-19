import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button, Tooltip } from '@enterprise/ui';
import { cn } from '@enterprise/ui';
import { useAdminAuthStore } from '@/store/auth';
import { menuRoutes } from '@/router/menu';
import { usePermission } from '@/hooks/usePermission';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAdminAuthStore((s) => s.user);
  const logout = useAdminAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { can } = usePermission();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const visibleMenus = menuRoutes.filter((m) => !m.permission || can(m.permission));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-gray-900 text-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-4">
          {!collapsed && (
            <Link to="/admin/dashboard" className="text-lg font-bold text-white">
              Admin
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-gray-400 hover:text-white transition-colors ml-auto"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {visibleMenus.map((item) => (
            <Tooltip key={item.key} content={item.label} placement="right">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                  )
                }
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t border-gray-700 p-4">
          {!collapsed && (
            <p className="mb-2 truncate text-xs text-gray-400">{user?.name}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-gray-400 hover:text-white"
          >
            {collapsed ? '↩' : '退出登录'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <Breadcrumb />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ─── Breadcrumb ────────────────────────────────────────────────────────────────
const Breadcrumb: React.FC = () => {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500">
      <Link to="/admin/dashboard" className="hover:text-gray-700">首页</Link>
      <span>/</span>
      <span className="text-gray-900">当前页面</span>
    </nav>
  );
};
