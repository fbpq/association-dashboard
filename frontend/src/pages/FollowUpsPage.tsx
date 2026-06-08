import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Building2, FileText, RefreshCw } from 'lucide-react';
import { dashboardApi } from '@/services/api';
import type { Association, AssociationForm } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/LoadingSpinner';
import { formatPersianNumber } from '@/utils/helpers';

interface OutletCtx { onMobileMenuOpen: () => void }

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  'فعال': 'success', 'نیمه‌فعال': 'warning', 'کم‌فعالیت': 'danger', 'نامشخص': 'default',
};

const MISSING_FIELD_LABELS: Record<string, string> = {
  logo_status: 'لوگو', header_status: 'هدر', student_email: 'ایمیل دانشجویی',
  roadmap_session: 'جلسه نقشه راه', channel_bale: 'کانال بله',
  site_activity_registered: 'ثبت فعالیت سایت', roadmap: 'نقشه راه',
  form_competition: 'فرم مسابقه', form_workshop: 'فرم کارگاه', phone: 'شماره تماس',
};

export const FollowUpsPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { error: toastError } = useToast();
  const [associations, setAssociations] = useState<Association[]>([]);
  const [forms, setForms] = useState<AssociationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'associations' | 'forms'>('associations');

  const loadData = () => {
    setLoading(true);
    dashboardApi.getFollowUps()
      .then(res => { setAssociations(res.associations); setForms(res.forms); })
      .catch(() => toastError('خطا', 'بارگذاری موارد پیگیری ناموفق بود.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="موارد نیازمند پیگیری"
        subtitle={`${formatPersianNumber(associations.length + forms.length)} مورد نیازمند اقدام`}
        onMobileMenuOpen={onMobileMenuOpen}
        actions={<Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={loadData}>به‌روزرسانی</Button>}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        {/* Summary alert */}
        {!loading && (associations.length + forms.length) > 0 && (
          <div className="flex items-start gap-3 bg-warning-50 border border-warning-100 rounded-xl px-4 py-3 animate-fade-in">
            <AlertTriangle size={18} className="text-warning-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-warning-800 mb-0.5">موارد نیازمند پیگیری شناسایی شدند</p>
              <p className="text-warning-700 text-xs">
                {formatPersianNumber(associations.length)} انجمن و {formatPersianNumber(forms.length)} فرم دارای نقص اطلاعات یا مشکل هستند.
                لطفاً این موارد را بررسی و پیگیری کنید.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('associations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'associations' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Building2 size={15} />
            انجمن‌ها
            {!loading && <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === 'associations' ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'}`}>{formatPersianNumber(associations.length)}</span>}
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'forms' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <FileText size={15} />
            فرم‌ها
            {!loading && <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === 'forms' ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'}`}>{formatPersianNumber(forms.length)}</span>}
          </button>
        </div>

        {/* Associations tab */}
        {activeTab === 'associations' && (
          <Card padding="none">
            <div className="px-5 py-4 border-b border-slate-100">
              <CardTitle>انجمن‌های نیازمند پیگیری</CardTitle>
            </div>
            {loading ? (
              <div className="p-6"><SkeletonTable rows={6} cols={5} /></div>
            ) : associations.length === 0 ? (
              <EmptyState
                variant="no-results"
                title="همه انجمن‌ها مرتب هستند!"
                description="هیچ انجمنی نیازمند پیگیری شناسایی نشد. عملکرد عالی است!"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm data-table">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-100">
                      {['#', 'نام انجمن', 'دبیر', 'وضعیت', 'فیلدهای ناقص'].map(h => (
                        <th key={h} className="text-right px-5 py-3 text-xs font-bold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {associations.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-5 py-4 text-slate-400 text-xs">{formatPersianNumber(idx + 1)}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{a.name}</td>
                        <td className="px-5 py-4 text-slate-600">{a.secretary_name || '—'}</td>
                        <td className="px-5 py-4">
                          <Badge variant={STATUS_BADGE[a.activity_status] || 'default'} size="sm" dot>{a.activity_status}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {a.missing_fields.slice(0, 4).map(field => (
                              <span key={field} className="text-xs bg-warning-50 text-warning-700 border border-warning-100 px-2 py-0.5 rounded-lg">
                                {MISSING_FIELD_LABELS[field] || field}
                              </span>
                            ))}
                            {a.missing_fields.length > 4 && (
                              <span className="text-xs text-slate-500">+{formatPersianNumber(a.missing_fields.length - 4)} مورد دیگر</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Forms tab */}
        {activeTab === 'forms' && (
          <Card padding="none">
            <div className="px-5 py-4 border-b border-slate-100">
              <CardTitle>فرم‌های نیازمند پیگیری</CardTitle>
            </div>
            {loading ? (
              <div className="p-6"><SkeletonTable rows={4} cols={5} /></div>
            ) : forms.length === 0 ? (
              <EmptyState
                variant="no-results"
                title="همه فرم‌ها کامل هستند!"
                description="هیچ فرمی نیازمند پیگیری شناسایی نشد."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm data-table">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-100">
                      {['#', 'نام انجمن', 'نوع', 'عنوان', 'مشکل'].map(h => (
                        <th key={h} className="text-right px-5 py-3 text-xs font-bold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {forms.map((f, idx) => (
                      <tr key={f.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-5 py-4 text-slate-400 text-xs">{formatPersianNumber(idx + 1)}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{f.association_name}</td>
                        <td className="px-5 py-4">
                          <Badge variant={f.form_type === 'کارگاه' ? 'primary' : 'info'} size="sm">{f.form_type}</Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-600 max-w-48 truncate">{f.workshop_title || f.competition_title || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {f.has_missing_signature && <span className="text-xs bg-danger-50 text-danger-700 border border-danger-100 px-2 py-0.5 rounded-lg">نقص امضا</span>}
                            {!f.event_date && <span className="text-xs bg-warning-50 text-warning-700 border border-warning-100 px-2 py-0.5 rounded-lg">بدون تاریخ</span>}
                            {f.is_cancelled && <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg">لغو شده</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default FollowUpsPage;
