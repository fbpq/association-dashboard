import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { dashboardApi } from '@/services/api';
import type { AssociationForm, FormFilters } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { formatPersianNumber, debounce } from '@/utils/helpers';

interface OutletCtx { onMobileMenuOpen: () => void }

const SIG_LABELS: { key: keyof AssociationForm; label: string }[] = [
  { key: 'sig_secretary', label: 'دبیر' },
  { key: 'sig_advisor', label: 'مشاور' },
  { key: 'sig_inspector', label: 'بازرس' },
  { key: 'sig_dean', label: 'رئیس دانشکده' },
  { key: 'sig_head_associations', label: 'رئیس اداره' },
  { key: 'sig_director_general', label: 'مدیرکل' },
];

export const FormsPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { error: toastError } = useToast();
  const [data, setData] = useState<AssociationForm[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FormFilters>({ page: 1, per_page: 10, search: '' });
  const [searchInput, setSearchInput] = useState('');

  const fetchData = useCallback((f: FormFilters) => {
    setLoading(true);
    dashboardApi.getForms(f)
      .then(res => { setData(res.items); setTotal(res.total); setTotalPages(res.total_pages); })
      .catch(() => toastError('خطا', 'بارگذاری داده‌های فرم‌ها ناموفق بود.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(filters); }, [filters, fetchData]);

  const debouncedSearch = useCallback(debounce((value: string) => {
    setFilters(f => ({ ...f, page: 1, search: value }));
  }, 400), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const resetFilters = () => {
    setSearchInput('');
    setFilters({ page: 1, per_page: 10, search: '' });
  };

  const hasActiveFilters = !!(filters.search || filters.form_type || filters.is_complete != null || filters.needs_follow_up != null);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="جدول فرم‌ها"
        subtitle={`${formatPersianNumber(total)} فرم`}
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="جستجو در نام انجمن، عنوان..."
            value={searchInput}
            onChange={handleSearchChange}
            icon={<Search size={16} />}
            fullWidth={false}
            className="flex-1 max-w-xs"
          />
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="md"
            icon={<Filter size={16} />}
            onClick={() => setShowFilters(s => !s)}
          >
            فیلترها {hasActiveFilters && <span className="w-2 h-2 bg-warning-400 rounded-full mr-1" />}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="md" icon={<X size={16} />} onClick={resetFilters}>پاک‌سازی</Button>
          )}
        </div>

        {showFilters && (
          <Card padding="sm" className="animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                label="نوع فرم"
                options={[{ value: '', label: 'همه' }, { value: 'کارگاه', label: 'کارگاه' }, { value: 'مسابقه', label: 'مسابقه' }]}
                value={filters.form_type || ''}
                onChange={e => setFilters(f => ({ ...f, page: 1, form_type: e.target.value as AssociationForm['form_type'] | '' }))}
              />
              <Select
                label="تکمیل بودن"
                options={[{ value: '', label: 'همه' }, { value: 'true', label: 'کامل' }, { value: 'false', label: 'ناقص' }]}
                value={filters.is_complete == null ? '' : filters.is_complete.toString()}
                onChange={e => setFilters(f => ({ ...f, page: 1, is_complete: e.target.value === '' ? null : e.target.value === 'true' }))}
              />
              <Select
                label="نقص امضا"
                options={[{ value: '', label: 'همه' }, { value: 'true', label: 'دارد' }, { value: 'false', label: 'ندارد' }]}
                value={filters.has_missing_signature == null ? '' : filters.has_missing_signature.toString()}
                onChange={e => setFilters(f => ({ ...f, page: 1, has_missing_signature: e.target.value === '' ? null : e.target.value === 'true' }))}
              />
              <Select
                label="نیاز به پیگیری"
                options={[{ value: '', label: 'همه' }, { value: 'true', label: 'بله' }, { value: 'false', label: 'خیر' }]}
                value={filters.needs_follow_up == null ? '' : filters.needs_follow_up.toString()}
                onChange={e => setFilters(f => ({ ...f, page: 1, needs_follow_up: e.target.value === '' ? null : e.target.value === 'true' }))}
              />
            </div>
          </Card>
        )}

        <Card padding="none">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <CardTitle>لیست فرم‌ها</CardTitle>
            <span className="text-xs text-slate-500">{formatPersianNumber(total)} مورد</span>
          </div>
          {loading ? (
            <div className="p-6"><SkeletonTable rows={8} cols={7} /></div>
          ) : data.length === 0 ? (
            <EmptyState variant="no-results" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm data-table">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-100">
                      {['#', 'نام انجمن', 'نوع', 'عنوان فعالیت', 'تاریخ', 'وضعیت', 'امضاها', 'پیگیری'].map(h => (
                        <th key={h} className="text-right px-4 py-3 text-xs font-bold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.map((form, idx) => (
                      <tr key={form.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-slate-400 text-xs">{formatPersianNumber((filters.page - 1) * filters.per_page + idx + 1)}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">{form.association_name}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={form.form_type === 'کارگاه' ? 'primary' : form.form_type === 'مسابقه' ? 'info' : 'default'} size="sm">
                            {form.form_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 max-w-48">
                          <p className="truncate">{form.workshop_title || form.competition_title || <span className="text-slate-300">—</span>}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap text-xs">{form.event_date || <span className="text-danger-400">بدون تاریخ</span>}</td>
                        <td className="px-4 py-3.5">
                          {form.is_cancelled
                            ? <Badge variant="default" size="sm">لغو شده</Badge>
                            : form.is_complete
                              ? <Badge variant="success" size="sm">کامل</Badge>
                              : <Badge variant="danger" size="sm">ناقص</Badge>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {SIG_LABELS.map(({ key, label }) => {
                              const val = form[key] as string | null;
                              return (
                                <span
                                  key={key}
                                  title={label}
                                  className={`w-2 h-2 rounded-full ${val === 'دارد' ? 'bg-success-500' : 'bg-danger-400'}`}
                                />
                              );
                            })}
                          </div>
                          {form.has_missing_signature && (
                            <p className="text-xs text-danger-600 mt-0.5">نقص امضا</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {form.needs_follow_up
                            ? <Badge variant="warning" size="sm" dot>بله</Badge>
                            : <Badge variant="success" size="sm">خیر</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-slate-100">
                <Pagination
                  page={filters.page}
                  totalPages={totalPages}
                  total={total}
                  perPage={filters.per_page}
                  onPageChange={page => setFilters(f => ({ ...f, page }))}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FormsPage;
