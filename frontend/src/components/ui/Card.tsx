import React from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
}) => (
  <div className={cn(
    'bg-white rounded-2xl border border-slate-100 shadow-card',
    paddingClasses[padding],
    hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer',
    className,
  )}>
    {children}
  </div>
);

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, action }) => (
  <div className={cn('flex items-center justify-between mb-4', className)}>
    <div className="flex items-center gap-2">{children}</div>
    {action && <div>{action}</div>}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn('text-base font-bold text-slate-800', className)}>{children}</h3>
);

export const CardDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('border-t border-slate-100 my-4', className)} />
);

export default Card;
