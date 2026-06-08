import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { ChartDataItem } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { formatPersianNumber } from '@/utils/helpers';
import type { LucideIcon } from 'lucide-react';

interface BarChartCardProps {
  title: string;
  data: ChartDataItem[];
  icon?: LucideIcon;
  loading?: boolean;
  color?: string;
  horizontal?: boolean;
}

const CustomTooltip: React.FC<{ active?: boolean; payload?: { value: number; name: string }[]; label?: string }> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-3 text-sm" dir="rtl">
        <p className="font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-slate-600">
          تعداد: <span className="font-semibold text-primary-700">{formatPersianNumber(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const BarChartCard: React.FC<BarChartCardProps> = ({
  title, data, icon: Icon, loading = false, horizontal = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
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
        <ResponsiveContainer width="100%" height={200}>
          {horizontal ? (
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color || '#2174b8'} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color || '#2174b8'} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BarChartCard;
