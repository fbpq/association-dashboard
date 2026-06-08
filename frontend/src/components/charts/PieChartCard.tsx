import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataItem } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { formatPersianNumber } from '@/utils/helpers';
import type { LucideIcon } from 'lucide-react';

interface PieChartCardProps {
  title: string;
  data: ChartDataItem[];
  icon?: LucideIcon;
  loading?: boolean;
  donut?: boolean;
}

const CustomTooltip: React.FC<{ active?: boolean; payload?: { name: string; value: number; payload: ChartDataItem }[] }> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-3 text-sm" dir="rtl">
        <p className="font-bold text-slate-800">{item.name}</p>
        <p className="text-slate-600 mt-0.5">
          تعداد: <span className="font-semibold text-primary-700">{formatPersianNumber(item.value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<{ payload?: { value: string; color: string; payload: ChartDataItem }[] }> = ({ payload }) => {
  if (!payload) return null;
  const total = payload.reduce((sum, p) => sum + (p.payload.value || 0), 0);
  return (
    <div className="flex flex-col gap-2 mt-3" dir="rtl">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-slate-600 truncate">{entry.value}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-800">{formatPersianNumber(entry.payload.value)}</span>
            <span className="text-xs text-slate-400 w-8 text-left">
              {total > 0 ? Math.round((entry.payload.value / total) * 100) : 0}٪
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PieChartCard: React.FC<PieChartCardProps> = ({
  title, data, icon: Icon, loading = false, donut = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <Skeleton className="h-48 w-full rounded-xl" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><Icon size={16} className="text-primary-700" /></div>}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <div style={{ direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={donut ? 50 : 0}
              outerRadius={donut ? 75 : 75}
              paddingAngle={donut ? 3 : 2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || `hsl(${index * 60}, 70%, 55%)`}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <CustomLegend payload={data.map(d => ({ value: d.name, color: d.color || '#94A3B8', payload: d }))} />
    </Card>
  );
};

export default PieChartCard;
