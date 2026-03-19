import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from '../Badge';
import { Button } from '../Button';
import { Table } from './index';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const users: User[] = [
  { id: 1, name: 'Alice Zhang', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Bob Li', email: 'bob@example.com', role: 'Editor', status: 'active' },
  { id: 3, name: 'Charlie Wang', email: 'charlie@example.com', role: 'Viewer', status: 'inactive' },
];

const meta: Meta<typeof Table<User>> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table<User>>;

export const Default: Story = {
  args: {
    data: users,
    rowKey: 'id',
    columns: [
      { key: 'name', title: 'Name', dataIndex: 'name' },
      { key: 'email', title: 'Email', dataIndex: 'email' },
      { key: 'role', title: 'Role', dataIndex: 'role' },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        render: (value) => (
          <Badge variant={value === 'active' ? 'success' : 'default'}>
            {String(value)}
          </Badge>
        ),
      },
      {
        key: 'actions',
        title: 'Actions',
        align: 'right',
        render: (_v, record) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline">Edit</Button>
            <Button size="sm" variant="danger">Delete</Button>
          </div>
        ),
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    data: [],
    empty: '暂无数据',
  },
};

export const Striped: Story = {
  args: {
    ...Default.args,
    striped: true,
  },
};
