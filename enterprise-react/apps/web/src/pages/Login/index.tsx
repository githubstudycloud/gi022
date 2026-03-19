import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button, Form, FormItem, Input } from '@enterprise/ui';
import { isEmail } from '@enterprise/utils';
import { useAuthStore } from '@/store/auth';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<LoginForm> = {};
    if (!form.email) newErrors.email = '邮箱不能为空';
    else if (!isEmail(form.email)) newErrors.email = '邮箱格式不正确';
    if (!form.password) newErrors.password = '密码不能为空';
    else if (form.password.length < 6) newErrors.password = '密码不能少于6位';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Simulate API call — replace with real auth
      await new Promise((r) => setTimeout(r, 800));
      login(
        { id: '1', name: 'Admin User', email: form.email, roles: ['admin'] },
        'mock-token-xyz',
      );
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">登录</h1>
        <Form onSubmit={handleSubmit} className="space-y-4">
          <FormItem label="邮箱" required htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
          </FormItem>
          <FormItem label="密码" required htmlFor="password" error={errors.password}>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
            />
          </FormItem>
          <Button type="submit" className="w-full" loading={loading}>
            登录
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
