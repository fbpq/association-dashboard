import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, RefreshCw, Shield, Phone, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import logoSrc from '@/assets/logo.png';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function makeCaptcha(): string {
  return Array.from({ length: 5 }, () =>
    CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)],
  ).join('');
}

const CHAR_STYLES = [
  { color: '#2174b8', rotate: '-8deg', ty: '-2px' },
  { color: '#7fa343', rotate: '5deg',  ty: '3px'  },
  { color: '#c0392b', rotate: '-3deg', ty: '-1px' },
  { color: '#8b5cf6', rotate: '7deg',  ty: '2px'  },
  { color: '#0891b2', rotate: '-5deg', ty: '1px'  },
];

const CaptchaDisplay: React.FC<{ code: string }> = ({ code }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', userSelect: 'none', fontFamily: 'courier, monospace' }}>
    {code.split('').map((ch, i) => (
      <span
        key={i}
        style={{
          color: CHAR_STYLES[i].color,
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'inline-block',
          transform: `rotate(${CHAR_STYLES[i].rotate}) translateY(${CHAR_STYLES[i].ty})`,
          textShadow: '1px 1px 0 rgba(0,0,0,0.1)',
        }}
      >
        {ch}
      </span>
    ))}
  </span>
);

export const LoginPage: React.FC = () => {
  const [nationalId, setNationalId]     = useState('');
  const [phone, setPhone]               = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode]   = useState(makeCaptcha);
  const [isLoading, setIsLoading]       = useState(false);
  const [errors, setErrors] = useState<{
    nationalId?: string;
    phone?: string;
    captcha?: string;
    general?: string;
  }>({});

  const { login }                      = useAuth();
  const { success, error: toastError } = useToast();
  const navigate                       = useNavigate();

  const refreshCaptcha = () => {
    setCaptchaCode(makeCaptcha());
    setCaptchaInput('');
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!nationalId.trim()) errs.nationalId = 'کد ملی الزامی است';
    if (!phone.trim())      errs.phone      = 'شماره همراه الزامی است';
    if (!captchaInput.trim()) errs.captcha  = 'کد امنیتی الزامی است';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await login({ username: nationalId.trim(), password: phone.trim() });
      success('ورود موفق', 'خوش آمدید!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطا در ورود به سامانه';
      setErrors({ general: msg });
      toastError('ورود ناموفق', msg);
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (err?: string) =>
    [
      'w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-800',
      'placeholder-gray-400 transition-all outline-none focus:ring-2',
      err
        ? 'border-red-400 bg-red-50 focus:ring-red-200'
        : 'border-gray-200 hover:border-gray-300 focus:border-[#2174b8] focus:ring-blue-100',
    ].join(' ');

  return (
    <div
      className="min-h-screen flex"
      dir="rtl"
      style={{ background: 'linear-gradient(to right, #6d9438 0%, #1e6fbb 100%)' }}
    >
      {/* ── Left: form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md bg-white rounded-3xl p-8"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
        >
          {/* Header */}
          <div className="mb-7">
            <h2 className="text-2xl font-black" style={{ color: '#333333' }}>خوش آمدید</h2>
            <p className="text-sm text-gray-500 mt-1">برای ورود اطلاعات کاربری خود را وارد کنید</p>
          </div>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <img src={logoSrc} alt="لوگو" className="w-10 h-10 object-contain flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-gray-800">سامانه باشگاه پژوهشگران جوان و نخبگان</p>
              <p className="text-xs text-gray-500">دانشگاه آزاد اسلامی</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* کد ملی */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="نام کاربر را وارد کنید"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  className={inputCls(errors.nationalId)}
                  autoFocus
                  autoComplete="username"
                />
                <User size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.nationalId && <p className="text-xs text-red-600 mt-1 pr-1">{errors.nationalId}</p>}
            </div>

            {/* شماره همراه */}
            <div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="گذرواژه خود را وارد کنید"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={inputCls(errors.phone)}
                  autoComplete="current-password"
                />
                <Phone size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.phone && <p className="text-xs text-red-600 mt-1 pr-1">{errors.phone}</p>}
            </div>

            {/* کد امنیتی */}
            <div>
              <div className="flex gap-2 items-stretch">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-1 transition-colors text-gray-400 hover:text-[#2174b8]"
                    title="تازه‌سازی کد امنیتی"
                  >
                    <RefreshCw size={15} />
                  </button>
                  <div
                    className="h-11 w-28 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #fef9f0, #f0f9e8)' }}
                  >
                    <CaptchaDisplay code={captchaCode} />
                  </div>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="کد امنیتی"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    className={inputCls(errors.captcha)}
                    autoComplete="off"
                  />
                  <Shield size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {errors.captcha && <p className="text-xs text-red-600 mt-1 pr-1">{errors.captcha}</p>}
            </div>

            {errors.general && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
                {errors.general}
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-70"
              style={{
                background: isLoading ? '#9ca3af' : 'linear-gradient(90deg, #2174b8, #7fa343)',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(33,116,184,0.35)',
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>ورود به سامانه</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* ── Right: branding ────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/[0.03]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-56 h-56 mb-8" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))' }}>
            <img src={logoSrc} alt="لوگوی باشگاه پژوهشگران" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white leading-relaxed mb-6">
            سامانه جامع باشگاه<br />پژوهشگران جوان و نخبگان<br />واحد علوم و تحقیقات
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
