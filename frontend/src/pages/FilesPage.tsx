import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, RefreshCw, FileSpreadsheet, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { filesApi } from '@/services/api';
import type { UploadedFile, UploadLog } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/LoadingSpinner';
import { ConfirmModal } from '@/components/ui/Modal';
import { formatFileSize, formatPersianDateTime, getFileStatusLabel, getFileStatusColor, getFileTypeLabel } from '@/utils/helpers';

interface OutletCtx { onMobileMenuOpen: () => void }

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  success: 'success', error: 'danger', processing: 'info', pending: 'warning',
};

export const FilesPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const { success, error: toastError, info } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UploadedFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reparsing, setReparsing] = useState<number | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<number, UploadLog[]>>({});

  const loadFiles = () => {
    setLoading(true);
    filesApi.list()
      .then(setFiles)
      .catch(() => toastError('خطا', 'بارگذاری تاریخچه فایل‌ها ناموفق بود.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadFiles, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await filesApi.delete(deleteTarget.id);
      setFiles(prev => prev.filter(f => f.id !== deleteTarget.id));
      success('حذف موفق', `فایل «${deleteTarget.original_filename}» حذف شد.`);
    } catch {
      toastError('خطا', 'حذف فایل ناموفق بود.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleReparse = async (file: UploadedFile) => {
    setReparsing(file.id);
    try {
      const updated = await filesApi.reparse(file.id);
      setFiles(prev => prev.map(f => f.id === file.id ? updated : f));
      success('پردازش مجدد موفق', `فایل «${file.original_filename}» مجدداً پردازش شد.`);
    } catch {
      toastError('خطا', 'پردازش مجدد ناموفق بود.');
    } finally {
      setReparsing(null);
    }
  };

  const toggleLogs = async (fileId: number) => {
    if (expandedLogs === fileId) { setExpandedLogs(null); return; }
    setExpandedLogs(fileId);
    if (!logs[fileId]) {
      const fileLogs = await filesApi.getLogs(fileId).catch(() => []);
      setLogs(prev => ({ ...prev, [fileId]: fileLogs }));
    }
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="تاریخچه فایل‌ها"
        subtitle="فایل‌های آپلودشده و وضعیت پردازش آن‌ها"
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={loadFiles}>
            به‌روزرسانی
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Card padding="none">
          {loading ? (
            <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
          ) : files.length === 0 ? (
            <EmptyState variant="no-data" title="تاریخچه‌ای وجود ندارد" description="هنوز هیچ فایلی آپلود نشده است." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">#</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">نام فایل</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">نوع</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">حجم</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">تاریخ آپلود</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">رکوردها</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">وضعیت</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {files.map((file, idx) => (
                    <React.Fragment key={file.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 text-slate-500 text-xs">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet size={16} className="text-success-600 flex-shrink-0" />
                            <span className="font-medium text-slate-800 max-w-48 truncate" title={file.original_filename}>{file.original_filename}</span>
                          </div>
                          {file.error_message && (
                            <p className="text-xs text-danger-600 mt-1 max-w-48 truncate" title={file.error_message}>{file.error_message}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={file.file_type === 'associations' ? 'primary' : file.file_type === 'forms' ? 'success' : 'default'} size="sm">
                            {getFileTypeLabel(file.file_type)}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{formatFileSize(file.file_size)}</td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-xs">{formatPersianDateTime(file.created_at)}</td>
                        <td className="px-5 py-4">
                          {file.record_count != null ? (
                            <span className="font-semibold text-slate-800">{file.record_count}</span>
                          ) : <span className="text-slate-400">—</span>}
                          {file.warnings_count != null && file.warnings_count > 0 && (
                            <span className="text-xs text-warning-600 mr-1">({file.warnings_count} هشدار)</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={STATUS_VARIANT[file.status] || 'default'} size="sm" dot>
                            {getFileStatusLabel(file.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleLogs(file.id)}
                              title="مشاهده لاگ‌ها"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                            >
                              {expandedLogs === file.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <button
                              onClick={() => handleReparse(file)}
                              disabled={reparsing === file.id}
                              title="پردازش مجدد"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-40"
                            >
                              <RefreshCw size={14} className={reparsing === file.id ? 'animate-spin' : ''} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(file)}
                              title="حذف"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedLogs === file.id && logs[file.id] && (
                        <tr>
                          <td colSpan={8} className="px-5 pb-4 bg-slate-50/50">
                            <div className="rounded-xl border border-slate-100 overflow-hidden">
                              <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-600">لاگ‌های پردازش</p>
                              </div>
                              <div className="divide-y divide-slate-50">
                                {logs[file.id].map(log => (
                                  <div key={log.id} className="flex items-start gap-3 px-4 py-2.5">
                                    <span className={`text-xs font-bold mt-0.5 flex-shrink-0 ${log.level === 'error' ? 'text-danger-600' : log.level === 'warning' ? 'text-warning-600' : 'text-primary-600'}`}>
                                      {log.level === 'error' ? 'خطا' : log.level === 'warning' ? 'هشدار' : 'اطلاع'}
                                    </span>
                                    <p className="text-xs text-slate-600">{log.message}</p>
                                    {log.row_number && <span className="text-xs text-slate-400 flex-shrink-0">ردیف {log.row_number}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف فایل"
        message={`آیا از حذف فایل «${deleteTarget?.original_filename}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="بله، حذف کن"
        cancelLabel="انصراف"
        loading={deleting}
      />
    </div>
  );
};

export default FilesPage;
