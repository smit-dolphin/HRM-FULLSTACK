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
import { useQuery } from '@tanstack/react-query'
import { activeTaskSessionQueryOptions, useCurrentElepsedTimeTaskSession, useStartTaskSession, usePauseTaskSession, useCompleteTaskSession } from '@/querryOptions/taskSessionOptions'
import { fetchMyTasksService } from '@/services/taskService/taskService'
import { useTaskStore } from '@/store/useTaskStore'
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
// const initialTasks: TimerTask[] = [
//   { id: '1', name: 'Design landing page', project: 'Website Redesign', status: 'paused' },
//   { id: '2', name: 'Fix login bug', project: 'HRM App', status: 'paused' },
//   { id: '3', name: 'Write API docs', project: 'Backend Services', status: 'paused' },
//   { id: '4', name: 'Setup CI/CD pipeline', project: 'DevOps', status: 'paused' },
// ]
// Removed dummy tasks state


const TimerFormateHourMinutSecondHelper = (sec: number) => {

  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = sec % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function Header({
  collapsed = false,
  onOpenMobile,
}: HeaderProps) {
  const { user } = useAuthStore()
  const myTasksQuery = useQuery({
    queryKey: ['myTasks'],
    queryFn: () => fetchMyTasksService(),
  })
  
  const { tasks:activeTasks,currentTask,addTask, setCurrentTask, clearCurrentTask } = useTaskStore()
  // const tasks = myTasksQuery.data?.data || []
  const tasks = activeTasks || []

  const activeSessionQuery = useQuery(activeTaskSessionQueryOptions)
  const activeSession = activeSessionQuery.data

  const startTask = useStartTaskSession()
  const pauseTask = usePauseTaskSession()
  const completeTask = useCompleteTaskSession()

  // Sync active backend session with local store
  React.useEffect(() => {
    if (activeSession && activeSession.taskSessionStatus === 'running') {
      const t = tasks.find(t => t.id === activeSession.taskId)
      if (t) addTask(t)
        // setCurrentTask(t)
    } else if (activeSession && activeSession.taskSessionStatus === 'completed') {
      clearCurrentTask()
    }
  }, [activeSession,addTask, tasks, setCurrentTask, clearCurrentTask])

  // this part store current task
  const runningTask = activeSession && activeSession.taskSessionStatus === 'running'
    ? activeSession.task
    : undefined

  const handlePlay = (taskToPlay: any) => {
    setCurrentTask(taskToPlay)
    startTask.mutate(taskToPlay.id || taskToPlay.taskId)
  }

  const handlePause = (taskId: string) => {
    pauseTask.mutate(taskId)
  }

  const handleStop = () => {
    if (activeSession?.taskId) {
      completeTask.mutate(activeSession.taskId)
      clearCurrentTask()
    }
  }




  const handleHeaderToggle = () => {
    if (runningTask) {
      handlePause(runningTask.id || activeSession.taskId)
    } else if (currentTask) {
      handlePlay(currentTask)
    } else if (activeSession?.taskId) {
      handlePlay({ id: activeSession.taskId })
    } else if (tasks.length > 0) {
      handlePlay(tasks[0])
    }
  }

  const currenttimeres = useQuery(useCurrentElepsedTimeTaskSession)

  const serverElapsedSeconds =
    currenttimeres.data?.data.totalElepsedTimeSeconds ?? 0

  // Local timer state
  const [elapsedSeconds, setElapsedSeconds] = React.useState(serverElapsedSeconds)

  // Whenever backend data changes (initial load/refetch),
  // sync the local timer.
  React.useEffect(() => {
    setElapsedSeconds(serverElapsedSeconds)
  }, [serverElapsedSeconds])

  const currentTaskStatus =
    currenttimeres.data?.data.currentTaskStatus as
    | 'running'
    | 'paused'
    | 'completed'
    | undefined

  React.useEffect(() => {
    if (currentTaskStatus !== 'running') {
      setElapsedSeconds(serverElapsedSeconds)
      return
    }

    setElapsedSeconds(prev =>
      serverElapsedSeconds > prev ? serverElapsedSeconds : prev
    )
  }, [serverElapsedSeconds, currentTaskStatus,addTask])

  // Increment only while running.
  React.useEffect(() => {
    if (!activeSession) return
    if (currentTaskStatus !== 'running') return

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [currentTaskStatus])

  // Format only when displaying.
  const currentTime = React.useMemo(() => {
    return TimerFormateHourMinutSecondHelper(elapsedSeconds)
  }, [elapsedSeconds])

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
                {tasks.map((task: any) => {
                  const isTaskRunning = activeSession?.taskId === task.id && activeSession?.taskSessionStatus === 'running'

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
                            {task.project?.name || 'No Project'}
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
                            handlePlay(task)
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

          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm">
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

            {/* <ChevronDown className="h-4 w-4 text-muted-foreground" /> */}
          </div>
        </div>
      </div>
    </header>
  )
}