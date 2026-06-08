import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User, Mail, Phone, Building2, Briefcase, FileText,
  Camera, Lock, Eye, EyeOff, Save, CheckCircle2, BadgeCheck,
} from 'lucide-react';
import { profileApi } from '@/services/api';
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '@/types';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPersianDate } from '@/utils/helpers';

interface OutletCtx { onMobileMenuOpen: () => void }

const ROLE_LABEL: Record<string, string> = {
  admin:     'مدیر کل',
  assistant: 'دستیار امور انجمن‌ها',
  viewer:    'کاربر عادی',
};

const ROLE_BADGE: Record<string, string> = {
  admin:     'bg-[#f0f7fd] text-[#2174b8] border border-[#aed2ef]',
  assistant: 'bg-[#f3f8ec] text-[#55702d] border border-[#c7e0a7]',
  viewer:    'bg-gray-50 text-gray-600 border border-gray-200',
};

const inputBase =
  'w-full rounded-xl border px-4 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:ring-2';
const inputNormal = `${inputBase} border-gray-200 hover:border-gray-300 focus:border-[#2174b8] focus:ring-blue-100`;
const inputError  = `${inputBase} border-red-400 bg-red-50 focus:ring-red-200`;
const inputCls = (err?: string) => err ? inputError : inputNormal;

export const ProfilePage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { user, updateUser, setAvatarUrl } = useAuth();
  const { success, error: toastError } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile,        setProfile]        = useState<UserProfile>({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Personal info fields
  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [department,  setDepartment]  = useState('');
  const [position,    setPosition]    = useState('');
  const [bio,         setBio]         = useState('');
  const [savingInfo,  setSavingInfo]  = useState(false);

  // Password fields
  const [currentPass,  setCurrentPass]  = useState('');
  const [newPass,      setNewPass]      = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [savingPass,   setSavingPass]   = useState(false);
  const [passErrors,   setPassErrors]   = useState<Record<string, string>>({});

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const p = await profileApi.get(user.id);
      setProfile(p);
      setFullName(user.full_name);
      setEmail(p.email ?? '');
      setPhone(p.phone ?? '');
      setDepartment(p.department ?? '');
      setPosition(p.position ?? '');
      setBio(p.bio ?? '');
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // ── Avatar ──────────────────────────────────────────────────────────────────

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toastError('خطا', 'حجم تصویر باید کمتر از ۲ مگابایت باشد');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toastError('خطا', 'فقط فایل تصویری مجاز است');
      return;
    }
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const base64 = ev.target?.result as string;
      try {
        await profileApi.update(user.id, { avatar: base64 });
        setProfile(prev => ({ ...prev, avatar: base64 }));
        setAvatarUrl(base64);
        success('آپلود شد', 'تصویر پروفایل با موفقیت ذخیره شد');
      } catch {
        toastError('خطا', 'آپلود تصویر ناموفق بود');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    await profileApi.update(user.id, { avatar: '' });
    setProfile(prev => ({ ...prev, avatar: undefined }));
    setAvatarUrl(null);
    success('حذف شد', 'تصویر پروفایل حذف شد');
  };

  // ── Personal info ────────────────────────────────────────────────────────────

  const handleSaveInfo = async () => {
    if (!user) return;
    setSavingInfo(true);
    try {
      const data: UpdateProfileRequest = {
        full_name:  fullName.trim()   || undefined,
        email:      email.trim()      || undefined,
        phone:      phone.trim()      || undefined,
        department: department.trim() || undefined,
        position:   position.trim()   || undefined,
        bio:        bio.trim()        || undefined,
      };
      await profileApi.update(user.id, data);
      if (fullName.trim()) updateUser({ full_name: fullName.trim() });
      setProfile(prev => ({ ...prev, ...data }));
      success('ذخیره شد', 'اطلاعات پروفایل با موفقیت به‌روز شد');
    } catch {
      toastError('خطا', 'ذخیره‌سازی ناموفق بود');
    } finally {
      setSavingInfo(false);
    }
  };

  // ── Password ─────────────────────────────────────────────────────────────────

  const handleChangePassword = async () => {
    const errs: Record<string, string> = {};
    if (!newPass) errs.newPass = 'رمز عبور جدید الزامی است';
    else if (newPass.length < 6) errs.newPass = 'حداقل ۶ کاراکتر';
    if (newPass && newPass !== confirmPass) errs.confirmPass = 'رمز عبور مطابقت ندارد';
    setPassErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!user) return;
    setSavingPass(true);
    try {
      const data: ChangePasswordRequest = {
        current_password: currentPass || undefined,
        new_password: newPass,
      };
      await profileApi.changePassword(user.id, data);
      success('تغییر یافت', 'رمز عبور با موفقیت تغییر کرد');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err: unknown) {
      toastError('خطا', err instanceof Error ? err.message : 'تغییر رمز ناموفق بود');
    } finally {
      setSavingPass(false);
    }
  };

  const avatar   = profile.avatar;
  const initials = user?.full_name?.slice(0, 2) ?? '';

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <Header
        title="پروفایل کاربری"
        subtitle="مشاهده و ویرایش اطلاعات حساب کاربری"
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {loadingProfile ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#2174b8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* ── Column 1: avatar + account summary ────────────────────────── */}
            <div className="space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col items-center text-center">
                {/* Avatar circle */}
                <div className="relative mb-4">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex items-center justify-center"
                    style={{ background: avatar ? undefined : 'linear-gradient(135deg, #2174b8, #7fa343)' }}
                  >
                    {avatar
                      ? <img src={avatar} alt="پروفایل" className="w-full h-full object-cover" />
                      : <span className="text-3xl font-black text-white select-none">{initials}</span>
                    }
                  </div>
                  {/* Camera button */}
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    title="تغییر تصویر"
                    className="absolute bottom-0 left-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
                    style={{ background: '#2174b8' }}
                    onMouseEnter={e => { if (!uploadingAvatar) (e.currentTarget as HTMLButtonElement).style.background = '#1a5e97'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2174b8'; }}
                  >
                    {uploadingAvatar
                      ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera size={14} className="text-white" />
                    }
                  </button>
                </div>

                <h2 className="text-base font-bold text-gray-900">{user?.full_name}</h2>
                <p className="text-xs text-gray-400 mt-0.5 mb-3 font-mono">@{user?.username}</p>

                {user && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[user.role]}`}>
                    <BadgeCheck size={12} />
                    {ROLE_LABEL[user.role]}
                  </span>
                )}

                {avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    حذف تصویر
                  </button>
                )}

                <p className="text-[11px] text-gray-300 mt-4 leading-5">
                  حجم مجاز: حداکثر ۲ مگابایت<br />فرمت: JPG، PNG، WEBP
                </p>
              </div>

              {/* Account summary card */}
              <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100">اطلاعات حساب</h3>
                <SummaryRow label="نام کاربری">
                  <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{user?.username}</code>
                </SummaryRow>
                <SummaryRow label="نقش">
                  {user && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_BADGE[user.role]}`}>{ROLE_LABEL[user.role]}</span>}
                </SummaryRow>
                <SummaryRow label="وضعیت">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user?.is_active ? 'bg-[#f3f8ec] text-[#55702d]' : 'bg-red-50 text-red-600'}`}>
                    {user?.is_active ? 'فعال' : 'غیرفعال'}
                  </span>
                </SummaryRow>
                <SummaryRow label="عضویت از">
                  <span className="text-xs text-gray-600">{user ? formatPersianDate(user.created_at) : '—'}</span>
                </SummaryRow>
                {profile.email && (
                  <SummaryRow label="ایمیل">
                    <span className="text-xs text-gray-600 truncate max-w-[140px]">{profile.email}</span>
                  </SummaryRow>
                )}
                {profile.phone && (
                  <SummaryRow label="تماس">
                    <span className="text-xs text-gray-600">{profile.phone}</span>
                  </SummaryRow>
                )}
                {profile.department && (
                  <SummaryRow label="واحد">
                    <span className="text-xs text-gray-600">{profile.department}</span>
                  </SummaryRow>
                )}
              </div>
            </div>

            {/* ── Column 2: forms ───────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Personal info card */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <User size={15} className="text-[#2174b8]" />
                  اطلاعات شخصی
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Full name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">نام کامل</label>
                    <div className="relative">
                      <User size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className={inputCls()}
                        placeholder="نام و نام خانوادگی"
                      />
                    </div>
                  </div>

                  {/* Username (read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">نام کاربری</label>
                    <div className="relative">
                      <User size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <input
                        type="text"
                        value={user?.username ?? ''}
                        readOnly
                        className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">آدرس ایمیل</label>
                    <div className="relative">
                      <Mail size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={inputCls()}
                        placeholder="example@iau.ac.ir"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">شماره تماس</label>
                    <div className="relative">
                      <Phone size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={inputCls()}
                        placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">واحد / دانشکده</label>
                    <div className="relative">
                      <Building2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className={inputCls()}
                        placeholder="مثال: معاونت فرهنگی"
                      />
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">سمت / عنوان شغلی</label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={position}
                        onChange={e => setPosition(e.target.value)}
                        className={inputCls()}
                        placeholder="مثال: کارشناس انجمن‌ها"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">درباره من</label>
                  <div className="relative">
                    <FileText size={14} className="absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      className={`${inputCls()} pt-2.5 resize-none`}
                      placeholder="یک توضیح کوتاه درباره خودتان..."
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-5">
                  <GradientButton onClick={handleSaveInfo} loading={savingInfo} icon={<Save size={15} />}>
                    ذخیره اطلاعات
                  </GradientButton>
                </div>
              </div>

              {/* Change password card */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <Lock size={15} className="text-[#2174b8]" />
                  تغییر رمز عبور
                </h3>

                <div className="space-y-4 max-w-md">

                  {/* Current password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">رمز عبور فعلی</label>
                    <div className="relative">
                      <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={currentPass}
                        onChange={e => setCurrentPass(e.target.value)}
                        className={`${inputNormal} pl-10`}
                        placeholder="رمز عبور فعلی را وارد کنید"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">رمز عبور جدید</label>
                    <div className="relative">
                      <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        className={`${inputCls(passErrors.newPass)} pl-10`}
                        placeholder="حداقل ۶ کاراکتر"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {passErrors.newPass && <p className="text-xs text-red-600 mt-1">{passErrors.newPass}</p>}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">تأیید رمز عبور جدید</label>
                    <div className="relative">
                      <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={confirmPass}
                        onChange={e => setConfirmPass(e.target.value)}
                        className={inputCls(passErrors.confirmPass)}
                        placeholder="رمز عبور جدید را تکرار کنید"
                        autoComplete="new-password"
                      />
                    </div>
                    {passErrors.confirmPass && <p className="text-xs text-red-600 mt-1">{passErrors.confirmPass}</p>}
                  </div>
                </div>

                <div className="flex justify-end mt-5">
                  <GradientButton onClick={handleChangePassword} loading={savingPass} icon={<CheckCircle2 size={15} />}>
                    تغییر رمز عبور
                  </GradientButton>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

// ── Small helpers ─────────────────────────────────────────────────────────────

const SummaryRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
    <span className="flex items-center">{children}</span>
  </div>
);

const GradientButton: React.FC<{
  onClick: () => void;
  loading: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ onClick, loading, icon, children }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-70 transition-opacity"
    style={{ background: 'linear-gradient(90deg, #2174b8, #7fa343)' }}
  >
    {loading
      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      : icon
    }
    {children}
  </button>
);
