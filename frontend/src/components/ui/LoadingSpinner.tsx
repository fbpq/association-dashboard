import React from 'react';
import { cn } from '@/utils/helpers';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };

export const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => (
  <div className={cn('flex flex-col items-center gap-3', className)}>
    <div className={cn('relative', sizeMap[size])}>
      <div className={cn('absolute inset-0 rounded-full border-2 border-slate-200', sizeMap[size])} />
      <div className={cn('absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 animate-spin', sizeMap[size])} />
    </div>
    {label && <p className="text-sm text-slate-500">{label}</p>}
  </div>
);

// Full-page loading overlay
export const PageLoader: React.FC<{ label?: string }> = ({ label = 'در حال بارگذاری...' }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 relative">
        <div className="absolute inset-0 rounded-full bg-primary-100" />
        <div className="absolute inset-2 rounded-full border-3 border-primary-600 border-t-transparent animate-spin" style={{ borderWidth: 3 }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-primary-600 animate-pulse-soft" />
        </div>
      </div>
      <p className="text-slate-600 font-medium">{label}</p>
      <p className="text-slate-400 text-sm mt-1">سامانه هوشمند مدیریت انجمن‌ها</p>
    </div>
  </div>
);

// Skeleton loader
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('shimmer rounded-lg', className)} />
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-2 w-full" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-3">
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-4" />)}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-3" />)}
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
