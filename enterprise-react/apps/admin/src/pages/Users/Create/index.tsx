import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Form, FormItem, Input } from '@enterprise/ui';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">新建用户</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <Form onSubmit={handleSubmit} className="space-y-4">
          <FormItem label="姓名" required htmlFor="c-name">
            <Input id="c-name" placeholder="请输入姓名" required />
          </FormItem>
          <FormItem label="邮箱" required htmlFor="c-email">
            <Input id="c-email" type="email" placeholder="user@example.com" required />
          </FormItem>
          <FormItem label="初始密码" required htmlFor="c-password">
            <Input id="c-password" type="password" placeholder="至少8位" required />
          </FormItem>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              取消
            </Button>
            <Button type="submit" loading={loading}>
              创建
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default UserCreatePage;
