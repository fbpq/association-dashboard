import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, User, Lock, Shield, Briefcase } from 'lucide-react';
import type { ManagedUser, UserRole, CreateUserRequest, UpdateUserRequest } from '@/types';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin',     label: 'مدیر کل',               description: 'دسترسی کامل به همه بخش‌ها' },
  { value: 'assistant', label: 'دستیار امور انجمن‌ها', description: 'آپلود، مشاهده، گزارش — بدون تنظیمات' },
  { value: 'viewer',    label: 'کاربر عادی',            description: 'فقط مشاهده داشبورد و نمودارها' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  editUser?: ManagedUser | null;
}

export const UserFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, editUser }) => {
  const isEdit = !!editUser;

  const [fullName,    setFullName]    = useState('');
  const [username,    setUsername]    = useState('');
  const [position,    setPosition]    = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [role,        setRole]        = useState<UserRole>('viewer');
  const [isActive,    setIsActive]    = useState(true);
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        setFullName(editUser.full_name);
        setUsername(editUser.username);
        setPosition(editUser.position ?? '');
        setRole(editUser.role);
        setIsActive(editUser.is_active);
        setPassword('');
        setConfirmPass('');
      } else {
        setFullName(''); setUsername(''); setPosition('');
        setPassword(''); setConfirmPass(''); setRole('viewer'); setIsActive(true);
      }
      setErrors({});
    }
  }, [isOpen, editUser]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'نام کامل الزامی است';
    if (!isEdit && !username.trim()) errs.username = 'نام کاربری الزامی است';
    if (!isEdit && !password) errs.password = 'رمز عبور الزامی است';
    if (!isEdit && password && password.length < 6) errs.password = 'حداقل ۶ کاراکتر';
    if (!isEdit && password !== confirmPass) errs.confirmPass = 'رمز عبور مطابقت ندارد';
    if (isEdit && password && password.length < 6) errs.password = 'حداقل ۶ کاراکتر';
    if (isEdit && password && password !== confirmPass) errs.confirmPass = 'رمز عبور مطابقت ندارد';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        const data: UpdateUserRequest = { full_name: fullName, role, is_active: isActive, position: position.trim() || undefined };
        if (password) data.password = password;
        await onSubmit(data);
      } else {
        await onSubmit({ full_name: fullName, username: username.trim(), password, role, position: position.trim() || undefined } as CreateUserRequest);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = (err?: string) =>
    `w-full rounded-xl border px-4 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:ring-2 ${
      err ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-200 hover:border-gray-300 focus:border-[#2174b8] focus:ring-blue-100'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-2xl sticky top-0 z-10"
          style={{ background: 'linear-gradient(90deg, #2174b8, #7fa343)' }}
        >
          <h2 className="text-base font-bold text-white">
            {isEdit ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {/* Full name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">نام کامل</label>
            <div className="relative">
              <input type="text" placeholder="مثال: علی محمدی" value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls(errors.fullName)} />
              <User size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          {/* Username (create only) */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">نام کاربری</label>
              <div className="relative">
                <input type="text" placeholder="مثال: ali" value={username} onChange={e => setUsername(e.target.value)} className={inputCls(errors.username)} autoComplete="off" />
                <User size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
            </div>
          )}

          {/* Position */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">سمت / عنوان شغلی</label>
            <div className="relative">
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className={inputCls() + ' appearance-none cursor-pointer'}
              >
                <option value="">انتخاب کنید...</option>
                <option value="مدیر کل سامانه انجمن‌ها">مدیر کل سامانه انجمن‌ها</option>
                <option value="رئیس اداره انجمن‌ها، تیم‌های علمی و فناوری">رئیس اداره انجمن‌ها، تیم‌های علمی و فناوری</option>
                <option value="کارشناس مسئول نشریات علمی-دانشجویی و مسئول بازدیدها">کارشناس مسئول نشریات علمی-دانشجویی و مسئول بازدیدها</option>
                <option value="مسئول راهبری کارگاه‌های انجمن‌ها، لوگو و مُهر انجمن‌ها و آرشیو اطلاعات">مسئول راهبری کارگاه‌های انجمن‌ها، لوگو و مُهر انجمن‌ها و آرشیو اطلاعات</option>
                <option value="دستیار فناوری اطلاعات">دستیار فناوری اطلاعات</option>
                <option value="دستیار علمی و پژوهشی">دستیار علمی و پژوهشی</option>
                <option value="دستیار امور انجمن‌ها">دستیار امور انجمن‌ها</option>
                <option value="همکار دانشجو امور انجمن‌ها">همکار دانشجو امور انجمن‌ها</option>
                <option value="همکار دانشجو فناوری اطلاعات">همکار دانشجو فناوری اطلاعات</option>
                <option value="همکار دانشجو علمی و پژوهشی">همکار دانشجو علمی و پژوهشی</option>
                <option value="کاربر سامانه">کاربر سامانه</option>
              </select>
              <Briefcase size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {isEdit ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور'}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={isEdit ? 'خالی بگذارید تا تغییر نکند' : 'حداقل ۶ کاراکتر'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls(errors.password) + ' pl-10'}
                autoComplete="new-password"
              />
              <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          {(!isEdit || password) && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">تأیید رمز عبور</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="تکرار رمز عبور" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={inputCls(errors.confirmPass) + ' pl-10'} autoComplete="new-password" />
                <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.confirmPass && <p className="text-xs text-red-600 mt-1">{errors.confirmPass}</p>}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">سطح دسترسی</label>
            <div className="space-y-2">
              {ROLE_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    role === opt.value ? 'border-[#2174b8] bg-[#f0f7fd]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" name="role" value={opt.value} checked={role === opt.value} onChange={() => setRole(opt.value)} className="mt-0.5 accent-[#2174b8]" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Active status (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">وضعیت حساب</span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(s => !s)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-[#7fa343]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isActive ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
              style={{ background: 'linear-gradient(90deg, #2174b8, #7fa343)' }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : isEdit ? 'ذخیره تغییرات' : 'افزودن کاربر'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
