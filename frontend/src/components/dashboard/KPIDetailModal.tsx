import React from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Minus } from 'lucide-react';
import type { Association, AssociationForm } from '@/types';

/* ── helpers ──────────────────────────────────────────────────────── */

const StatusDot: React.FC<{ value: string | null | undefined; positive?: string[] }> = ({ value, positive = ['دارد', 'فعال', 'تایید شده', 'بله', 'ثبت شده', 'برگزار شد', 'تکمیل شده'] }) => {
  if (!value || value === 'نامشخص') return <Minus size={14} className="text-gray-400" />;
  if (positive.includes(value)) return <CheckCircle size={14} className="text-[#7fa343]" />;
  return <XCircle size={14} className="text-red-500" />;
};

const Cell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) =>
  <td className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${className}`}>{children}</td>;

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{children}</th>;

/* ── associations table ───────────────────────────────────────────── */

const AssociationsTable: React.FC<{ rows: Association[] }> = ({ rows }) => (
  <table className="w-full text-right">
    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
      <tr>
        <Th>#</Th>
        <Th>نام انجمن</Th>
        <Th>دبیر</Th>
        <Th>وضعیت فعالیت</Th>
        <Th>لوگو</Th>
        <Th>هدر</Th>
        <Th>ایمیل دانشجویی</Th>
        <Th>پیگیری</Th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {rows.map((a, i) => (
        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
          <Cell className="text-gray-400 text-xs">{i + 1}</Cell>
          <Cell><span className="font-semibold text-gray-800">{a.name}</span></Cell>
          <Cell>{a.secretary_name || '—'}</Cell>
          <Cell>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              a.activity_status === 'فعال' ? 'bg-green-50 text-green-700' :
              a.activity_status === 'نیمه‌فعال' ? 'bg-yellow-50 text-yellow-700' :
              a.activity_status === 'کم‌فعالیت' ? 'bg-red-50 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {a.activity_status || 'نامشخص'}
            </span>
          </Cell>
          <Cell><StatusDot value={a.logo_status} /></Cell>
          <Cell><StatusDot value={a.header_status} /></Cell>
          <Cell>
            {a.student_email
              ? <span className="text-xs text-[#2174b8]">{a.student_email}</span>
              : <span className="text-xs text-red-400">ندارد</span>}
          </Cell>
          <Cell>
            {a.needs_follow_up
              ? <AlertCircle size={14} className="text-orange-500" />
              : <CheckCircle size={14} className="text-[#7fa343]" />}
          </Cell>
        </tr>
      ))}
    </tbody>
  </table>
);

/* ── forms table ──────────────────────────────────────────────────── */

const FormsTable: React.FC<{ rows: AssociationForm[] }> = ({ rows }) => (
  <table className="w-full text-right">
    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
      <tr>
        <Th>#</Th>
        <Th>نام انجمن</Th>
        <Th>عنوان رویداد</Th>
        <Th>نوع</Th>
        <Th>تاریخ</Th>
        <Th>وضعیت</Th>
        <Th>امضا کامل</Th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {rows.map((f, i) => (
        <tr key={f.id} className="hover:bg-gray-50 transition-colors">
          <Cell className="text-gray-400 text-xs">{i + 1}</Cell>
          <Cell><span className="font-semibold text-gray-800">{f.association_name}</span></Cell>
          <Cell>{f.workshop_title || f.competition_title || '—'}</Cell>
          <Cell>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              f.form_type === 'کارگاه' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
            }`}>
              {f.form_type}
            </span>
          </Cell>
          <Cell className="text-xs">{f.event_date || '—'}</Cell>
          <Cell>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              f.status === 'تایید شده' ? 'bg-green-50 text-green-700' :
              f.status === 'لغو شده'   ? 'bg-gray-100 text-gray-600' :
              f.status === 'ناقص'      ? 'bg-red-50 text-red-700' :
              'bg-yellow-50 text-yellow-700'
            }`}>
              {f.status}
            </span>
          </Cell>
          <Cell>
            {f.is_complete
              ? <CheckCircle size={14} className="text-[#7fa343]" />
              : <XCircle size={14} className="text-red-500" />}
          </Cell>
        </tr>
      ))}
    </tbody>
  </table>
);

/* ── modal ────────────────────────────────────────────────────────── */

interface KPIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  associations?: Association[];
  forms?: AssociationForm[];
}

export const KPIDetailModal: React.FC<KPIDetailModalProps> = ({
  isOpen, onClose, title, subtitle, associations, forms,
}) => {
  if (!isOpen) return null;

  const count = associations?.length ?? forms?.length ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col animate-fade-in"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-2xl flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, #2174b8, #7fa343)' }}
        >
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-white/75 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              {count} مورد
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle size={40} className="mb-3 text-gray-300" />
              <p className="text-sm">موردی برای نمایش وجود ندارد</p>
            </div>
          ) : associations ? (
            <AssociationsTable rows={associations} />
          ) : forms ? (
            <FormsTable rows={forms} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default KPIDetailModal;
