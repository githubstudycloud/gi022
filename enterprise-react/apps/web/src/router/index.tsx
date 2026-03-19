import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RootLayout } from '@/layouts/RootLayout';
import { AuthGuard } from '@/components/AuthGuard';

// Lazy-loaded pages
const HomePage = React.lazy(() => import('@/pages/Home'));
const LoginPage = React.lazy(() => import('@/pages/Login'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFound'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));
const ProfilePage = React.lazy(() => import('@/pages/Profile'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: 'home', element: <HomePage /> },
      {
        element: <AuthGuard />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
