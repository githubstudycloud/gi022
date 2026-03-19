import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

const LoginPage = React.lazy(() => import('@/pages/Login'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));
const UsersPage = React.lazy(() => import('@/pages/Users'));
const UserCreatePage = React.lazy(() => import('@/pages/Users/Create'));
const ContentPage = React.lazy(() => import('@/pages/Content'));
const SystemPage = React.lazy(() => import('@/pages/System'));

export const router = createBrowserRouter([
  { path: '/admin/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <AdminAuthGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'users/create', element: <UserCreatePage /> },
          { path: 'content', element: <ContentPage /> },
          { path: 'system', element: <SystemPage /> },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/admin/dashboard" replace /> },
  { path: '*', element: <Navigate to="/admin/dashboard" replace /> },
]);
