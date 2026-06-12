import * as React from 'react';
import { Bell, Menu, ChevronLeft, ChevronRight, Search, ChevronDown, CircleUserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';

type HeaderProps = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenMobile?: () => void;
};

export function Header({ collapsed = false, onToggleCollapse, onOpenMobile }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/85 px-4 backdrop-blur-xl md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobile}>
            <Menu className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={onToggleCollapse}>
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>

          <div className="hidden min-w-0 lg:block">
            <h1 className="truncate text-lg font-semibold text-foreground">HRM</h1>
            <p className="truncate text-xs text-muted-foreground">HR management overview</p>
          </div>
        </div>

        {/* <div className="hidden flex-1 px-6 xl:block">
        <div className="relative mx-auto max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-11 rounded-full border-slate-200 bg-slate-50 pl-10 shadow-sm" placeholder="Search employees, payroll, or projects" />
        </div>
      </div> */}

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CircleUserRound className="h-5 w-5" />
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-foreground">{user?.name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.role ?? 'Member'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
