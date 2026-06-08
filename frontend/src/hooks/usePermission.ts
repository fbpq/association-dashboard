import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

// What each route requires
export const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/dashboard':    ['admin', 'assistant', 'viewer'],
  '/profile':      ['admin', 'assistant', 'viewer'],
  '/upload':       ['admin', 'assistant'],
  '/files':        ['admin', 'assistant'],
  '/associations': ['admin', 'assistant'],
  '/forms':        ['admin', 'assistant'],
  '/follow-ups':   ['admin', 'assistant'],
  '/reports':      ['admin', 'assistant'],
  '/settings':     ['admin'],
  '/admin':        ['admin'],
  '/org-chart':    ['admin', 'assistant', 'viewer'],
  '/directory':    ['admin', 'assistant', 'viewer'],
  '/roles':        ['admin', 'assistant', 'viewer'],
  '/activities':   ['admin', 'assistant', 'viewer'],
  '/analytics':    ['admin', 'assistant', 'viewer'],
  '/meetings':     ['admin', 'assistant', 'viewer'],
};

export const usePermission = () => {
  const { user } = useAuth();
  const role = (user?.role ?? 'viewer') as UserRole;

  return {
    role,
    isAdmin:     role === 'admin',
    isAssistant: role === 'assistant',
    isViewer:    role === 'viewer',
    canAccess: (path: string) => {
      const allowed = ROUTE_ROLES[path] ?? ['admin'];
      return allowed.includes(role);
    },
  };
};
