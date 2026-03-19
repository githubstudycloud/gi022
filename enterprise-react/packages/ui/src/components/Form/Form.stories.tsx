import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';
import { Input } from '../Input';
import { Form, FormItem } from './index';

const meta: Meta<typeof Form> = {
  title: 'Components/Form',
  component: Form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Vertical: Story = {
  render: () => (
    <Form onSubmit={(e) => e.preventDefault()} className="w-80 space-y-4">
      <FormItem label="用户名" required htmlFor="username">
        <Input id="username" placeholder="请输入用户名" required />
      </FormItem>
      <FormItem label="邮箱" required htmlFor="email" hint="用于接收系统通知">
        <Input id="email" type="email" placeholder="user@example.com" />
      </FormItem>
      <FormItem label="密码" required htmlFor="password" error="密码强度不够">
        <Input id="password" type="password" />
      </FormItem>
      <Button type="submit" className="w-full">注册</Button>
    </Form>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Form layout="horizontal" onSubmit={(e) => e.preventDefault()} className="w-96 space-y-4">
      <FormItem label="用户名" required htmlFor="h-username">
        <Input id="h-username" placeholder="请输入用户名" />
      </FormItem>
      <FormItem label="邮箱" htmlFor="h-email">
        <Input id="h-email" type="email" placeholder="user@example.com" />
      </FormItem>
      <div className="flex justify-end gap-3">
        <Button variant="outline">取消</Button>
        <Button type="submit">保存</Button>
      </div>
    </Form>
  ),
};
