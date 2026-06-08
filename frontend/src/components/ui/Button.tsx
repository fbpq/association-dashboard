import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'right' | 'left';
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-card-hover active:bg-primary-800',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:shadow',
  success:   'bg-success-500 hover:bg-success-600 text-white shadow-sm hover:shadow-md',
  danger:    'bg-danger-600 hover:bg-danger-700 text-white shadow-sm hover:shadow-md',
  ghost:     'bg-transparent hover:bg-primary-50 text-slate-600 hover:text-primary-700',
  outline:   'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50',
  gradient:  'text-white shadow-sm hover:shadow-card-hover',
};

const sizeClasses: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md:  'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg:  'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      disabled={isDisabled}
      style={variant === 'gradient' && !isDisabled ? { background: 'linear-gradient(90deg, #2174b8, #7fa343)' } : undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
        'select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin flex-shrink-0" />}
      {!loading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};

export default Button;
