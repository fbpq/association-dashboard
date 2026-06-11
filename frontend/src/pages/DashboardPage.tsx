import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Building2, CheckCircle, AlertCircle, FileText,
  Upload, Image, Mail, FileX,
} from 'lucide-react';
import { dashboardApi } from '@/services/api';
import type { KPIData, DashboardCharts, Association, AssociationForm } from '@/types';
import { Header } from '@/components/layout/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { KPIDetailModal } from '@/components/dashboard/KPIDetailModal';
import { PieChartCard } from '@/components/charts/PieChartCard';
import { BarChartCard } from '@/components/charts/BarChartCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

interface OutletCtx { onMobileMenuOpen: () => void }

type ModalState = {
  title: string;
  subtitle?: string;
  associations?: Association[];
  forms?: AssociationForm[];
  loading?: boolean;
} | null;

export const DashboardPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const navigate = useNavigate();

  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const openAssocModal = async (title: string, subtitle: string, filters: Record<string, unknown> = {}) => {
    setModal({ title, subtitle, loading: true });
    try {
      const res = await dashboardApi.getAssociations({ per_page: 100, ...filters } as Parameters<typeof dashboardApi.getAssociations>[0]);
      setModal({ title, subtitle, associations: res.items });
    } catch {
      setModal({ title, subtitle, associations: [] });
    }
  };

  const openFormsModal = async (title: string, subtitle: string, filters: Record<string, unknown> = {}) => {
    setModal({ title, subtitle, loading: true });
    try {
      const res = await dashboardApi.getForms({ per_page: 100, ...filters } as Parameters<typeof dashboardApi.getForms>[0]);
      setModal({ title, subtitle, forms: res.items });
    } catch {
      setModal({ title, subtitle, forms: [] });
    }
  };

  useEffect(() => {
    Promise.all([dashboardApi.getSummary(), dashboardApi.getCharts()])
      .then(([kpiData, chartsData]) => {
        setKpi(kpiData);
        setCharts(chartsData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const hasData = kpi && kpi.total_associations > 0;

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <KPIDetailModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.title ?? ''}
        subtitle={modal?.subtitle}
        associations={modal?.associations}
        forms={modal?.forms}
      />
      <Header
        title="داشبورد اصلی"
        subtitle="خلاصه وضعیت انجمن‌ها و فرم‌ها"
        lastUpdate={kpi?.last_processed_date}
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <Button
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => navigate('/upload')}
          >
            آپلود فایل جدید
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {error && (
          <EmptyState variant="error" action={
            <Button onClick={() => window.location.reload()}>تلاش مجدد</Button>
          } />
        )}

        {!error && !hasData && !loading && (
          <div className="flex items-center justify-center min-h-96">
            <EmptyState
              variant="no-file"
              action={
                <Button
                  size="lg"
                  icon={<Upload size={18} />}
                  onClick={() => navigate('/upload')}
                >
                  آپلود اولین فایل
                </Button>
              }
            />
          </div>
        )}

        {(loading || hasData) && (
          <>
            {/* Section: Association KPIs */}
            <div>
              <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4">آمار انجمن‌ها</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
                  <>
                    <KPICard title="کل انجمن‌ها" value={kpi!.total_associations} icon={Building2} variant="primary" subtitle="انجمن ثبت‌شده"
                      onClick={() => openAssocModal('کل انجمن‌ها', 'همه انجمن‌های ثبت‌شده')} />
                    <KPICard title="انجمن‌های فعال" value={kpi!.active_associations} icon={CheckCircle} variant="success" subtitle={`از ${kpi!.total_associations} انجمن`}
                      onClick={() => openAssocModal('انجمن‌های فعال', 'انجمن‌هایی با وضعیت فعال', { activity_status: 'فعال' })} />
                    <KPICard title="نیازمند پیگیری" value={kpi!.needs_follow_up_associations} icon={AlertCircle} variant="warning" subtitle="انجمن دارای نقص"
                      onClick={() => openAssocModal('نیازمند پیگیری', 'انجمن‌هایی که نیاز به اقدام دارند', { needs_follow_up: true })} />
                    <KPICard title="فاقد لوگو/هدر" value={kpi!.no_logo + kpi!.no_header} icon={Image} variant="danger" subtitle="نیاز به تکمیل"
                      onClick={() => openAssocModal('فاقد لوگو یا هدر', 'انجمن‌هایی که لوگو یا هدر ندارند', { logo_status: 'ندارد' })} />
                  </>
                )}
              </div>
            </div>

            {/* Section: Form KPIs */}
            <div>
              <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4">آمار فرم‌ها</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
                  <>
                    <KPICard title="کل فرم‌ها" value={kpi!.total_forms} icon={FileText} variant="primary" subtitle="فرم ثبت‌شده"
                      onClick={() => openFormsModal('کل فرم‌ها', 'همه فرم‌های ثبت‌شده')} />
                    <KPICard title="فرم‌های کامل" value={kpi!.complete_forms} icon={CheckCircle} variant="success" subtitle="امضای کامل"
                      onClick={() => openFormsModal('فرم‌های کامل', 'فرم‌هایی با امضای کامل', { is_complete: true })} />
                    <KPICard title="فرم‌های ناقص" value={kpi!.incomplete_forms} icon={FileX} variant="danger" subtitle="نقص امضا یا اطلاعات"
                      onClick={() => openFormsModal('فرم‌های ناقص', 'فرم‌هایی با نقص امضا یا اطلاعات', { is_complete: false })} />
                    <KPICard title="فاقد ایمیل دانشجویی" value={kpi!.no_email} icon={Mail} variant="warning" subtitle="انجمن بدون ایمیل"
                      onClick={() => openAssocModal('فاقد ایمیل دانشجویی', 'انجمن‌هایی که ایمیل دانشجویی ندارند', { has_email: false })} />
                  </>
                )}
              </div>
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
              <PieChartCard
                title="وضعیت فعالیت انجمن‌ها"
                data={charts?.activity_status_chart || []}
                loading={loading}
                donut
              />
              <PieChartCard
                title="وضعیت لوگو و هدر"
                data={charts?.logo_status_chart || []}
                loading={loading}
              />
              <PieChartCard
                title="نوع فرم‌ها"
                data={charts?.form_type_chart || []}
                loading={loading}
                donut
              />
              <PieChartCard
                title="وضعیت امضای فرم‌ها"
                data={charts?.signature_status_chart || []}
                loading={loading}
              />
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <BarChartCard
                title="تعداد انجمن‌ها بر اساس کانال ارتباطی"
                data={charts?.associations_by_channel || []}
                loading={loading}
              />

              {/* Quick stats card */}
              {!loading && kpi && (
                <Card>
                  <CardHeader>
                    <CardTitle>خلاصه آماری سریع</CardTitle>
                  </CardHeader>
                  <div className="space-y-3">
                    {[
                      { label: 'انجمن‌های نیمه‌فعال', value: kpi.semi_active_associations, total: kpi.total_associations, color: 'bg-warning-500' },
                      { label: 'انجمن‌های کم‌فعالیت', value: kpi.low_activity_associations, total: kpi.total_associations, color: 'bg-danger-500' },
                      { label: 'انجمن دارای ایمیل دانشجویی', value: kpi.has_email, total: kpi.total_associations, color: 'bg-success-500' },
                      { label: 'کارگاه‌های ثبت‌شده', value: kpi.workshops, total: kpi.total_forms, color: 'bg-primary-500' },
                      { label: 'مسابقات ثبت‌شده', value: kpi.competitions, total: kpi.total_forms, color: 'bg-violet-500' },
                      { label: 'فرم‌های لغو شده', value: kpi.cancelled_forms, total: kpi.total_forms, color: 'bg-slate-400' },
                    ].map(({ label, value, total, color }) => {
                      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">{label}</span>
                            <span className="text-xs font-semibold text-slate-800">{value} <span className="text-slate-400 font-normal">({pct}٪)</span></span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${color} progress-animate`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
