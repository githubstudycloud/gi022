import React from 'react';

import { Button, Form, FormItem, Input } from '@enterprise/ui';
import { useAuthStore } from '@/store/auth';

const ProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    updateUser({ name: data.get('name') as string });
  };

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">个人资料</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <Form onSubmit={handleSubmit} className="space-y-4">
          <FormItem label="姓名" htmlFor="name">
            <Input id="name" name="name" defaultValue={user?.name} />
          </FormItem>
          <FormItem label="邮箱" htmlFor="email">
            <Input id="email" type="email" defaultValue={user?.email} disabled />
          </FormItem>
          <div className="flex justify-end">
            <Button type="submit">保存修改</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePage;
