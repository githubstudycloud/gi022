import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '../../lib/cn';

const spinnerVariants = cva('animate-spin rounded-full border-2 border-current border-t-transparent', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size, label = 'Loading...', ...props }) => (
  <span
    role="status"
    aria-label={label}
    className={cn(spinnerVariants({ size }), className)}
    {...props}
  />
);

Spinner.displayName = 'Spinner';
