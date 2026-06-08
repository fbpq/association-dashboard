import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn, formatPersianNumber } from '@/utils/helpers';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page, totalPages, total, perPage, onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-sm text-slate-500">
        نمایش <span className="font-medium text-slate-700">{formatPersianNumber(start)}</span> تا{' '}
        <span className="font-medium text-slate-700">{formatPersianNumber(end)}</span> از{' '}
        <span className="font-medium text-slate-700">{formatPersianNumber(total)}</span> مورد
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        {pages.map((p, i) => (
          p === 'ellipsis'
            ? <span key={`e${i}`} className="w-8 text-center text-slate-400 text-sm">...</span>
            : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {formatPersianNumber(p)}
              </button>
            )
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
