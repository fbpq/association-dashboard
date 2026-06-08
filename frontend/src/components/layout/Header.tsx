import React from 'react';
import { Menu, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { formatPersianDateTime } from '@/utils/helpers';

interface HeaderProps {
  title: string;
  subtitle?: string;
  lastUpdate?: string | null;
  onMobileMenuOpen: () => void;
  actions?: React.ReactNode;
}

const ROLE_LABEL: Record<string, string> = {
  admin:     'مدیر کل',
  assistant: 'دستیار انجمن‌ها',
  viewer:    'کاربر عادی',
};

const AvatarBadge: React.FC = () => {
  const { user, avatarUrl } = useAuth();
  if (!user) return null;
  return (
    <div
      className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{ background: avatarUrl ? undefined : '#f0f7fd' }}
    >
      {avatarUrl
        ? <img src={avatarUrl} alt="پروفایل" className="w-full h-full object-cover" />
        : <span className="text-xs font-bold" style={{ color: '#2174b8' }}>{user.full_name.charAt(0)}</span>
      }
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  lastUpdate,
  onMobileMenuOpen,
  actions,
}) => {
  const { user } = useAuth();

  return (
    <header
      className="flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 mx-4 mt-4 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        minHeight: '64px',
      }}
      dir="rtl"
    >
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ color: '#2174b8' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f0f7fd')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold truncate" style={{ color: '#333333' }}>{title}</h1>
        {subtitle && <p className="text-xs truncate" style={{ color: '#888888' }}>{subtitle}</p>}
      </div>

      {/* Last update badge */}
      {lastUpdate && (
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border"
          style={{ background: '#f3f8ec', color: '#55702d', borderColor: '#c7e0a7' }}
        >
          <Clock size={13} className="flex-shrink-0" />
          <span>آخرین به‌روزرسانی: {formatPersianDateTime(lastUpdate)}</span>
        </div>
      )}

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* User avatar → profile */}
      {user && (
        <Link
          to="/profile"
          className="flex items-center gap-2 border-r pr-4 hover:opacity-80 transition-opacity"
          style={{ borderColor: '#e2e8f0' }}
          title="پروفایل کاربری"
        >
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: '#333333' }}>{user.full_name}</p>
            <p className="text-xs" style={{ color: '#888888' }}>{ROLE_LABEL[user.role] ?? user.role}</p>
          </div>
          <AvatarBadge />
        </Link>
      )}
    </header>
  );
};

export default Header;
