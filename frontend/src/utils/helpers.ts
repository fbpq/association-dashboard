// Persian number formatter
export const formatPersianNumber = (num: number): string => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return num.toString().replace(/\d/g, d => persianDigits[parseInt(d)]);
};

// Format large numbers with K/M suffix
export const formatCompactNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Format Persian date from ISO string
export const formatPersianDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return 'ثبت نشده';
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoDate;
  }
};

// Format Persian datetime from ISO string
export const formatPersianDateTime = (isoDate: string | null | undefined): string => {
  if (!isoDate) return 'ثبت نشده';
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoDate;
  }
};

// Time ago in Persian
export const timeAgoPersian = (isoDate: string | null | undefined): string => {
  if (!isoDate) return 'نامشخص';
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'همین الان';
  if (diffMins < 60) return `${formatPersianNumber(diffMins)} دقیقه پیش`;
  if (diffHours < 24) return `${formatPersianNumber(diffHours)} ساعت پیش`;
  if (diffDays < 30) return `${formatPersianNumber(diffDays)} روز پیش`;
  return formatPersianDate(isoDate);
};

// Truncate string
export const truncate = (str: string, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Class name merger
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Status color mapping
export const getActivityStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'فعال': 'success',
    'نیمه‌فعال': 'warning',
    'کم‌فعالیت': 'danger',
    'نامشخص': 'default',
  };
  return map[status] || 'default';
};

export const getLogoStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'دارد': 'success',
    'ناقص': 'warning',
    'ندارد': 'danger',
    'نامشخص': 'default',
  };
  return map[status] || 'default';
};

export const getFileStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'در انتظار پردازش',
    'processing': 'در حال پردازش',
    'success': 'پردازش موفق',
    'error': 'خطا در پردازش',
  };
  return map[status] || status;
};

export const getFileStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    'pending': 'warning',
    'processing': 'info',
    'success': 'success',
    'error': 'danger',
  };
  return map[status] || 'default';
};

export const getFileTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    'associations': 'انجمن‌ها',
    'forms': 'فرم‌ها',
    'unknown': 'نامشخص',
  };
  return map[type] || type;
};

// Percentage calculation
export const percentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Download helper
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Debounce
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => unknown>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
