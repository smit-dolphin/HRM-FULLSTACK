import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  Settings,
  LogOut,
  BriefcaseBusiness,
  Building2,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

const navItems: { icon: any; label: string; path: string; permission?: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: UserRound, label: 'Users', path: '/users', permission: 'user:view' },
  { icon: Users, label: 'Employees', path: '/employees', permission: 'employee:view' },
  { icon: Building2, label: 'Departments', path: '/departments', permission: 'department:view' },
  { icon: CalendarDays, label: 'My Leaves', path: '/leaves', permission: 'leave:view' },
  { icon: CalendarDays, label: 'Leave Approvals', path: '/leaves/manage', permission: 'leave:approve' },
];

type SidebarProps = {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onCollapse?: () => void;
};

export function Sidebar({ collapsed = false, mobileOpen = false, onCloseMobile, onCollapse }: SidebarProps) {
  const { user, logout, hasPermission } = useAuthStore();
  const { theme, setTheme } = useTheme();
  void onCollapse;

  const baseWidth = mobileOpen ? 'w-64' : collapsed ? 'w-20' : 'w-64';
  const compact = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn("fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden transition-opacity", mobileOpen ? 'opacity-100 visible' : 'pointer-events-none opacity-0 invisible')}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 md:sticky md:translate-x-0 md:shadow-none",
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          baseWidth,
          'md:flex-shrink-0'
        )}
      >
        <div className={cn("flex items-center justify-between border-b border-border px-4 py-4", compact && "justify-center border-b-0 px-3")}>
          <div className={cn("flex min-w-0 items-center", compact ? "justify-center" : "gap-3")}>
            <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm", compact ? "h-11 w-11" : "h-10 w-10")}>
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div className={cn('min-w-0', compact && 'hidden')}>
              <h2 className="truncate text-base font-semibold tracking-tight text-foreground">HRM</h2>
              <p className="truncate text-xs text-muted-foreground">People operations</p>
            </div>
          </div>
          {mobileOpen && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onCloseMobile}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className={cn("flex-1 space-y-1 overflow-y-auto p-3", compact && "px-2")}>
          {navItems
            .filter(item => !item.permission || hasPermission(item.permission))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    compact && "justify-center px-0",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className={cn('truncate', compact && 'hidden')}>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        <div className={cn("mt-auto p-4", compact && "px-3")}>

          <div className={cn('mb-4 flex items-center gap-3 rounded-2xl bg-accent/50 px-3 py-3', compact ? 'justify-center' : '')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {user?.name?.charAt(0) ?? ''}
            </div>
            {!compact && (
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className={cn('relative mb-4 w-full justify-start gap-2 rounded-xl border-border bg-transparent text-foreground hover:bg-accent', compact ? 'justify-center px-0' : '')}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            {!compact && <span>Theme</span>}
          </Button>


          <Button variant="outline" className={cn('w-full justify-start gap-2 rounded-xl border-border bg-transparent text-foreground hover:bg-accent', compact ? 'justify-center' : '')} onClick={logout}>
            <LogOut className="w-4 h-4" />
            {!compact && 'Logout'}
          </Button>
        </div>
      </aside>
    </>
  );
}
