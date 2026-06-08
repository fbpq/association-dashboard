import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { cn } from '@/utils/helpers';

export const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      dir="rtl"
      style={{ background: 'linear-gradient(135deg, #1e6fbb 0%, #6d9438 100%)' }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main
        className={cn(
          'flex-1 flex flex-col min-h-screen overflow-hidden',
          'transition-all duration-300',
          'lg:mr-64',
          sidebarCollapsed && 'lg:mr-16',
        )}
      >
        <Outlet context={{ onMobileMenuOpen: () => setMobileMenuOpen(true) }} />

        {/* Footer */}
        <footer
          className="flex-shrink-0 mx-4 mb-3 mt-1 px-5 py-2.5 rounded-xl flex items-center justify-between gap-4 text-xs"
          style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.65)',
          }}
          dir="rtl"
        >
          <span>طراحی و توسعه: <strong style={{ color: 'rgba(255,255,255,0.9)' }}>فرهاد سعیدی نژاد</strong></span>
          <span className="hidden sm:inline">سامانه هوشمند مدیریت انجمن‌های دانشجویی</span>
          <span>© ۱۴۰۵ — تمامی حقوق محفوظ است</span>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
