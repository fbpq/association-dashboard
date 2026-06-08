import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, X, ChevronUp, ChevronDown } from 'lucide-react';
import { dashboardApi } from '@/services/api';
import type { Association, AssociationFilters, ActivityStatus, LogoStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { getActivityStatusColor, getLogoStatusColor, formatPersianNumber, debounce } from '@/utils/helpers';

interface OutletCtx { onMobileMenuOpen: () => void }

const ACTIVITY_OPTIONS = [{ value: '', label: 'همه وضعیت‌ها' }, { value: 'فعال', label: 'فعال' }, { value: 'نیمه‌فعال', label: 'نیمه‌فعال' }, { value: 'کم‌فعالیت', label: 'کم‌فعالیت' }, { value: 'نامشخص', label: 'نامشخص' }];
const LOGO_OPTIONS = [{ value: '', label: 'همه وضعیت‌ها' }, { value: 'دارد', label: 'دارد' }, { value: 'ناقص', label: 'ناقص' }, { value: 'ندارد', label: 'ندارد' }, { value: 'نامشخص', label: 'نامشخص' }];
const FOLLOWUP_OPTIONS = [{ value: '', label: 'همه موارد' }, { value: 'true', label: 'نیازمند پیگیری' }, { value: 'false', label: 'بدون نقص' }];

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = { 'فعال': 'success', 'نیمه‌فعال': 'warning', 'کم‌فعالیت': 'danger', 'نامشخص': 'default' };
const LOGO_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = { 'دارد': 'success', 'ناقص': 'warning', 'ندارد': 'danger', 'نامشخص': 'default' };

export const AssociationsPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { error: toastError } = useToast();
  const [data, setData] = useState<Association[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AssociationFilters>({ page: 1, per_page: 10, search: '', activity_status: '', logo_status: '' });
  const [searchInput, setSearchInput] = useState('');

  const fetchData = useCallback((f: AssociationFilters) => {
    setLoading(true);
    dashboardApi.getAssociations(f)
      .then(res => { setData(res.items); setTotal(res.total); setTotalPages(res.total_pages); })
      .catch(() => toastError('خطا', 'بارگذاری داده‌های انجمن‌ها ناموفق بود.'))
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
    setFilters({ page: 1, per_page: 10, search: '', activity_status: '', logo_status: '' });
  };

  const hasActiveFilters = !!(filters.search || filters.activity_status || filters.logo_status || filters.needs_follow_up != null);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="جدول انجمن‌ها"
        subtitle={`${formatPersianNumber(total)} انجمن`}
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="جستجو در نام انجمن، دبیر..."
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
            <Button variant="ghost" size="md" icon={<X size={16} />} onClick={resetFilters}>
              پاک‌سازی
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card padding="sm" className="animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                label="وضعیت فعالیت"
                options={ACTIVITY_OPTIONS}
                value={filters.activity_status || ''}
                onChange={e => setFilters(f => ({ ...f, page: 1, activity_status: e.target.value as ActivityStatus | '' }))}
              />
              <Select
                label="وضعیت لوگو"
                options={LOGO_OPTIONS}
                value={filters.logo_status || ''}
                onChange={e => setFilters(f => ({ ...f, page: 1, logo_status: e.target.value as LogoStatus | '' }))}
              />
              <Select
                label="نیاز به پیگیری"
                options={FOLLOWUP_OPTIONS}
                value={filters.needs_follow_up == null ? '' : filters.needs_follow_up.toString()}
                onChange={e => setFilters(f => ({ ...f, page: 1, needs_follow_up: e.target.value === '' ? null : e.target.value === 'true' }))}
              />
              <Select
                label="ایمیل دانشجویی"
                options={[{ value: '', label: 'همه' }, { value: 'true', label: 'دارد' }, { value: 'false', label: 'ندارد' }]}
                value={filters.has_email == null ? '' : filters.has_email.toString()}
                onChange={e => setFilters(f => ({ ...f, page: 1, has_email: e.target.value === '' ? null : e.target.value === 'true' }))}
              />
            </div>
          </Card>
        )}

        {/* Table */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <CardTitle>لیست انجمن‌ها</CardTitle>
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
                      {['#', 'نام انجمن', 'دبیر', 'وضعیت فعالیت', 'لوگو', 'هدر', 'ایمیل', 'پیگیری'].map(h => (
                        <th key={h} className="text-right px-4 py-3 text-xs font-bold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-slate-400 text-xs">{formatPersianNumber((filters.page - 1) * filters.per_page + idx + 1)}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">{a.name}</p>
                          {a.missing_fields.length > 0 && (
                            <p className="text-xs text-warning-600 mt-0.5">{a.missing_fields.length} فیلد ناقص</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{a.secretary_name || <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={STATUS_BADGE[a.activity_status] || 'default'} size="sm" dot>{a.activity_status}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={LOGO_BADGE[a.logo_status] || 'default'} size="sm">{a.logo_status}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={LOGO_BADGE[a.header_status] || 'default'} size="sm">{a.header_status}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {a.student_email
                            ? <span className="text-xs text-success-700 bg-success-50 px-2 py-0.5 rounded-md font-medium">دارد</span>
                            : <span className="text-xs text-danger-600">ندارد</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          {a.needs_follow_up
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

export default AssociationsPage;
