import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-primary-50 flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl font-black text-primary-200">۴۰۴</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-3">صفحه یافت نشد</h1>
        <p className="text-slate-500 leading-relaxed mb-8">
          صفحه‌ای که دنبالش بودید وجود ندارد یا آدرس آن تغییر کرده است.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="secondary" icon={<ArrowRight size={16} />}>
            بازگشت
          </Button>
          <Button onClick={() => navigate('/dashboard')} icon={<Home size={16} />} iconPosition="left">
            داشبورد اصلی
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
