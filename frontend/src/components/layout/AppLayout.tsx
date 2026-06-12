import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/store/useAuthStore';

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (!isAuthenticated) {
    // In a real app, redirect to login
    return <div>Please log in</div>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onCollapse={() => setCollapsed((s) => !s)}
      />

      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
        <Header
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((s) => !s)}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-auto px-4 py-5 md:px-6 md:py-6 lg:px-8">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
