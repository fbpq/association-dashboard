import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Download, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { activitiesApi } from '@/services/api';
import type { AssociationActivity } from '@/types';
import { ACTIVITY_LABELS, ACTIVITY_COLORS } from '@/types';
import { Header } from '@/components/layout/Header';
import { useToast } from '@/context/ToastContext';

interface OutletCtx { onMobileMenuOpen: () => void }

const STATUS_STYLE: Record<string, string> = {
  'برگزار شد': 'bg-[#f3f8ec] text-[#55702d]',
  'لغو شد':    'bg-red-50 text-red-600',
  'در حال برنامه‌ریزی': 'bg-amber-50 text-amber-700',
};

const PERIOD_OPTIONS = [
  { label: 'همه', value: undefined },
  { label: '۱ ماه اخیر', value: 1 },
  { label: '۳ ماه اخیر', value: 3 },
  { label: '۶ ماه اخیر', value: 6 },
];

export const ActivitiesPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { error: toastError } = useToast();

  const [items,      setItems]      = useState<AssociationActivity[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [months,     setMonths]     = useState<number | undefined>(undefined);
  const [exporting,  setExporting]  = useState(false);

  const PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activitiesApi.list({ page, per_page: PER_PAGE, search, activity_type: typeFilter || undefined, months });
      setItems(res.items);
      setTotal(res.total);
    } catch {
      toastError('خطا', 'بارگذاری فعالیت‌ها ناموفق بود');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, months]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, typeFilter, months]);

  const handleExport = async (m?: number) => {
    setExporting(true);
    try { await activitiesApi.downloadExport(m); }
    catch { toastError('خطا', 'دانلود ناموفق بود'); }
    finally { setExporting(false); }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="فعالیت‌های انجمن‌ها"
        subtitle="مشاهده و جستجوی فعالیت‌های علمی و آموزشی انجمن‌ها"
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport(months)}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-60"
            >
              <Download size={14} />
              <span className="hidden sm:inline">خروجی اکسل</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
            <input
              type="text"
              placeholder="جستجوی انجمن یا عنوان فعالیت..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 pr-9 text-sm text-white placeholder-white/50 outline-none focus:border-white/40"
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 pr-4 pl-8 text-sm text-white outline-none focus:border-white/40 appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-800 bg-white">همه انواع فعالیت</option>
              {Object.entries(ACTIVITY_LABELS).map(([type, label]) => (
                <option key={type} value={type} className="text-gray-800 bg-white">{label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>

          {/* Period filter */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => setMonths(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  months === opt.value ? 'bg-white text-[#2174b8]' : 'text-white/70 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Download buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport(1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Download size={12} /> ۱ ماه
            </button>
            <button
              onClick={() => handleExport(3)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Download size={12} /> ۳ ماه
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-white/70">
            <Filter size={12} />
            <span>{total} فعالیت</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 border-2 border-[#2174b8] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">فعالیتی یافت نشد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">انجمن</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">نوع فعالیت</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">عنوان</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">تاریخ</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">ترم</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">شرکت‌کنندگان</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a, idx) => (
                    <tr key={a.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/20'}`}>
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs">{a.association_name}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                          style={{ backgroundColor: ACTIVITY_COLORS[a.activity_type] ?? '#94a3b8' }}
                        >
                          {a.activity_label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs max-w-48 truncate">{a.title ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{a.event_date ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{a.semester ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs text-center">
                        {a.participants_count ? a.participants_count.toLocaleString('fa') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[a.status ?? ''] ?? 'bg-gray-50 text-gray-500'}`}>
                          {a.status ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <span className="text-sm text-white/70">صفحه {page} از {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;
