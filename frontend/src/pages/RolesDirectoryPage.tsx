import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users } from 'lucide-react';
import { usersApi } from '@/services/api';
import type { ManagedUser } from '@/types';
import { Header } from '@/components/layout/Header';

interface OutletCtx { onMobileMenuOpen: () => void }

// ── Org hierarchy definition ─────────────────────────────────────────────────
interface OrgLevel {
  key: string;
  label: string;
  color: { card: string; badge: string; dot: string };
  positions: string[];
}

const ORG_LEVELS: OrgLevel[] = [
  {
    key: 'management',
    label: 'مدیریت',
    color: {
      card:  'border-[#2174b8] bg-[#f0f7fd]',
      badge: 'bg-[#2174b8] text-white',
      dot:   'bg-[#2174b8]',
    },
    positions: ['مدیر کل سامانه انجمن‌ها'],
  },
  {
    key: 'expert',
    label: 'کارشناسی / ریاست',
    color: {
      card:  'border-[#7fa343] bg-[#f3f8ec]',
      badge: 'bg-[#7fa343] text-white',
      dot:   'bg-[#7fa343]',
    },
    positions: [
      'رئیس اداره انجمن‌ها، تیم‌های علمی و فناوری',
      'کارشناس مسئول نشریات علمی-دانشجویی و مسئول بازدیدها',
      'مسئول راهبری کارگاه‌های انجمن‌ها، لوگو و مُهر انجمن‌ها و آرشیو اطلاعات',
    ],
  },
  {
    key: 'assistant',
    label: 'دستیاران',
    color: {
      card:  'border-amber-400 bg-amber-50',
      badge: 'bg-amber-500 text-white',
      dot:   'bg-amber-500',
    },
    positions: [
      'دستیار فناوری اطلاعات',
      'دستیار علمی و پژوهشی',
      'دستیار امور انجمن‌ها',
    ],
  },
  {
    key: 'student',
    label: 'همکار دانشجو',
    color: {
      card:  'border-gray-300 bg-gray-50',
      badge: 'bg-gray-500 text-white',
      dot:   'bg-gray-400',
    },
    positions: [
      'همکار دانشجو امور انجمن‌ها',
      'همکار دانشجو فناوری اطلاعات',
      'همکار دانشجو علمی و پژوهشی',
      'کاربر سامانه',
    ],
  },
];

// ── User card inside a position slot ─────────────────────────────────────────
const PersonCard: React.FC<{ user: ManagedUser; color: OrgLevel['color'] }> = ({ user, color }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${color.card} ${!user.is_active ? 'opacity-50' : ''}`}>
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #2174b8, #7fa343)' }}
    >
      {user.full_name.charAt(0)}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
      {!user.is_active && <p className="text-[10px] text-red-400 font-medium">غیرفعال</p>}
    </div>
  </div>
);

// ── Position slot ─────────────────────────────────────────────────────────────
const PositionSlot: React.FC<{ position: string; users: ManagedUser[]; color: OrgLevel['color'] }> = ({ position, users, color }) => (
  <div className="bg-white rounded-2xl shadow-card overflow-hidden">
    {/* Position title */}
    <div className="px-4 py-3 border-b border-gray-100 flex items-start gap-2">
      <span className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.dot}`} />
      <p className="text-sm font-bold text-gray-800 leading-snug">{position}</p>
    </div>

    {/* Assigned users */}
    <div className="p-3 space-y-2">
      {users.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">— تخصیص داده نشده —</p>
      ) : (
        users.map(u => <PersonCard key={u.id} user={u} color={color} />)
      )}
    </div>
  </div>
);

// ── Level section ─────────────────────────────────────────────────────────────
const LevelSection: React.FC<{ level: OrgLevel; usersByPosition: Record<string, ManagedUser[]> }> = ({ level, usersByPosition }) => {
  const totalUsers = level.positions.reduce((sum, p) => sum + (usersByPosition[p]?.length ?? 0), 0);

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${level.color.badge}`}>
          <Users size={12} />
          {level.label}
        </span>
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-xs text-white/50">{totalUsers} نفر</span>
      </div>

      {/* Position cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {level.positions.map(pos => (
          <PositionSlot
            key={pos}
            position={pos}
            users={usersByPosition[pos] ?? []}
            color={level.color}
          />
        ))}
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export const RolesDirectoryPage: React.FC = () => {
  const { onMobileMenuOpen } = useOutletContext<OutletCtx>();
  const [users,   setUsers]   = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await usersApi.list();
    setUsers(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group users by their position field
  const usersByPosition = users.reduce<Record<string, ManagedUser[]>>((acc, u) => {
    const pos = u.position?.trim() || 'کاربر سامانه';
    (acc[pos] ??= []).push(u);
    return acc;
  }, {});

  const totalStaff = users.length;

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <Header
        title="دایرکتوری سمت‌ها"
        subtitle="ساختار سازمانی و افراد منتسب به هر سمت"
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Stats strip */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-white/80">
            <Users size={13} />
            <span>{totalStaff} عضو تیم</span>
          </div>
          {ORG_LEVELS.map(l => {
            const count = l.positions.reduce((s, p) => s + (usersByPosition[p]?.length ?? 0), 0);
            return (
              <div key={l.key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-white/80">
                <span className={`w-2 h-2 rounded-full ${l.color.dot}`} />
                <span>{l.label}: {count}</span>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          ORG_LEVELS.map(level => (
            <LevelSection
              key={level.key}
              level={level}
              usersByPosition={usersByPosition}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RolesDirectoryPage;
