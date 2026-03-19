import React, { createContext, useContext } from 'react';

import { cn } from '../../lib/cn';

// ─── Form Context ──────────────────────────────────────────────────────────────
interface FormContextValue {
  layout: 'vertical' | 'horizontal' | 'inline';
  disabled: boolean;
}

const FormContext = createContext<FormContextValue>({
  layout: 'vertical',
  disabled: false,
});

// ─── Form ─────────────────────────────────────────────────────────────────────
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: 'vertical' | 'horizontal' | 'inline';
  disabled?: boolean;
}

export const Form: React.FC<FormProps> = ({
  layout = 'vertical',
  disabled = false,
  className,
  children,
  ...props
}) => (
  <FormContext.Provider value={{ layout, disabled }}>
    <form
      className={cn(layout === 'inline' && 'flex flex-wrap gap-4', className)}
      noValidate
      {...props}
    >
      {children}
    </form>
  </FormContext.Provider>
);

Form.displayName = 'Form';

// ─── FormItem ─────────────────────────────────────────────────────────────────
export interface FormItemProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const FormItem: React.FC<FormItemProps> = ({
  label,
  required,
  error,
  hint,
  children,
  className,
  htmlFor,
}) => {
  const { layout } = useContext(FormContext);

  return (
    <div
      className={cn(
        'flex',
        layout === 'horizontal'
          ? 'flex-row items-start gap-4'
          : 'flex-col gap-1',
        className,
      )}
    >
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            'text-sm font-medium text-gray-700',
            layout === 'horizontal' && 'min-w-[100px] pt-2 text-right',
          )}
        >
          {required && <span className="mr-1 text-red-500">*</span>}
          {label}
        </label>
      )}

      <div className="flex-1">
        {children}
        {error && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
      </div>
    </div>
  );
};

FormItem.displayName = 'FormItem';
