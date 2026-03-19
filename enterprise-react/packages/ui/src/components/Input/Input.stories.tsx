import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './index';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
};

export const WithLabel: Story = {
  args: { label: 'Email Address', placeholder: 'user@example.com', type: 'email' },
};

export const Required: Story = {
  args: { label: 'Username', required: true, placeholder: 'johndoe' },
};

export const WithError: Story = {
  args: { label: 'Email', error: '请输入有效的邮箱地址', value: 'invalid', readOnly: true },
};

export const WithHint: Story = {
  args: { label: 'Password', type: 'password', hint: '至少 8 位，包含大小写字母和数字' },
};

export const Disabled: Story = {
  args: { label: 'Read Only', value: 'Cannot edit', disabled: true },
};
