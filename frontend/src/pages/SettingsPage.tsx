import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Settings2 } from 'lucide-react';
import { settingsApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface OutletCtx { onMobileMenuOpen: () => void }

export const SettingsPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { success, error: toastError } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then(setSettings)
      .catch(() => toastError('خطا', 'بارگذاری تنظیمات ناموفق بود.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      success('تنظیمات ذخیره شد', 'تغییرات با موفقیت اعمال شدند.');
    } catch {
      toastError('خطا', 'ذخیره تنظیمات ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const SETTING_FIELDS = [
    { key: 'system_name', label: 'نام سامانه', hint: 'نام سامانه که در هدر و گزارش‌ها نمایش داده می‌شود' },
    { key: 'org_name', label: 'نام سازمان', hint: 'نام کامل سازمان برای استفاده در گزارش‌های رسمی' },
    { key: 'admin_email', label: 'ایمیل مدیر سامانه', hint: 'ایمیل سازمانی مدیر برای مکاتبات رسمی' },
    { key: 'max_file_size_mb', label: 'حداکثر حجم فایل (مگابایت)', hint: 'بزرگ‌ترین حجم مجاز برای فایل‌های اکسل آپلودی' },
  ];

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="تنظیمات"
        subtitle="پیکربندی سامانه مدیریت انجمن‌ها"
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <Settings2 size={16} className="text-primary-700" />
              </div>
              <CardTitle>تنظیمات عمومی سامانه</CardTitle>
            </div>
          </CardHeader>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {SETTING_FIELDS.map(({ key, label, hint }) => (
                <Input
                  key={key}
                  label={label}
                  hint={hint}
                  value={settings[key] || ''}
                  onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                />
              ))}
              <div className="flex justify-end pt-2">
                <Button
                  loading={saving}
                  icon={<Save size={16} />}
                  iconPosition="left"
                  onClick={handleSave}
                >
                  ذخیره تنظیمات
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* System info */}
        <Card>
          <CardHeader><CardTitle>اطلاعات سامانه</CardTitle></CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'نسخه سامانه', value: '1.0.0' },
              { label: 'محیط اجرا', value: 'Production' },
              { label: 'زبان', value: 'فارسی (RTL)' },
              { label: 'توسعه‌دهنده', value: 'فرهاد سعیدی نژاد' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* API Integration info */}
        <Card>
          <CardHeader><CardTitle>نقاط اتصال API</CardTitle></CardHeader>
          <div className="space-y-2 text-xs font-mono">
            {[
              ['POST', '/api/auth/login', 'ورود به سامانه'],
              ['GET',  '/api/auth/me', 'دریافت اطلاعات کاربر'],
              ['POST', '/api/files/upload', 'آپلود فایل اکسل'],
              ['GET',  '/api/files', 'لیست فایل‌های آپلودی'],
              ['POST', '/api/files/{id}/parse', 'پردازش مجدد فایل'],
              ['GET',  '/api/dashboard/summary', 'KPIهای داشبورد'],
              ['GET',  '/api/dashboard/associations', 'جدول انجمن‌ها'],
              ['GET',  '/api/dashboard/forms', 'جدول فرم‌ها'],
              ['GET',  '/api/export/associations.xlsx', 'خروجی اکسل انجمن‌ها'],
              ['GET',  '/api/export/dashboard.pdf', 'خروجی PDF داشبورد'],
            ].map(([method, path, desc]) => (
              <div key={path} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${method === 'GET' ? 'bg-success-50 text-success-700' : 'bg-primary-50 text-primary-700'}`}>{method}</span>
                <span className="text-slate-700 flex-1">{path}</span>
                <span className="text-slate-400 hidden md:block">{desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
