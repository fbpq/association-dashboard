import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Toast } from '@/types';
import { generateId } from '@/utils/helpers';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: 'bg-success-50 border-success-200 text-success-800',
  error: 'bg-danger-50 border-danger-100 text-danger-800',
  warning: 'bg-warning-50 border-warning-100 text-warning-700',
  info: 'bg-primary-50 border-primary-100 text-primary-800',
};

const TOAST_ICON_STYLES = {
  success: 'text-success-500',
  error: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-primary-500',
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const Icon = TOAST_ICONS[toast.type];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg toast-in w-80 ${TOAST_STYLES[toast.type]}`}>
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${TOAST_ICON_STYLES[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-5">{toast.title}</p>
        {toast.message && <p className="text-xs mt-0.5 opacity-80 leading-5">{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), toast.duration ?? 4000);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ type: 'error', title, message }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ type: 'warning', title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ type: 'info', title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3" dir="rtl">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
