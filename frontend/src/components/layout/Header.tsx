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
import { fetchMyTasksService, type Task } from '@/services/taskService/taskService'
import { useTaskStore } from '@/store/useTaskStore'
import { useShallow } from 'zustand/react/shallow'
import useTaskTimer from '@/hooks/useTaskTimer'



type HeaderProps = {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onOpenMobile?: () => void
}

// type TaskStatus = 'running' | 'paused'

// interface TimerTask {
//   id: string
//   name: string
//   project: string
//   status: TaskStatus
// }




export function Header({
  collapsed = false,
  onOpenMobile,
}: HeaderProps) {



  const { user } = useAuthStore()


  const {
    tasks,
    currentTask,
    addTask,
    setCurrentTask,
    clearCurrentTask,
    currentStatus,
    changeStatus
  } = useTaskStore(
    useShallow((state) => ({
      tasks: state.tasks,
      currentTask: state.currentTask,
      addTask: state.addTask,
      setCurrentTask: state.setCurrentTask,
      clearCurrentTask: state.clearCurrentTask,
      currentStatus: state.currentStatus,
      changeStatus: state.changeStatus
    }))
  )

  const { currentrCalculatedTimer } = useTaskTimer()


  // const activeSessionQuery = useQuery(activeTaskSessionQueryOptions)
  // const activeSession = activeSessionQuery.data

  const startTask = useStartTaskSession()
  const pauseTask = usePauseTaskSession()
  const completeTask = useCompleteTaskSession()


  // const runningTask = activeSession && activeSession.taskSessionStatus === 'running'
  //   ? activeSession.task
  //   : undefined

   const activeSession = useQuery(activeTaskSessionQueryOptions)
  const activetask = React.useMemo(()=>{ return activeSession.data?.task},[activeSession])
  // console.log(activetask)
  React.useEffect(() => {
  if (
  activeSession.data?.taskSessionStatus === "running" &&
  activetask &&
  currentTask === null
) {
  addTask(activetask as Task)
  changeStatus("play")
}
}, [activetask, currentStatus, currentTask])

  const handlePlay = (taskToPlay: any) => {
    setCurrentTask(taskToPlay)
    startTask.mutate(taskToPlay.id || taskToPlay.taskId)
    changeStatus("play")
  }

  const handlePause = (taskId: string) => {
    pauseTask.mutate(taskId)
    console.log("pausing task with id:", taskId)
    changeStatus("pause")
  }

  const handleStop = () => {
    if (currentTask?.id) {
      completeTask.mutate(currentTask.id)
      changeStatus("stop")
      clearCurrentTask()
    }
  }




  const handleHeaderToggle = () => {
    // if (runningTask) {
    //   handlePause(runningTask.id || activeSession.taskId)
    // } else
    if (currentTask && currentStatus === "pause") {
      handlePlay(currentTask)
    } else if(currentTask && currentStatus === "play"){
      handlePause(currentTask.id)
    }
  }








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
                      !currentTask
                        ? "bg-red-100 text-red-600"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                  </div>

                  <span
                    className={cn(
                      "font-mono text-base font-semibold tracking-wider",
                      currentStatus!=="play" && "text-red-600"
                    )}
                  >
                    {currentrCalculatedTimer}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </PopoverTrigger>

              <Button
                variant="ghost"
                className="h-10 rounded-none border-l px-3"
                onClick={handleHeaderToggle}
              >
                {  currentStatus!=="play" ? (
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
                  const isTaskRunning = currentTask?.id === task.id && currentStatus === 'play'

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