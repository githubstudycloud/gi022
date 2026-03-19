import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button, Form, FormItem, Input } from '@enterprise/ui';
import { useAdminAuthStore } from '@/store/auth';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAdminAuthStore((s) => s.login);
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      login(
        { id: '1', name: 'Super Admin', email, roles: ['superadmin'] },
        'admin-token-mock',
      );
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">管理后台</h1>
        <p className="mb-6 text-sm text-gray-500">Enterprise Admin Panel</p>
        <Form onSubmit={handleSubmit} className="space-y-4">
          <FormItem label="账号" required htmlFor="admin-email">
            <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
          </FormItem>
          <FormItem label="密码" required htmlFor="admin-password">
            <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </FormItem>
          <Button type="submit" className="w-full" loading={loading}>登录</Button>
        </Form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
