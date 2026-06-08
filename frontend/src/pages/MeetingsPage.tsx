import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search, Plus, Filter, ChevronDown, ChevronLeft, ChevronRight,
  CalendarDays, Clock, MapPin, Users, Pencil, Trash2, X,
} from 'lucide-react';
import { meetingsApi } from '@/services/api';
import { MOCK_ASSOCIATIONS } from '@/services/mockData';
import type { AssociationMeeting, MeetingType, MeetingStatus, CreateMeetingRequest } from '@/types';
import { Header } from '@/components/layout/Header';
import { useToast } from '@/context/ToastContext';
import { usePermission } from '@/hooks/usePermission';

interface OutletCtx { onMobileMenuOpen: () => void }

const MEETING_TYPES: MeetingType[] = ['عادی', 'فوری', 'هیئت‌رئیسه', 'مشترک'];
const MEETING_STATUSES: MeetingStatus[] = ['برنامه‌ریزی شده', 'برگزار شد', 'لغو شد'];

const TYPE_STYLE: Record<MeetingType, string> = {
  'عادی':        'bg-blue-50 text-blue-700',
  'فوری':        'bg-red-50 text-red-700',
  'هیئت‌رئیسه': 'bg-purple-50 text-purple-700',
  'مشترک':       'bg-teal-50 text-teal-700',
};

const STATUS_STYLE: Record<MeetingStatus, string> = {
  'برنامه‌ریزی شده': 'bg-amber-50 text-amber-700',
  'برگزار شد':       'bg-[#f3f8ec] text-[#55702d]',
  'لغو شد':          'bg-red-50 text-red-600',
};

const EMPTY_FORM: CreateMeetingRequest = {
  association_name: '',
  title: '',
  meeting_date: '',
  meeting_time: '',
  location: '',
  meeting_type: 'عادی',
  agenda: '',
  description: '',
  attendees_count: undefined,
  status: 'برنامه‌ریزی شده',
  decisions: '',
};

// ── Modal ─────────────────────────────────────────────────────────────────────

interface MeetingModalProps {
  meeting: AssociationMeeting | null;
  onClose: () => void;
  onSave: (data: CreateMeetingRequest) => Promise<void>;
}

const MeetingModal: React.FC<MeetingModalProps> = ({ meeting, onClose, onSave }) => {
  const [form, setForm] = useState<CreateMeetingRequest>(
    meeting
      ? {
          association_name: meeting.association_name,
          title: meeting.title,
          meeting_date: meeting.meeting_date,
          meeting_time: meeting.meeting_time,
          location: meeting.location ?? '',
          meeting_type: meeting.meeting_type,
          agenda: meeting.agenda ?? '',
          description: meeting.description ?? '',
          attendees_count: meeting.attendees_count ?? undefined,
          status: meeting.status,
          decisions: meeting.decisions ?? '',
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateMeetingRequest, string>>>({});

  const set = (key: keyof CreateMeetingRequest, value: string | number | undefined) =>
    setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.association_name.trim()) e.association_name = 'نام انجمن الزامی است';
    if (!form.title.trim()) e.title = 'عنوان جلسه الزامی است';
    if (!form.meeting_date.trim()) e.meeting_date = 'تاریخ جلسه الزامی است';
    if (!form.meeting_time.trim()) e.meeting_time = 'ساعت جلسه الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; error?: string }> =
    ({ label, required, children, error }) => (
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {label}{required && <span className="text-red-500 mr-0.5">*</span>}
        </label>
        {children}
        {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
      </div>
    );

  const inputCls = (err?: string) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${
      err ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#2174b8]'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">
            {meeting ? 'ویرایش جلسه' : 'ثبت جلسه جدید'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="نام انجمن" required error={errors.association_name}>
              <select
                value={form.association_name}
                onChange={e => set('association_name', e.target.value)}
                className={inputCls(errors.association_name)}
              >
                <option value="">انتخاب انجمن...</option>
                {MOCK_ASSOCIATIONS.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </Field>

            <Field label="نوع جلسه" required>
              <select
                value={form.meeting_type}
                onChange={e => set('meeting_type', e.target.value as MeetingType)}
                className={inputCls()}
              >
                {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <Field label="عنوان جلسه" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="مثال: جلسه برنامه‌ریزی ترم دوم"
              className={inputCls(errors.title)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="تاریخ جلسه" required error={errors.meeting_date}>
              <input
                type="text"
                value={form.meeting_date}
                onChange={e => set('meeting_date', e.target.value)}
                placeholder="مثال: ۱۴۰۳/۰۸/۱۵"
                className={inputCls(errors.meeting_date)}
              />
            </Field>

            <Field label="ساعت جلسه" required error={errors.meeting_time}>
              <input
                type="text"
                value={form.meeting_time}
                onChange={e => set('meeting_time', e.target.value)}
                placeholder="مثال: ۱۴:۳۰"
                className={inputCls(errors.meeting_time)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="مکان برگزاری">
              <input
                type="text"
                value={form.location ?? ''}
                onChange={e => set('location', e.target.value)}
                placeholder="مثال: اتاق شورا، ساختمان اداری"
                className={inputCls()}
              />
            </Field>

            <Field label="تعداد حاضرین">
              <input
                type="number"
                min={0}
                value={form.attendees_count ?? ''}
                onChange={e => set('attendees_count', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="مثال: ۱۰"
                className={inputCls()}
              />
            </Field>
          </div>

          <Field label="دستور جلسه">
            <textarea
              value={form.agenda ?? ''}
              onChange={e => set('agenda', e.target.value)}
              placeholder="موضوعات مطرح‌شده در این جلسه..."
              rows={2}
              className={`${inputCls()} resize-none`}
            />
          </Field>

          <Field label="توضیحات جلسه">
            <textarea
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              placeholder="شرح مختصر جلسه و اتفاقات آن..."
              rows={3}
              className={`${inputCls()} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="وضعیت جلسه" required>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as MeetingStatus)}
                className={inputCls()}
              >
                {MEETING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="مصوبات جلسه">
            <textarea
              value={form.decisions ?? ''}
              onChange={e => set('decisions', e.target.value)}
              placeholder="تصمیمات و مصوبات اتخاذشده در جلسه..."
              rows={2}
              className={`${inputCls()} resize-none`}
            />
          </Field>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#2174b8] hover:bg-[#1a5f9e] transition-colors disabled:opacity-60"
          >
            {saving ? 'در حال ذخیره...' : meeting ? 'ذخیره تغییرات' : 'ثبت جلسه'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────

const DetailModal: React.FC<{ meeting: AssociationMeeting; onClose: () => void }> = ({ meeting, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-800">جزئیات جلسه</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">انجمن</p>
          <p className="font-semibold text-gray-800">{meeting.association_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">عنوان جلسه</p>
          <p className="font-semibold text-gray-800">{meeting.title}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">تاریخ</p>
            <p className="text-sm text-gray-700 flex items-center gap-1.5"><CalendarDays size={13} className="text-[#2174b8]" />{meeting.meeting_date}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">ساعت</p>
            <p className="text-sm text-gray-700 flex items-center gap-1.5"><Clock size={13} className="text-[#2174b8]" />{meeting.meeting_time}</p>
          </div>
        </div>
        {meeting.location && (
          <div>
            <p className="text-xs text-gray-400 mb-1">مکان</p>
            <p className="text-sm text-gray-700 flex items-center gap-1.5"><MapPin size={13} className="text-[#2174b8]" />{meeting.location}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">نوع جلسه</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_STYLE[meeting.meeting_type]}`}>{meeting.meeting_type}</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">وضعیت</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[meeting.status]}`}>{meeting.status}</span>
          </div>
        </div>
        {meeting.attendees_count != null && (
          <div>
            <p className="text-xs text-gray-400 mb-1">تعداد حاضرین</p>
            <p className="text-sm text-gray-700 flex items-center gap-1.5"><Users size={13} className="text-[#2174b8]" />{meeting.attendees_count.toLocaleString('fa')} نفر</p>
          </div>
        )}
        {meeting.agenda && (
          <div>
            <p className="text-xs text-gray-400 mb-1">دستور جلسه</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{meeting.agenda}</p>
          </div>
        )}
        {meeting.description && (
          <div>
            <p className="text-xs text-gray-400 mb-1">توضیحات</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{meeting.description}</p>
          </div>
        )}
        {meeting.decisions && (
          <div>
            <p className="text-xs text-gray-400 mb-1">مصوبات جلسه</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-[#f3f8ec] rounded-lg p-3">{meeting.decisions}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export const MeetingsPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { success: toastSuccess, error: toastError } = useToast();
  const { isAdmin, isAssistant } = usePermission();
  const canEdit = isAdmin || isAssistant;

  const [items,        setItems]        = useState<AssociationMeeting[]>([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState<MeetingType | ''>('');
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | ''>('');

  const [editTarget,    setEditTarget]    = useState<AssociationMeeting | null>(null);
  const [showForm,      setShowForm]      = useState(false);
  const [detailTarget,  setDetailTarget]  = useState<AssociationMeeting | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<AssociationMeeting | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  const PER_PAGE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await meetingsApi.list({
        page, per_page: PER_PAGE, search,
        meeting_type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch {
      toastError('خطا', 'بارگذاری جلسات ناموفق بود');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter]);

  const openAdd = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = (m: AssociationMeeting) => { setEditTarget(m); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditTarget(null); };

  const handleSave = async (data: CreateMeetingRequest) => {
    try {
      if (editTarget) {
        await meetingsApi.update(editTarget.id, data);
        toastSuccess('ویرایش موفق', 'جلسه با موفقیت ویرایش شد');
      } else {
        await meetingsApi.create(data);
        toastSuccess('ثبت موفق', 'جلسه جدید با موفقیت ثبت شد');
      }
      closeForm();
      load();
    } catch {
      toastError('خطا', 'ذخیره جلسه ناموفق بود');
      throw new Error('save failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await meetingsApi.remove(deleteTarget.id);
      toastSuccess('حذف موفق', 'جلسه با موفقیت حذف شد');
      setDeleteTarget(null);
      load();
    } catch {
      toastError('خطا', 'حذف جلسه ناموفق بود');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="جلسات انجمن‌ها"
        subtitle="مشاهده، ثبت و مدیریت جلسات انجمن‌های دانشجویی"
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          canEdit ? (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2174b8] hover:bg-[#1a5f9e] transition-colors shadow-sm"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">ثبت جلسه جدید</span>
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
            <input
              type="text"
              placeholder="جستجوی انجمن، عنوان یا مکان..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 pr-9 text-sm text-white placeholder-white/50 outline-none focus:border-white/40"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as MeetingType | '')}
              className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 pr-4 pl-8 text-sm text-white outline-none focus:border-white/40 appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-800 bg-white">همه انواع</option>
              {MEETING_TYPES.map(t => <option key={t} value={t} className="text-gray-800 bg-white">{t}</option>)}
            </select>
            <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as MeetingStatus | '')}
              className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 pr-4 pl-8 text-sm text-white outline-none focus:border-white/40 appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-800 bg-white">همه وضعیت‌ها</option>
              {MEETING_STATUSES.map(s => <option key={s} value={s} className="text-gray-800 bg-white">{s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-white/70">
            <Filter size={12} />
            <span>{total} جلسه</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 border-2 border-[#2174b8] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">جلسه‌ای یافت نشد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">انجمن</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">عنوان جلسه</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">تاریخ و ساعت</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">مکان</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">نوع</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">حاضرین</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">وضعیت</th>
                    {canEdit && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody>
                  {canEdit && (
                    <tr>
                      <td colSpan={canEdit ? 8 : 7} className="px-4 py-2 border-b border-gray-100">
                        <button
                          onClick={openAdd}
                          className="flex items-center gap-2 text-[#2174b8] text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus size={13} />
                          افزودن جلسه جدید
                        </button>
                      </td>
                    </tr>
                  )}
                  {items.map((m, idx) => (
                    <tr
                      key={m.id}
                      onClick={() => setDetailTarget(m)}
                      className={`border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer ${idx % 2 === 0 ? '' : 'bg-gray-50/20'}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs">{m.association_name}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs max-w-48 truncate font-medium">{m.title}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1"><CalendarDays size={11} />{m.meeting_date}</div>
                        <div className="flex items-center gap-1 mt-0.5"><Clock size={11} />{m.meeting_time}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-36 truncate">
                        {m.location ? <span className="flex items-center gap-1"><MapPin size={11} />{m.location}</span> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[m.meeting_type]}`}>
                          {m.meeting_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 text-center">
                        {m.attendees_count != null
                          ? <span className="flex items-center gap-1 justify-center"><Users size={11} />{m.attendees_count.toLocaleString('fa')}</span>
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[m.status]}`}>
                          {m.status}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(m)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-[#2174b8] transition-colors"
                              title="ویرایش"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(m)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
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

      {/* Modals */}
      {showForm && (
        <MeetingModal
          meeting={editTarget}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      {detailTarget && !showForm && (
        <DetailModal
          meeting={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">حذف جلسه</h3>
            <p className="text-sm text-gray-500 mb-5">
              آیا از حذف جلسه «{deleteTarget.title}» مطمئن هستید؟ این عمل غیرقابل بازگشت است.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleting ? 'در حال حذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
