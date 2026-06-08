import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logoSrc from '@/assets/logo.png';
import {
  LayoutDashboard, Upload, FolderOpen, Building2,
  ClipboardList, AlertCircle, FileDown, Settings,
  LogOut, X, ChevronLeft, ShieldCheck, Network, LayoutGrid, Briefcase,
  Activity, BarChart2, CalendarDays,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/utils/helpers';

const ALL_NAV_ITEMS = [
  { to: '/dashboard',    label: 'داشبورد اصلی',           icon: LayoutDashboard },
  { to: '/upload',       label: 'آپلود فایل‌ها',           icon: Upload },
  { to: '/files',        label: 'تاریخچه فایل‌ها',         icon: FolderOpen },
  { to: '/associations', label: 'جدول انجمن‌ها',           icon: Building2 },
  { to: '/directory',    label: 'دایرکتوری انجمن‌ها',      icon: LayoutGrid },
  { to: '/forms',        label: 'جدول فرم‌ها',             icon: ClipboardList },
  { to: '/follow-ups',   label: 'موارد نیازمند پیگیری',    icon: AlertCircle },
  { to: '/reports',      label: 'گزارش‌ها و خروجی‌ها',     icon: FileDown },
  { to: '/org-chart',    label: 'نمودار سازمانی',          icon: Network },
  { to: '/roles',        label: 'دایرکتوری سمت‌ها',        icon: Briefcase },
  { to: '/activities',   label: 'فعالیت‌های انجمن‌ها',      icon: Activity },
  { to: '/analytics',    label: 'تحلیل و گزارش‌گیری',      icon: BarChart2 },
  { to: '/meetings',     label: 'جلسات انجمن‌ها',           icon: CalendarDays },
  { to: '/settings',     label: 'تنظیمات',                 icon: Settings },
];

const ROLE_LABELS: Record<string, string> = {
  admin:     'مدیر کل',
  assistant: 'دستیار امور انجمن‌ها',
  viewer:    'کاربر عادی',
};

const SIDEBAR_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderLeft: '1px solid rgba(255,255,255,0.2)',
};

const NavItems: React.FC<{ collapsed?: boolean; onItemClick?: () => void }> = ({ collapsed, onItemClick }) => {
  const { canAccess, isAdmin } = usePermission();
  const visibleItems = ALL_NAV_ITEMS.filter(item => canAccess(item.to));

  return (
    <ul className="space-y-0.5 px-2">
      {visibleItems.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            title={collapsed ? label : undefined}
            onClick={onItemClick}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-white text-[#2174b8] shadow-sm font-bold'
                : 'text-white/75 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center',
            )}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-[#2174b8]' : 'text-white/70',
                  )}
                />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        </li>
      ))}

      {isAdmin && (
        <>
          {!collapsed && (
            <li>
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                مدیریت
              </p>
            </li>
          )}
          <li>
            <NavLink
              to="/admin"
              title={collapsed ? 'پنل مدیریت' : undefined}
              onClick={onItemClick}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-white text-[#2174b8] shadow-sm font-bold'
                  : 'text-white/75 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center',
              )}
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck
                    size={18}
                    className={cn(
                      'flex-shrink-0 transition-colors',
                      isActive ? 'text-[#2174b8]' : 'text-white/70',
                    )}
                  />
                  {!collapsed && <span className="truncate">پنل مدیریت کاربران</span>}
                </>
              )}
            </NavLink>
          </li>
        </>
      )}
    </ul>
  );
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout, avatarUrl } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    success('خروج موفق', 'با موفقیت از سامانه خارج شدید.');
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 h-full z-30 flex flex-col sidebar-transition shadow-2xl',
        collapsed ? 'w-16' : 'w-64',
      )}
      style={SIDEBAR_STYLE}
      dir="rtl"
    >
      {/* Logo & Toggle */}
      <div className={cn(
        'flex items-center border-b flex-shrink-0',
        'border-white/10',
        collapsed ? 'justify-center p-4' : 'justify-between px-5 py-4',
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-white p-1 shadow-sm">
              <img src={logoSrc} alt="لوگوی سامانه" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">سامانه انجمن‌ها</p>
              <p className="text-xs text-white/60 truncate">مدیریت هوشمند</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-1 shadow-sm">
            <img src={logoSrc} alt="لوگوی سامانه" className="w-full h-full object-contain" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
            'text-white/50 hover:text-white hover:bg-white/10 transition-colors',
            collapsed && 'hidden',
          )}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <NavItems collapsed={collapsed} />
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        {!collapsed && user && (
          <Link
            to="/profile"
            className="flex items-center gap-2 px-2 py-2 mb-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="پروفایل کاربری"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt="پروفایل" className="w-full h-full object-cover" />
                : <span className="text-white text-xs font-bold">{user.full_name.charAt(0)}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-xs text-white/50 truncate">{ROLE_LABELS[user.role] ?? user.role}</p>
            </div>
          </Link>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'خروج' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-white/60 hover:bg-white/10 hover:text-white transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>خروج از حساب</span>}
        </button>
      </div>
    </aside>
  );
};

// Mobile overlay sidebar
export const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout, avatarUrl } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    success('خروج موفق', 'با موفقیت از سامانه خارج شدید.');
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" dir="rtl">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 h-full w-72 flex flex-col shadow-2xl"
        style={SIDEBAR_STYLE}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-1 shadow-sm">
              <img src={logoSrc} alt="لوگوی سامانه" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">سامانه انجمن‌ها</p>
              <p className="text-xs text-white/60">مدیریت هوشمند</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto px-2">
          <NavItems onItemClick={onClose} />
        </nav>

        <div className="border-t border-white/10 p-3">
          {user && (
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-2 px-2 py-2 mb-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              title="پروفایل کاربری"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt="پروفایل" className="w-full h-full object-cover" />
                  : <span className="text-white text-xs font-bold">{user.full_name.charAt(0)}</span>
                }
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{user.full_name}</p>
                <p className="text-xs text-white/50">{ROLE_LABELS[user.role] ?? user.role}</p>
              </div>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
