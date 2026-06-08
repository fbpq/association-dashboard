import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { filesApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatFileSize } from '@/utils/helpers';

interface OutletCtx { onMobileMenuOpen: () => void }

interface UploadItem {
  id: string;
  file: File;
  fileType: string;
  progress: number;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  message?: string;
  recordCount?: number;
}

const FILE_TYPE_OPTIONS = [
  { value: 'associations', label: 'فایل انجمن‌ها' },
  { value: 'forms', label: 'فایل فرم‌ها' },
];

const ACCEPTED_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
};

export const UploadPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { success, error: toastError, info } = useToast();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [defaultFileType, setDefaultFileType] = useState('associations');

  const updateUpload = (id: string, patch: Partial<UploadItem>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  };

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const newItems: UploadItem[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      fileType: defaultFileType,
      progress: 0,
      status: 'waiting',
    }));
    setUploads(prev => [...newItems, ...prev]);
  }, [defaultFileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (rejections) => {
      rejections.forEach(r => {
        if (r.errors[0]?.code === 'file-too-large') toastError('فایل بزرگ است', 'حداکثر حجم فایل ۱۰ مگابایت است.');
        else toastError('فرمت نادرست', 'فقط فایل‌های Excel (.xlsx, .xls) پذیرفته می‌شوند.');
      });
    },
  });

  const startUpload = async (item: UploadItem) => {
    updateUpload(item.id, { status: 'uploading', progress: 0 });
    try {
      const result = await filesApi.upload(item.file, item.fileType, (progress) => {
        updateUpload(item.id, { progress });
      });
      updateUpload(item.id, {
        status: 'success',
        progress: 100,
        message: `پردازش موفق — ${result.record_count || 0} رکورد استخراج شد`,
        recordCount: result.record_count || 0,
      });
      success('آپلود موفق', `فایل «${item.file.name}» با موفقیت بارگذاری و پردازش شد.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در آپلود';
      updateUpload(item.id, { status: 'error', message });
      toastError('خطا در آپلود', message);
    }
  };

  const uploadAll = async () => {
    const waiting = uploads.filter(u => u.status === 'waiting');
    if (waiting.length === 0) { info('توجه', 'فایلی در انتظار آپلود وجود ندارد.'); return; }
    info('آپلود آغاز شد', `${waiting.length} فایل در حال آپلود است.`);
    for (const item of waiting) await startUpload(item);
  };

  const removeUpload = (id: string) => setUploads(prev => prev.filter(u => u.id !== id));
  const clearCompleted = () => setUploads(prev => prev.filter(u => u.status !== 'success' && u.status !== 'error'));

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="آپلود فایل‌ها"
        subtitle="فایل‌های اکسل انجمن‌ها و فرم‌ها را بارگذاری کنید"
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          uploads.some(u => u.status === 'waiting') && (
            <Button size="sm" icon={<Upload size={14} />} onClick={uploadAll}>
              آپلود همه
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        {/* Info banner */}
        <Card padding="sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info size={16} className="text-primary-700" />
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">راهنمای آپلود فایل</p>
              <ul className="space-y-0.5 text-xs leading-relaxed">
                <li>• فقط فایل‌های Excel با پسوند <span className="font-mono bg-slate-100 px-1 rounded">.xlsx</span> یا <span className="font-mono bg-slate-100 px-1 rounded">.xls</span> پذیرفته می‌شوند</li>
                <li>• نوع فایل را قبل از آپلود انتخاب کنید: <span className="font-medium">انجمن‌ها</span> یا <span className="font-medium">فرم‌ها</span></li>
                <li>• پس از آپلود، سیستم به‌صورت خودکار فایل را پردازش و داشبورد را به‌روزرسانی می‌کند</li>
                <li>• حداکثر حجم فایل: ۱۰ مگابایت</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Drop zone */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Select
                  label="نوع فایل پیش‌فرض"
                  options={FILE_TYPE_OPTIONS}
                  value={defaultFileType}
                  onChange={e => setDefaultFileType(e.target.value)}
                />
              </div>
              {uploads.some(u => u.status === 'success' || u.status === 'error') && (
                <Button variant="secondary" size="md" onClick={clearCompleted}>پاک‌سازی تکمیل‌شده‌ها</Button>
              )}
            </div>

            {/* Drop area */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                transition-all duration-200
                ${isDragActive
                  ? 'border-primary-500 bg-primary-50 scale-[1.01]'
                  : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 bg-white'}
              `}
            >
              <input {...getInputProps()} />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${isDragActive ? 'bg-primary-100' : 'bg-slate-100'}`}>
                <Upload size={28} className={isDragActive ? 'text-primary-700' : 'text-slate-400'} />
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">
                {isDragActive ? 'فایل را اینجا رها کنید' : 'فایل اکسل را اینجا بکشید و رها کنید'}
              </p>
              <p className="text-sm text-slate-500 mb-4">یا روی این ناحیه کلیک کنید تا فایل انتخاب کنید</p>
              <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs text-slate-500">
                <FileSpreadsheet size={14} />
                <span>فایل‌های .xlsx و .xls — حداکثر ۱۰ مگابایت</span>
              </div>
            </div>
          </div>

          {/* Upload guide sidebar */}
          <Card>
            <CardHeader><CardTitle>ستون‌های مورد انتظار</CardTitle></CardHeader>
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <FileSpreadsheet size={13} className="text-primary-600" /> فایل انجمن‌ها
                </p>
                <div className="space-y-1">
                  {['انجمن ها', 'دبیر انجمن', 'شماره تماس', 'فعالیت', 'لوگو و هدر', 'ایمیل دانشجویی', 'جلسه نقشه راه', 'تولید محتوا', 'فرم مسابقه', 'فرم کارگاه'].map(c => (
                    <div key={c} className="flex items-center gap-1.5 text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-primary-400 flex-shrink-0" />
                      <span className="font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <FileSpreadsheet size={13} className="text-success-600" /> فایل فرم‌ها
                </p>
                <div className="space-y-1">
                  {['انجمن ها', 'کارگاه', 'مسابقات', 'تاریخ', 'وضعیت', 'امضا دبیر', 'امضا استاد مشاور', 'امضا بازرس', 'توضیح'].map(c => (
                    <div key={c} className="flex items-center gap-1.5 text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-success-400 flex-shrink-0" />
                      <span className="font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Upload queue */}
        {uploads.length > 0 && (
          <Card>
            <CardHeader action={
              <span className="text-xs text-slate-500">{uploads.length} فایل</span>
            }>
              <CardTitle>صف آپلود</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {uploads.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet size={18} className="text-success-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.file.name}</p>
                      <Badge variant={item.fileType === 'associations' ? 'primary' : 'success'} size="sm">
                        {item.fileType === 'associations' ? 'انجمن‌ها' : 'فرم‌ها'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{formatFileSize(item.file.size)}</span>
                      {item.status === 'uploading' && (
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }} />
                        </div>
                      )}
                      {item.status === 'success' && (
                        <span className="text-xs text-success-600 font-medium flex items-center gap-1">
                          <CheckCircle size={12} /> {item.message}
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-xs text-danger-600 font-medium flex items-center gap-1">
                          <AlertCircle size={12} /> {item.message}
                        </span>
                      )}
                      {item.status === 'waiting' && (
                        <span className="text-xs text-slate-500">در انتظار آپلود</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === 'waiting' && (
                      <Button size="sm" onClick={() => startUpload(item)}>آپلود</Button>
                    )}
                    {(item.status === 'success' || item.status === 'error' || item.status === 'waiting') && (
                      <button onClick={() => removeUpload(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
