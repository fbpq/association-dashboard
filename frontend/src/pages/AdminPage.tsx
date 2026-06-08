import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Shield, ShieldCheck,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search,
} from 'lucide-react';
import { usersApi } from '@/services/api';
import type { ManagedUser, CreateUserRequest, UpdateUserRequest, UserRole } from '@/types';
import { Header } from '@/components/layout/Header';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { formatPersianDate } from '@/utils/helpers';

interface OutletCtx { onMobileMenuOpen: () => void }

const ROLE_LABEL: Record<UserRole, string> = {
  admin:     'مدیر کل',
  assistant: 'دستیار امور انجمن‌ها',
  viewer:    'کاربر عادی',
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin:     'bg-[#f0f7fd] text-[#2174b8] border border-[#aed2ef]',
  assistant: 'bg-[#f3f8ec] text-[#55702d] border border-[#c7e0a7]',
  viewer:    'bg-gray-50 text-gray-600 border border-gray-200',
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-black text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

export const AdminPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [users, setUsers]           = useState<ManagedUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editUser, setEditUser]     = useState<ManagedUser | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    usersApi.list().then(setUsers).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name.includes(search) || u.username.includes(search);
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total:     users.length,
    active:    users.filter(u => u.is_active).length,
    admins:    users.filter(u => u.role === 'admin').length,
    assistants:users.filter(u => u.role === 'assistant').length,
    viewers:   users.filter(u => u.role === 'viewer').length,
    inactive:  users.filter(u => !u.is_active).length,
  };

  const handleCreate = () => { setEditUser(null); setModalOpen(true); };
  const handleEdit   = (u: ManagedUser) => { setEditUser(u); setModalOpen(true); };

  const handleSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (editUser) {
      await usersApi.update(editUser.id, data as UpdateUserRequest);
      success('ذخیره شد', 'اطلاعات کاربر با موفقیت به‌روز شد');
    } else {
      await usersApi.create(data as CreateUserRequest);
      success('افزوده شد', 'کاربر جدید با موفقیت ایجاد شد');
    }
    load();
  };

  const handleToggleActive = async (u: ManagedUser) => {
    if (u.id === currentUser?.id) { toastError('خطا', 'نمی‌توانید حساب خودتان را غیرفعال کنید'); return; }
    try {
      await usersApi.update(u.id, { is_active: !u.is_active });
      success(u.is_active ? 'غیرفعال شد' : 'فعال شد', `حساب ${u.full_name} ${u.is_active ? 'غیرفعال' : 'فعال'} شد`);
      load();
    } catch { toastError('خطا', 'عملیات انجام نشد'); }
  };

  const handleDelete = async (u: ManagedUser) => {
    if (u.id === currentUser?.id) { toastError('خطا', 'نمی‌توانید حساب خودتان را حذف کنید'); return; }
    if (!confirm(`آیا از حذف کاربر «${u.full_name}» مطمئن هستید؟`)) return;
    setDeletingId(u.id);
    try {
      await usersApi.remove(u.id);
      success('حذف شد', `کاربر ${u.full_name} حذف شد`);
      load();
    } catch { toastError('خطا', 'حذف انجام نشد'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editUser={editUser}
      />

      <Header title="پنل مدیریت کاربران" subtitle="افزودن، ویرایش و کنترل سطح دسترسی کاربران" onMobileMenuOpen={onMobileMenuOpen} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users size={20} className="text-[#2174b8]" />}     label="کل کاربران"            value={stats.total}      color="bg-[#f0f7fd]" />
          <StatCard icon={<UserCheck size={20} className="text-[#7fa343]" />} label="کاربران فعال"           value={stats.active}     color="bg-[#f3f8ec]" />
          <StatCard icon={<ShieldCheck size={20} className="text-[#2174b8]"/>} label="دستیار امور انجمن‌ها" value={stats.assistants} color="bg-[#f0f7fd]" />
          <StatCard icon={<UserX size={20} className="text-red-500" />}       label="کاربران غیرفعال"       value={stats.inactive}   color="bg-red-50"    />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1">
              <Shield size={16} className="text-[#2174b8]" />
              <span className="text-sm font-bold text-gray-800">مدیریت کاربران</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0f7fd] text-[#2174b8] font-semibold">{users.length} کاربر</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-8 text-sm outline-none focus:border-[#2174b8] focus:ring-1 focus:ring-blue-100"
                />
                <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2174b8] cursor-pointer"
              >
                <option value="all">همه نقش‌ها</option>
                <option value="admin">مدیر کل</option>
                <option value="assistant">دستیار</option>
                <option value="viewer">کاربر عادی</option>
              </select>

              {/* Add button */}
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white whitespace-nowrap"
                style={{ background: 'linear-gradient(90deg, #2174b8, #7fa343)' }}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">افزودن کاربر</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'نام کامل', 'نام کاربری', 'سطح دسترسی', 'وضعیت', 'تاریخ ایجاد', 'عملیات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((u, i) => (
                      <tr key={u.id} className={`transition-colors hover:bg-gray-50 ${!u.is_active ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #2174b8, #7fa343)', color: '#fff' }}
                            >
                              {u.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{u.full_name}</p>
                              {u.position
                                ? <p className="text-xs text-gray-400 max-w-[160px] truncate">{u.position}</p>
                                : u.id === currentUser?.id && <p className="text-xs text-[#2174b8]">(شما)</p>
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{u.username}</code>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role]}`}>
                            {ROLE_LABEL[u.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-[#f3f8ec] text-[#55702d]' : 'bg-red-50 text-red-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-[#7fa343]' : 'bg-red-500'}`} />
                            {u.is_active ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatPersianDate(u.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(u)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#2174b8] hover:bg-[#f0f7fd] transition-colors"
                              title="ویرایش"
                            >
                              <Pencil size={14} />
                            </button>
                            {/* Toggle active */}
                            <button
                              onClick={() => handleToggleActive(u)}
                              disabled={u.id === currentUser?.id}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ color: u.is_active ? '#D97706' : '#7fa343' }}
                              title={u.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                            >
                              {u.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={deletingId === u.id || u.id === currentUser?.id}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title="حذف"
                            >
                              {deletingId === u.id
                                ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">کاربری یافت نشد</div>
            )}
          </div>
        </div>

        {/* Permission matrix */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#2174b8]" />
            جدول سطوح دسترسی
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-bold text-gray-500">بخش سامانه</th>
                  <th className="pb-3 text-xs font-bold text-[#2174b8] text-center">مدیر کل</th>
                  <th className="pb-3 text-xs font-bold text-[#7fa343] text-center">دستیار انجمن‌ها</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 text-center">کاربر عادی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['داشبورد و نمودارها', true, true, true],
                  ['آپلود فایل اکسل', true, true, false],
                  ['تاریخچه فایل‌ها', true, true, false],
                  ['جدول انجمن‌ها', true, true, false],
                  ['جدول فرم‌ها', true, true, false],
                  ['موارد نیازمند پیگیری', true, true, false],
                  ['گزارش‌ها و خروجی', true, true, false],
                  ['تنظیمات سامانه', true, false, false],
                  ['پنل مدیریت کاربران', true, false, false],
                ].map(([label, admin, assistant, viewer]) => (
                  <tr key={label as string}>
                    <td className="py-2.5 text-sm text-gray-700">{label as string}</td>
                    {[admin, assistant, viewer].map((v, i) => (
                      <td key={i} className="py-2.5 text-center">
                        {v
                          ? <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-[#f3f8ec]"><span className="w-2 h-2 rounded-full bg-[#7fa343]" /></span>
                          : <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-red-50"><span className="w-2 h-2 rounded-full bg-red-400" /></span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
