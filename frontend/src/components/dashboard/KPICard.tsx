import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatPersianNumber } from '@/utils/helpers';

type KPIVariant = 'primary' | 'success' | 'warning' | 'danger' | 'default';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: KPIVariant;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
  loading?: boolean;
}

const variantConfig: Record<KPIVariant, { bg: string; iconBg: string; iconColor: string; valueColor: string }> = {
  primary: { bg: 'from-primary-50 to-white',  iconBg: 'bg-primary-100', iconColor: 'text-primary-700', valueColor: 'text-primary-800' },
  success: { bg: 'from-success-50 to-white',  iconBg: 'bg-success-100', iconColor: 'text-success-700', valueColor: 'text-success-800' },
  warning: { bg: 'from-warning-50 to-white',  iconBg: 'bg-warning-100', iconColor: 'text-warning-700', valueColor: 'text-warning-700' },
  danger:  { bg: 'from-danger-50  to-white',  iconBg: 'bg-danger-100',  iconColor: 'text-danger-700',  valueColor: 'text-danger-700' },
  default: { bg: 'from-slate-50   to-white',  iconBg: 'bg-slate-100',   iconColor: 'text-slate-600',   valueColor: 'text-slate-800' },
};

export const KPICard: React.FC<KPICardProps> = ({
  title, value, subtitle, icon: Icon,
  variant = 'default', trend, trendValue,
  onClick, loading = false,
}) => {
  const cfg = variantConfig[variant];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-100 shadow-card p-5',
        'bg-gradient-to-br', cfg.bg,
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200',
        'animate-fade-in',
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.iconBg)}>
          <Icon size={20} className={cfg.iconColor} />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
            trend === 'up' ? 'bg-success-50 text-success-700' : trend === 'down' ? 'bg-danger-50 text-danger-700' : 'bg-slate-100 text-slate-600',
          )}>
            {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      <div className={cn('text-3xl font-black mb-1 tabular-nums', cfg.valueColor)}>
        {typeof value === 'number' ? formatPersianNumber(value) : value}
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}

      {/* Decorative circle */}
      <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full opacity-5 bg-current" />
    </div>
  );
};

export default KPICard;
