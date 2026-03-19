import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../Button';
import { Modal } from './index';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <div className="p-8">
          <Button onClick={() => setOpen(true)}>Open Modal</Button>
        </div>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Modal Title"
          footer={
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p className="text-gray-600">This is the modal content area.</p>
        </Modal>
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null);
    return (
      <>
        <div className="flex flex-wrap gap-3 p-8">
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <Button key={s} onClick={() => setSize(s)}>{s.toUpperCase()}</Button>
          ))}
        </div>
        {size && (
          <Modal open title={`${size.toUpperCase()} Modal`} onClose={() => setSize(null)} size={size}>
            <p>Size: {size}</p>
          </Modal>
        )}
      </>
    );
  },
};
