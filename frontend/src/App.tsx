import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ROUTE_ROLES } from '@/hooks/usePermission';
import type { UserRole } from '@/types';

// Pages (lazy loaded)
const LoginPage        = React.lazy(() => import('@/pages/LoginPage'));
const DashboardPage    = React.lazy(() => import('@/pages/DashboardPage'));
const UploadPage       = React.lazy(() => import('@/pages/UploadPage'));
const FilesPage        = React.lazy(() => import('@/pages/FilesPage'));
const AssociationsPage = React.lazy(() => import('@/pages/AssociationsPage'));
const FormsPage        = React.lazy(() => import('@/pages/FormsPage'));
const FollowUpsPage    = React.lazy(() => import('@/pages/FollowUpsPage'));
const ReportsPage      = React.lazy(() => import('@/pages/ReportsPage'));
const SettingsPage     = React.lazy(() => import('@/pages/SettingsPage'));
const AdminPage                = React.lazy(() => import('@/pages/AdminPage'));
const ProfilePage              = React.lazy(() => import('@/pages/ProfilePage'));
const OrgChartPage             = React.lazy(() => import('@/pages/OrgChartPage'));
const AssociationDirectoryPage = React.lazy(() => import('@/pages/AssociationDirectoryPage'));
const RolesDirectoryPage       = React.lazy(() => import('@/pages/RolesDirectoryPage'));
const ActivitiesPage           = React.lazy(() => import('@/pages/ActivitiesPage'));
const AnalyticsPage            = React.lazy(() => import('@/pages/AnalyticsPage'));
const MeetingsPage             = React.lazy(() => import('@/pages/MeetingsPage'));
const NotFoundPage             = React.lazy(() => import('@/pages/NotFoundPage'));

// Auth guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Public route
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Role guard — redirects to dashboard if role is insufficient
const RoleRoute: React.FC<{ path: string; children: React.ReactNode }> = ({ path, children }) => {
  const { user } = useAuth();
  const role = (user?.role ?? 'viewer') as UserRole;
  const allowed = ROUTE_ROLES[path] ?? ['admin'];
  if (!allowed.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <React.Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="profile"      element={<ProfilePage />} />

        <Route path="upload"       element={<RoleRoute path="/upload"><UploadPage /></RoleRoute>} />
        <Route path="files"        element={<RoleRoute path="/files"><FilesPage /></RoleRoute>} />
        <Route path="associations" element={<RoleRoute path="/associations"><AssociationsPage /></RoleRoute>} />
        <Route path="forms"        element={<RoleRoute path="/forms"><FormsPage /></RoleRoute>} />
        <Route path="follow-ups"   element={<RoleRoute path="/follow-ups"><FollowUpsPage /></RoleRoute>} />
        <Route path="reports"      element={<RoleRoute path="/reports"><ReportsPage /></RoleRoute>} />
        <Route path="settings"     element={<RoleRoute path="/settings"><SettingsPage /></RoleRoute>} />
        <Route path="admin"        element={<RoleRoute path="/admin"><AdminPage /></RoleRoute>} />
        <Route path="org-chart"    element={<OrgChartPage />} />
        <Route path="directory"    element={<AssociationDirectoryPage />} />
        <Route path="roles"        element={<RolesDirectoryPage />} />
        <Route path="activities"   element={<ActivitiesPage />} />
        <Route path="analytics"    element={<AnalyticsPage />} />
        <Route path="meetings"     element={<MeetingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </React.Suspense>
);

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
