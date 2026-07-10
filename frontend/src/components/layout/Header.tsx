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
  FolderKanban,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/utils/cn'

type HeaderProps = {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onOpenMobile?: () => void
}

type TaskStatus = 'running' | 'paused'

interface TimerTask {
  id: string
  name: string
  project: string
  status: TaskStatus
}

// Dummy tasks for UI - will be replaced with real data later
const initialTasks: TimerTask[] = [
  { id: '1', name: 'Design landing page', project: 'Website Redesign', status: 'paused' },
  { id: '2', name: 'Fix login bug', project: 'HRM App', status: 'paused' },
  { id: '3', name: 'Write API docs', project: 'Backend Services', status: 'paused' },
  { id: '4', name: 'Setup CI/CD pipeline', project: 'DevOps', status: 'paused' },
]

export function Header({
  collapsed = false,
  onOpenMobile,
}: HeaderProps) {
  const { user } = useAuthStore()
  const [tasks, setTasks] = React.useState<TimerTask[]>(initialTasks)

  const runningTask = tasks.find(t => t.status === 'running')

  // Play a task: pause any currently running task, then start this one
  const handlePlay = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) return { ...t, status: 'running' as const }
        if (t.status === 'running') return { ...t, status: 'paused' as const }
        return t
      })
    )
  }

  // Pause a specific task
  const handlePause = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: 'paused' as const } : t)
    )
  }

  // Stop the running task (pause it, no active task)
  const handleStop = () => {
    setTasks(prev =>
      prev.map(t => t.status === 'running' ? { ...t, status: 'paused' as const } : t)
    )
  }

  // Header bar play/pause toggle for the running task
  const handleHeaderToggle = () => {
    if (runningTask) {
      handlePause(runningTask.id)
    } else {
      // Resume the first paused task (or do nothing if no tasks)
      const firstPaused = tasks.find(t => t.status === 'paused')
      if (firstPaused) handlePlay(firstPaused.id)
    }
  }

  const [currentTime,setCurrentTime]=React.useState<string>("00:00:00")


  React.useEffect(()=>{
    if(runningTask){
      
      const timer = setInterval(() => {
        const now = new Date()
        setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }, 1000)
  
      return () => clearInterval(timer)
    }
    else{
      return () => {}
    }
  },[runningTask,currentTime])

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
          <Popover>
            <div className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <PopoverTrigger>
                {/* Timer */}
                <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer h-10">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full",
                      !runningTask
                        ? "bg-red-100 text-red-600"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                  </div>

                  <span
                    className={cn(
                      "font-mono text-base font-semibold tracking-wider",
                      !runningTask && "text-red-600"
                    )}
                  >
                    {currentTime}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </PopoverTrigger>

              <Button
                variant="ghost"
                className="h-10 rounded-none border-l px-3"
                onClick={handleHeaderToggle}
              >
                {!runningTask ? (
                  <Play className="h-4 w-4 fill-current text-green-600" />
                ) : (
                  <Pause className="h-4 w-4 fill-current text-amber-600" />
                )}
              </Button>

              <Button
                variant="ghost"
                className="h-10 rounded-none border-l px-3"
                onClick={handleStop}
              >
                <Square className="h-3.5 w-3.5 fill-current text-red-600" />
              </Button>
            </div>

            <PopoverContent className="w-80 mt-2 p-0 left-1/2 -translate-x-1/2">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Your Tasks</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Select a task to track time</p>
              </div>

              {/* Task List */}
              <div className="max-h-64 overflow-y-auto py-1">
                {tasks.map((task) => {
                  const isTaskRunning = task.status === 'running'

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 transition-colors",
                        isTaskRunning
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : "hover:bg-accent/50 border-l-2 border-l-transparent"
                      )}
                    >
                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          isTaskRunning ? "text-foreground" : "text-foreground/80"
                        )}>
                          {task.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <FolderKanban className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">
                            {task.project}
                          </p>
                        </div>
                      </div>

                      {/* Status indicator */}
                      {isTaskRunning && (
                        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0 bg-green-500 animate-pulse" />
                      )}

                      {/* Play / Pause Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 rounded-full flex-shrink-0",
                          isTaskRunning
                            ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            : "text-green-600 hover:bg-green-50 hover:text-green-700"
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isTaskRunning) {
                            handlePause(task.id)
                          } else {
                            handlePlay(task.id)
                          }
                        }}
                      >
                        {isTaskRunning ? (
                          <Pause className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
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