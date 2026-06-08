import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Camera, X, Phone, Mail, BookOpen, Hash, Users, ChevronDown } from 'lucide-react';
import { dashboardApi, associationMembersApi } from '@/services/api';
import type { Association, AssociationMember } from '@/types';
import { Header } from '@/components/layout/Header';
import { useToast } from '@/context/ToastContext';

interface OutletCtx { onMobileMenuOpen: () => void }

const ROLE_COLOR: Record<string, string> = {
  secretary:      'bg-[#f0f7fd] text-[#2174b8] border-[#aed2ef]',
  vice_secretary: 'bg-[#f3f8ec] text-[#55702d] border-[#c7e0a7]',
  inspector:      'bg-amber-50   text-amber-700  border-amber-200',
  member1:        'bg-purple-50  text-purple-700 border-purple-200',
  member2:        'bg-pink-50    text-pink-700   border-pink-200',
  alternate:      'bg-gray-50    text-gray-600   border-gray-200',
};

const STATUS_STYLE: Record<string, string> = {
  'فعال':      'bg-[#f3f8ec] text-[#55702d]',
  'نیمه‌فعال': 'bg-amber-50 text-amber-700',
  'کم‌فعالیت': 'bg-red-50 text-red-600',
  'نامشخص':   'bg-gray-50 text-gray-500',
};

// ── Association card ──────────────────────────────────────────────────────────
const AssociationCard: React.FC<{
  assoc: Association;
  logo: string | null;
  onLogoUpload: (id: number, file: File) => void;
  onClick: () => void;
}> = ({ assoc, logo, onLogoUpload, onClick }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { error: toastError } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toastError('خطا', 'حجم تصویر باید کمتر از ۲ مگابایت باشد'); return; }
    if (!file.type.startsWith('image/')) { toastError('خطا', 'فقط فایل تصویری مجاز است'); return; }
    onLogoUpload(assoc.id, file);
    e.target.value = '';
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-card overflow-hidden cursor-pointer group transition-all hover:shadow-card-hover hover:-translate-y-0.5"
      onClick={onClick}
    >
      {/* Logo area */}
      <div className="relative h-32 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f7fd, #f3f8ec)' }}>
        {logo
          ? <img src={logo} alt={assoc.name} className="h-24 w-24 object-contain rounded-xl" />
          : (
            <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2174b8, #7fa343)' }}>
              <span className="text-3xl font-black text-white">{assoc.name.charAt(2)}</span>
            </div>
          )
        }
        {/* Upload overlay */}
        <button
          onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
          className="absolute bottom-2 left-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          style={{ background: '#2174b8' }}
          title="آپلود لوگو"
        >
          <Camera size={13} className="text-white" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {/* Status badge */}
        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[assoc.activity_status] ?? STATUS_STYLE['نامشخص']}`}>
          {assoc.activity_status}
        </span>
      </div>

      {/* Name */}
      <div className="px-4 py-3 text-center">
        <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{assoc.name}</p>
        {assoc.secretary_name && (
          <p className="text-xs text-gray-400 mt-1">دبیر: {assoc.secretary_name}</p>
        )}
      </div>
    </div>
  );
};

// ── Member detail modal ───────────────────────────────────────────────────────
const MemberModal: React.FC<{
  assoc: Association | null;
  members: AssociationMember[];
  loading: boolean;
  onClose: () => void;
}> = ({ assoc, members, loading, onClose }) => {
  if (!assoc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-2xl flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, #2174b8, #7fa343)' }}
        >
          <div>
            <h2 className="text-base font-bold text-white">{assoc.name}</h2>
            <p className="text-xs text-white/70 mt-0.5">اعضای هیأت مدیره</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Association info strip */}
        <div className="flex flex-wrap gap-4 px-6 py-3 border-b border-gray-100 text-xs text-gray-600 bg-gray-50/50 flex-shrink-0">
          {assoc.phone && (
            <span className="flex items-center gap-1"><Phone size={12} className="text-[#2174b8]" />{assoc.phone}</span>
          )}
          {assoc.student_email && (
            <span className="flex items-center gap-1"><Mail size={12} className="text-[#7fa343]" />{assoc.student_email}</span>
          )}
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[assoc.activity_status] ?? 'bg-gray-50 text-gray-500'}`}>
            {assoc.activity_status}
          </span>
        </div>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-7 h-7 border-2 border-[#2174b8] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">اطلاعات اعضا موجود نیست</p>
          ) : (
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2174b8, #7fa343)' }}
                  >
                    {m.full_name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{m.full_name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${ROLE_COLOR[m.role] ?? ROLE_COLOR.alternate}`}>
                        {m.role_label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      {m.national_id && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Hash size={11} />
                          <span>کد ملی: {m.national_id}</span>
                        </span>
                      )}
                      {m.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={11} />
                          <span>{m.phone}</span>
                        </span>
                      )}
                      {m.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail size={11} />
                          <span>{m.email}</span>
                        </span>
                      )}
                      {m.major && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <BookOpen size={11} />
                          <span>{m.major}</span>
                        </span>
                      )}
                      {m.semester && (
                        <span className="text-xs text-gray-400">ترم {m.semester}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export const AssociationDirectoryPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { success } = useToast();

  const [associations, setAssociations] = useState<Association[]>([]);
  const [logos,        setLogos]        = useState<Record<number, string>>({});
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [selected,     setSelected]     = useState<Association | null>(null);
  const [members,      setMembers]      = useState<AssociationMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Load associations
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getAssociations({ page: 1, per_page: 100 });
      setAssociations(res.items);
      // Load logos from localStorage
      const storedLogos: Record<number, string> = {};
      res.items.forEach(a => {
        const lg = localStorage.getItem(`assoc_logo_${a.id}`);
        if (lg) storedLogos[a.id] = lg;
      });
      setLogos(storedLogos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogoUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      localStorage.setItem(`assoc_logo_${id}`, base64);
      setLogos(prev => ({ ...prev, [id]: base64 }));
      success('آپلود شد', 'لوگوی انجمن ذخیره شد');
    };
    reader.readAsDataURL(file);
  };

  const handleCardClick = async (assoc: Association) => {
    setSelected(assoc);
    setMembersLoading(true);
    setMembers([]);
    try {
      const m = await associationMembersApi.getMembers(assoc.id);
      setMembers(m);
    } finally {
      setMembersLoading(false);
    }
  };

  const filtered = associations.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || (a.secretary_name ?? '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || a.activity_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <MemberModal
        assoc={selected}
        members={members}
        loading={membersLoading}
        onClose={() => setSelected(null)}
      />

      <Header
        title="دایرکتوری انجمن‌ها"
        subtitle="مشاهده کارت‌های انجمن‌ها و اطلاعات اعضای هیأت مدیره"
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجوی نام انجمن یا دبیر..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white outline-none focus:border-white/40 appearance-none pr-4 pl-8 cursor-pointer"
            >
              <option value="" className="text-gray-800 bg-white">همه وضعیت‌ها</option>
              <option value="فعال" className="text-gray-800 bg-white">فعال</option>
              <option value="نیمه‌فعال" className="text-gray-800 bg-white">نیمه‌فعال</option>
              <option value="کم‌فعالیت" className="text-gray-800 bg-white">کم‌فعالیت</option>
              <option value="نامشخص" className="text-gray-800 bg-white">نامشخص</option>
            </select>
            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-white/70">
            <Users size={13} />
            <span>{filtered.length} انجمن</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/50 text-sm">انجمنی یافت نشد</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(assoc => (
              <AssociationCard
                key={assoc.id}
                assoc={assoc}
                logo={logos[assoc.id] ?? null}
                onLogoUpload={handleLogoUpload}
                onClick={() => handleCardClick(assoc)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociationDirectoryPage;
