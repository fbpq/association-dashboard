import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Download, FileSpreadsheet, FileText, BarChart3,
  CheckCircle, Clock, Info,
} from 'lucide-react';
import { exportApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface OutletCtx { onMobileMenuOpen: () => void }

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  buttonLabel: string;
  format: 'xlsx' | 'pdf';
  action: () => Promise<void>;
}

export const ReportsPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { success, error: toastError, info } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (id: string, action: () => Promise<void>, label: string) => {
    setLoading(id);
    info('در حال آماده‌سازی', 'گزارش در حال تولید است، لطفاً صبر کنید...');
    try {
      await action();
      success('دریافت موفق', `${label} با موفقیت دریافت شد.`);
    } catch (err) {
      toastError('خطا', 'دریافت گزارش ناموفق بود. لطفاً مجدداً تلاش کنید.');
    } finally {
      setLoading(null);
    }
  };

  const REPORTS: ReportCard[] = [
    {
      id: 'associations',
      title: 'گزارش کامل انجمن‌ها',
      description: 'فایل اکسل شامل تمام اطلاعات انجمن‌های ثبت‌شده از جمله وضعیت فعالیت، لوگو، هدر، ایمیل، کانال‌های ارتباطی و موارد نیازمند پیگیری.',
      icon: FileSpreadsheet,
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-700',
      buttonLabel: 'دریافت گزارش انجمن‌ها',
      format: 'xlsx',
      action: exportApi.exportAssociations,
    },
    {
      id: 'forms',
      title: 'گزارش کامل فرم‌ها',
      description: 'فایل اکسل شامل تمام فرم‌های کارگاه و مسابقه به همراه وضعیت امضاها، تاریخ، وضعیت تکمیل و موارد نیازمند پیگیری.',
      icon: FileText,
      iconBg: 'bg-success-50',
      iconColor: 'text-success-700',
      buttonLabel: 'دریافت گزارش فرم‌ها',
      format: 'xlsx',
      action: exportApi.exportForms,
    },
    {
      id: 'full_report',
      title: 'گزارش جامع داشبورد (Excel)',
      description: 'فایل اکسل چندشیته شامل عنوان سازمانی، تاریخ تولید گزارش، اطلاعات آخرین فایل پردازش‌شده، آمار خلاصه KPI، داده‌های انجمن‌ها و فرم‌ها.',
      icon: BarChart3,
      iconBg: 'bg-warning-50',
      iconColor: 'text-warning-700',
      buttonLabel: 'دریافت گزارش جامع Excel',
      format: 'xlsx',
      action: exportApi.exportFullReport,
    },
    {
      id: 'pdf',
      title: 'گزارش رسمی داشبورد (PDF)',
      description: 'فایل PDF با لوگوی رسمی سازمان، عنوان «گزارش مدیریتی انجمن‌ها»، نام سازمان، تاریخ تولید، آمار کلیدی و نمودارها. مناسب برای جلسات مدیریتی و مکاتبات رسمی.',
      icon: FileText,
      iconBg: 'bg-danger-50',
      iconColor: 'text-danger-600',
      buttonLabel: 'دریافت گزارش PDF',
      format: 'pdf',
      action: exportApi.exportPDF,
    },
  ];

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="گزارش‌ها و خروجی‌ها"
        subtitle="دریافت گزارش‌های رسمی Excel و PDF"
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        {/* Info banner */}
        <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
          <Info size={18} className="text-primary-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-primary-800 mb-0.5">راهنمای گزارش‌گیری</p>
            <p className="text-primary-700 text-xs leading-relaxed">
              گزارش‌ها بر اساس آخرین فایل‌های پردازش‌شده تولید می‌شوند. برای به‌روزترین گزارش، ابتدا فایل اکسل جدید را از صفحه «آپلود فایل‌ها» بارگذاری کنید.
            </p>
          </div>
        </div>

        {/* Report cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {REPORTS.map(report => (
            <Card key={report.id} className="group hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${report.iconBg}`}>
                  <report.icon size={22} className={report.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-sm">{report.title}</h3>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md font-semibold ${report.format === 'xlsx' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-600'}`}>
                      .{report.format}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{report.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={loading === report.id}
                    icon={<Download size={14} />}
                    iconPosition="left"
                    onClick={() => handleExport(report.id, report.action, report.title)}
                  >
                    {report.buttonLabel}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Report features */}
        <Card>
          <CardHeader>
            <CardTitle>ویژگی‌های گزارش‌های رسمی</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: CheckCircle, text: 'لوگوی رسمی سازمان در سربرگ', color: 'text-success-600' },
              { icon: CheckCircle, text: 'تاریخ و زمان دقیق تولید گزارش', color: 'text-success-600' },
              { icon: CheckCircle, text: 'آمار خلاصه و KPIهای مدیریتی', color: 'text-success-600' },
              { icon: CheckCircle, text: 'اطلاعات کامل انجمن‌ها و فرم‌ها', color: 'text-success-600' },
              { icon: CheckCircle, text: 'فونت فارسی صحیح در PDF', color: 'text-success-600' },
              { icon: CheckCircle, text: 'RTL کامل در همه خروجی‌ها', color: 'text-success-600' },
              { icon: Clock, text: 'تولید سریع — کمتر از چند ثانیه', color: 'text-primary-600' },
              { icon: CheckCircle, text: 'نام فارسی استاندارد در فایل دانلودی', color: 'text-success-600' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-slate-600">
                <Icon size={15} className={`flex-shrink-0 ${color}`} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
