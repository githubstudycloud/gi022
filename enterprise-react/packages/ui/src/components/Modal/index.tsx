import React, { useEffect, useRef } from 'react';

import { cn } from '../../lib/cn';
import { Button } from '../Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
} as const;

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  className,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current && closable) {
      onClose();
    }
  };

  // Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape' && closable) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'w-full rounded-lg bg-white shadow-xl',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        'p-0 outline-none',
        'animate-in fade-in-0 zoom-in-95',
        sizeMap[size],
        className,
      )}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      {(title || closable) && (
        <div className="flex items-center justify-between border-b px-6 py-4">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          {closable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close modal"
              className="ml-auto h-8 w-8 text-gray-500"
            >
              ✕
            </Button>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="flex justify-end gap-3 border-t px-6 py-4">{footer}</div>
      )}
    </dialog>
  );
};

Modal.displayName = 'Modal';
