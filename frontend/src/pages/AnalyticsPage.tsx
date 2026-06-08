import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, Activity, FileText, Download, Award, BarChart2 } from 'lucide-react';
import { analyticsApi, activitiesApi } from '@/services/api';
import type { AnalyticsData, ActivityStats } from '@/types';
import { Header } from '@/components/layout/Header';
import { useToast } from '@/context/ToastContext';

interface OutletCtx { onMobileMenuOpen: () => void }

const PERIOD_OPTIONS = [
  { label: 'همه دوره', value: undefined },
  { label: '۱ ماه',   value: 1 },
  { label: '۳ ماه',   value: 3 },
];

const STATUS_COLORS: Record<string, string> = {
  'فعال':       '#7fa343',
  'نیمه‌فعال':  '#f59e0b',
  'کم‌فعالیت': '#ef4444',
  'نامشخص':     '#94a3b8',
};

// ── Reusable card ─────────────────────────────────────────────────────────────
const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> =
  ({ title, icon, children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-card p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#2174b8]">{icon}</span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

// ── KPI chip ──────────────────────────────────────────────────────────────────
const KPI: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> =
  ({ label, value, sub, color = '#2174b8' }) => (
    <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );

// ── Custom tooltip ────────────────────────────────────────────────────────────
const RtlTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs text-right" dir="rtl">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name ?? 'تعداد'}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export const AnalyticsPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { error: toastError } = useToast();

  const [months,    setMonths]    = useState<number | undefined>(undefined);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stats,     setStats]     = useState<ActivityStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState<number | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([
        analyticsApi.getFull(months),
        activitiesApi.getStats(months),
      ]);
      setAnalytics(a);
      setStats(s);
    } catch {
      toastError('خطا', 'بارگذاری آنالیتیکس ناموفق بود');
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async (m?: number) => {
    setExporting(m);
    try { await activitiesApi.downloadExport(m); }
    catch { toastError('خطا', 'دانلود ناموفق بود'); }
    finally { setExporting(undefined); }
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="آنالیتیکس انجمن‌ها"
        subtitle="تحلیل جامع آماری فعالیت‌ها، فرم‌ها و عملکرد انجمن‌ها"
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <div className="flex items-center gap-2">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => setMonths(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  months === opt.value
                    ? 'bg-white text-[#2174b8] shadow-sm'
                    : 'text-white/70 hover:bg-white/15'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : analytics && stats ? (
          <>
            {/* ── KPI Strip ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <KPI label="کل انجمن‌ها"      value={analytics.summary.total_associations}       color="#2174b8" />
              <KPI label="انجمن‌های فعال"   value={analytics.summary.active_associations}      color="#7fa343" />
              <KPI label="کل فعالیت‌ها"     value={analytics.summary.total_activities}         color="#8b5cf6" />
              <KPI label="انجمن‌های پرفعالیت" value={analytics.summary.unique_active_associations} color="#f59e0b" />
              <KPI label="میانگین فعالیت"   value={analytics.summary.avg_activities_per_assoc} sub="به ازای هر انجمن" color="#06b6d4" />
              <KPI label="کل فرم‌ها"        value={analytics.summary.total_forms}              color="#ec4899" />
            </div>

            {/* ── Row 1: Activity by type + Association status ──────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="توزیع انواع فعالیت" icon={<BarChart2 size={16} />}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.by_type} layout="vertical" margin={{ right: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis dataKey="label" type="category" width={130} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip content={<RtlTooltip />} />
                    <Bar dataKey="count" name="تعداد" radius={[0, 4, 4, 0]}>
                      {stats.by_type.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="وضعیت فعالیت انجمن‌ها" icon={<Activity size={16} />}>
                <div className="flex items-center justify-center gap-6">
                  <ResponsiveContainer width="55%" height={220}>
                    <PieChart>
                      <Pie
                        data={analytics.assoc_status}
                        dataKey="count"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={85}
                        innerRadius={45}
                        paddingAngle={3}
                      >
                        {analytics.assoc_status.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip content={<RtlTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {analytics.assoc_status.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[d.name] ?? '#94a3b8' }} />
                        <span className="text-gray-700">{d.name}</span>
                        <span className="font-bold text-gray-900 mr-auto">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* ── Row 2: Monthly trend ──────────────────────────────────────── */}
            <Card title="روند ماهانه فعالیت‌ها" icon={<TrendingUp size={16} />}>
              {stats.monthly_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.monthly_trend} margin={{ right: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip content={<RtlTooltip />} />
                    <Line
                      type="monotone" dataKey="count" name="تعداد فعالیت"
                      stroke="#2174b8" strokeWidth={2.5} dot={{ fill: '#2174b8', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-sm text-gray-400 py-8">داده‌ای برای نمایش روند ماهانه وجود ندارد</p>
              )}
            </Card>

            {/* ── Row 3: Top associations + Forms ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="پرفعال‌ترین انجمن‌ها" icon={<Award size={16} />}>
                <div className="space-y-2">
                  {analytics.top_associations.slice(0, 8).map((a, i) => {
                    const max = analytics.top_associations[0]?.count ?? 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-700 truncate">{a.association_name}</span>
                            <span className="text-xs font-bold text-[#2174b8] mr-2">{a.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${(a.count / max) * 100}%`, background: 'linear-gradient(90deg,#2174b8,#7fa343)' }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="تحلیل فرم‌های انجمن‌ها" icon={<FileText size={16} />}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'کل فرم‌ها',       val: analytics.forms_summary.total,       color: '#2174b8' },
                    { label: 'تکمیل شده',        val: analytics.forms_summary.complete,     color: '#7fa343' },
                    { label: 'لغو شده',          val: analytics.forms_summary.cancelled,    color: '#ef4444' },
                    { label: 'نیاز به پیگیری',   val: analytics.forms_summary.needs_follow_up, color: '#f59e0b' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 p-3 text-center">
                      <p className="text-xl font-black" style={{ color: item.color }}>{item.val}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm px-1">
                  <span className="text-gray-500">نرخ تکمیل فرم‌ها</span>
                  <span className="font-bold text-[#7fa343]">{analytics.forms_summary.completion_rate}٪</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${analytics.forms_summary.completion_rate}%`, background: 'linear-gradient(90deg,#2174b8,#7fa343)' }}
                  />
                </div>
                {analytics.activity_form_correlation !== 0 && (
                  <p className="text-[11px] text-gray-400 mt-3 text-center">
                    همبستگی فعالیت–فرم: <span className="font-semibold text-gray-600">{analytics.activity_form_correlation}</span>
                  </p>
                )}
              </Card>
            </div>

            {/* ── Row 4: Participants + Activity pie ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="آمار شرکت‌کنندگان" icon={<Users size={16} />}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'کل شرکت‌کنندگان', val: analytics.participants_stats.total.toLocaleString('fa'), big: true },
                    { label: 'میانگین',           val: analytics.participants_stats.mean },
                    { label: 'میانه',             val: analytics.participants_stats.median },
                    { label: 'بیشترین',           val: analytics.participants_stats.max },
                    { label: 'کمترین',            val: analytics.participants_stats.min },
                  ].map((item, i) => (
                    <div key={i} className={`rounded-xl border border-gray-100 p-3 text-center ${item.big ? 'col-span-3' : ''}`}>
                      <p className={`font-black text-[#2174b8] ${item.big ? 'text-3xl' : 'text-lg'}`}>{item.val}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="سهم هر نوع فعالیت" icon={<BarChart2 size={16} />}>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie data={stats.by_type} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                        {stats.by_type.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<RtlTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-48">
                    {stats.by_type.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-gray-600 truncate">{d.label}</span>
                        <span className="font-bold text-gray-800 mr-auto">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* ── Download section ──────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Download size={16} className="text-[#2174b8]" />
                دانلود گزارش اکسل
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'گزارش ۱ ماه اخیر', months: 1, color: '#2174b8' },
                  { label: 'گزارش ۳ ماه اخیر', months: 3, color: '#7fa343' },
                  { label: 'گزارش کامل',        months: undefined, color: '#8b5cf6' },
                ].map(opt => (
                  <button
                    key={String(opt.months)}
                    onClick={() => handleExport(opt.months)}
                    disabled={exporting === opt.months}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                    style={{ background: opt.color }}
                  >
                    {exporting === opt.months
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Download size={14} />
                    }
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AnalyticsPage;
