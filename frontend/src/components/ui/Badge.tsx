import React from 'react';
import { cn } from '@/utils/helpers';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-50 text-success-700 border border-success-200',
  warning: 'bg-warning-50 text-warning-700 border border-warning-100',
  danger:  'bg-danger-50  text-danger-700  border border-danger-100',
  info:    'bg-sky-50     text-sky-700     border border-sky-200',
  primary: 'bg-primary-50 text-primary-700 border border-primary-100',
  default: 'bg-slate-100  text-slate-600   border border-slate-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
  info:    'bg-sky-500',
  primary: 'bg-primary-500',
  default: 'bg-slate-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}) => (
  <span className={cn('inline-flex items-center gap-1.5 font-medium', variantClasses[variant], sizeClasses[size], className)}>
    {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotClasses[variant])} />}
    {children}
  </span>
);

export default Badge;
