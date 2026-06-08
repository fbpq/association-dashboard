import React from 'react';
import { FileX2, SearchX, AlertCircle, Upload } from 'lucide-react';
import { cn } from '@/utils/helpers';

type EmptyVariant = 'no-data' | 'no-results' | 'error' | 'no-file';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const defaultContent: Record<EmptyVariant, { Icon: React.ElementType; title: string; description: string; bgColor: string; iconColor: string }> = {
  'no-data':    { Icon: FileX2,    title: 'هیچ داده‌ای یافت نشد',         description: 'هنوز فایلی آپلود نشده است. برای شروع، فایل اکسل انجمن‌ها یا فرم‌ها را بارگذاری کنید.', bgColor: 'bg-slate-100', iconColor: 'text-slate-400' },
  'no-results': { Icon: SearchX,   title: 'نتیجه‌ای یافت نشد',             description: 'جستجو یا فیلتر اعمال‌شده با هیچ موردی تطابق ندارد. معیارهای جستجو را تغییر دهید.', bgColor: 'bg-blue-50', iconColor: 'text-blue-400' },
  'error':      { Icon: AlertCircle, title: 'خطا در بارگذاری اطلاعات',   description: 'در دریافت اطلاعات مشکلی پیش آمد. لطفاً صفحه را تازه‌سازی کنید یا با پشتیبان تماس بگیرید.', bgColor: 'bg-red-50', iconColor: 'text-red-400' },
  'no-file':    { Icon: Upload,     title: 'فایلی آپلود نشده است',         description: 'برای مشاهده داشبورد و تحلیل‌ها، ابتدا فایل‌های اکسل انجمن‌ها و فرم‌ها را آپلود کنید.', bgColor: 'bg-primary-50', iconColor: 'text-primary-400' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'no-data',
  title,
  description,
  action,
  className,
}) => {
  const content = defaultContent[variant];
  const Icon = content.Icon;

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className={cn('w-20 h-20 rounded-3xl flex items-center justify-center mb-6', content.bgColor)}>
        <Icon size={40} className={content.iconColor} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title || content.title}</h3>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">{description || content.description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
