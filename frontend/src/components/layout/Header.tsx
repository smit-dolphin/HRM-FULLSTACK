import * as React from 'react'
import {
  Bell,
  Menu,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Play,
  Pause,
  Square,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/utils/cn'

type HeaderProps = {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onOpenMobile?: () => void
}

export function Header({
  collapsed = false,
  onOpenMobile,
}: HeaderProps) {
  const { user } = useAuthStore()
  const [isPaused, setIsPaused] = React.useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/85 px-4 py-1 backdrop-blur-xl md:px-6">
      <div className="relative flex h-16 items-center justify-between">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenMobile}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden min-w-0 lg:block">
            <h1 className="truncate text-lg font-semibold text-foreground">
              HRM
            </h1>

            <p className="truncate text-xs text-muted-foreground">
              HR management overview
            </p>
          </div>
        </div>

        {/* Center Timer */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 xl:block">
          <div className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">

            {/* Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  isPaused
                    ? "bg-red-100 text-red-600"
                    : "bg-primary/10 text-primary"
                )}
              >
                <Clock3 className="h-3.5 w-3.5" />
              </div>

              <span
                className={cn(
                  "font-mono text-base font-semibold tracking-wider",
                  isPaused && "text-red-600"
                )}
              >
                01:21:01
              </span>
            </div>

            <Button
              variant="ghost"
              className="h-10 rounded-none border-l px-3"
              onClick={() => setIsPaused((p) => !p)}
            >
              {isPaused ? (
                <Play className="h-4 w-4 fill-current text-green-600" />
              ) : (
                <Pause className="h-4 w-4 fill-current text-amber-600" />
              )}
            </Button>

            <Button
              variant="ghost"
              className="h-10 rounded-none border-l px-3"
            >
              <Square className="h-3.5 w-3.5 fill-current text-red-600" />
            </Button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CircleUserRound className="h-5 w-5" />
            </div>

            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-foreground">
                {user?.name ?? 'User'}
              </p>

              <p className="text-xs text-muted-foreground">
                {user?.role ?? 'Member'}
              </p>
            </div>

            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}