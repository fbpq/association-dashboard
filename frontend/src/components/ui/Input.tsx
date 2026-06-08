import React from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'right' | 'left';
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  iconPosition = 'right',
  fullWidth = true,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.replace(/\s/g, '-') : undefined);
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-danger-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800',
            'placeholder:text-slate-400 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-400',
            error ? 'border-danger-400 bg-danger-50' : 'border-slate-200 hover:border-slate-300',
            icon && iconPosition === 'right' ? 'pr-10' : undefined,
            icon && iconPosition === 'left' ? 'pl-10' : undefined,
            className,
          )}
        />
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger-600 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  fullWidth = true,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.replace(/\s/g, '-') : undefined);
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        {...props}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800',
          'transition-all duration-200 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400',
          error ? 'border-danger-400' : 'border-slate-200 hover:border-slate-300',
          className,
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  );
};

export default Input;
