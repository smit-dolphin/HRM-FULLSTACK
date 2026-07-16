import * as React from 'react';
// import { NavLink } from 'react-router-dom';
import { Link, useLocation } from "@tanstack/react-router"
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  Settings,
  LogOut,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  X,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Presentation,
  KanbanSquareDashed,
  ListTodo,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/useTaskStore';

type NavChild = { label: string; path: string; permission?: string };
type NavItem = { icon: any; label: string; path?: string; permission?: string; children?: NavChild[] };

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ListTodo, label: 'Tasks', path: '/task', permission: 'task:list:view' },
  { icon: UserRound, label: 'Users', path: '/users', permission: 'user:view' },
  { icon: Users, label: 'Employees', path: '/employees', permission: 'employee:view' },
  { icon: Building2, label: 'Departments', path: '/departments', permission: 'department:view' },
  { icon: CalendarDays, label: 'Leaves', path: '/leaves', permission: 'leave:request:view_own' },
  { icon: CalendarRange, label: 'Holidays', path: '/holidays', permission: 'holiday:view' },
  {
    icon: Presentation,
    label: 'Projects',
    permission: 'project:list:view',
    children: [
      { label: 'Project Dashboard', path: '/projects/dashboard',permission:'project:dashboard:view' },
      { label: 'Projects', path: '/projects' },
    ],
  },
  { icon: KanbanSquareDashed, label: 'Kanban Board', path: '/kanban', permission: 'task:list:view' },
  { icon: Settings, label: 'Settings', path: '/settings', permission: 'leave:type:manage' },
];

type SidebarProps = {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  onCollapse?: () => void;
};

export function Sidebar({ collapsed = false, mobileOpen = false, onToggleCollapse, onCloseMobile, onCollapse }: SidebarProps) {
  const { user, logout, hasPermission } = useAuthStore();
  const { clearTasks } = useTaskStore()
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  void onCollapse;

  const baseWidth = mobileOpen ? 'w-64' : collapsed ? 'w-20' : 'w-64';
  const compact = collapsed && !mobileOpen;

  // Auto-expand a parent item if the current route is one of its children.
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children?.some((child) => location.pathname.startsWith(child.path))) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const closeMobileIfNeeded = () => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

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
          <div className={cn("flex min-w-0 items-center ", compact ? "justify-center group relative" : "gap-3")}>

            <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm ", compact ? "h-11 w-11 group-hover:opacity-0" : "h-10 w-10")}>
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <Button variant="ghost" size="icon" className={cn(
              "absolute inset-0 m-auto hidden md:inline-flex opacity-0 transition-opacity duration-200 pointer-events-none ",
              compact && "group-hover:opacity-100 group-hover:pointer-events-auto"
            )} onClick={onToggleCollapse}>
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>

            <div className={cn('min-w-0', compact && 'hidden')}>
              <h2 className="truncate text-base font-semibold tracking-tight text-foreground">HRM</h2>
              <p className="truncate text-xs text-muted-foreground">People operations</p>

            </div>
            {!collapsed && <Button variant="ghost" size="icon" className="hidden md:inline-flex ml-5" onClick={onToggleCollapse}>
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>}
          </div>
          {mobileOpen && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onCloseMobile}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className={cn("flex-1 space-y-1 overflow-y-auto p-3", compact && "px-2")}>
          {navItems
            .filter((item) => !item.permission || hasPermission(item.permission))
            .map((item) => {
              // ---- Parent item with a collapsible sub-menu ----
              if (item.children) {
                const visibleChildren = item.children.filter(
                  (child) => !child.permission || hasPermission(child.permission)
                );
                if (visibleChildren.length === 0) return null;

                const isOpen = !compact && (openMenus[item.label] ?? false);
                const isChildActive = visibleChildren.some((child) =>
                  location.pathname.startsWith(child.path)
                );

                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      title={item.label}
                      onClick={() => {
                        if (compact) return;
                        toggleMenu(item.label);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isChildActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        compact && "justify-center px-0"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!compact && (
                        <>
                          <span className="flex-1 truncate text-left">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </button>

                    {!compact && (
                      <div
                        className={cn(
                          "grid overflow-hidden transition-all duration-200 ease-in-out",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="min-h-0 space-y-1  pl-[1.45rem]">
                          {visibleChildren.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className="block  border-l-2 mb-0 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground border-l "
                              activeOptions={{
                                exact: true,
                              }}
                              activeProps={{
                                className: "border-primary bg-primary/10 text-primary font-medium",
                              }}
                              onClick={closeMobileIfNeeded}
                            >
                              <span className="truncate">{child.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // ---- Plain nav item (no children) ----
              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  title={item.label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    compact && "justify-center px-0"
                  )}
                  activeProps={{
                    className: "bg-primary/10 text-primary shadow-sm",
                  }}
                  onClick={closeMobileIfNeeded}
                  inactiveProps={{
                    className:
                      "text-muted-foreground hover:bg-accent hover:text-foreground",
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className={cn("truncate", compact && "hidden")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
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


          <Button variant="outline" className={cn('w-full justify-start gap-2 rounded-xl border-border bg-transparent text-foreground hover:bg-accent', compact ? 'justify-center' : '')}
            onClick={
              () => {
                logout();
                clearTasks();
              }
            }
          >
            <LogOut className="w-4 h-4" />
            {!compact && 'Logout'}
          </Button>
        </div>
      </aside>
    </>
  );
}
