import React, { useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTasksService, updateTaskStatusService, type Task } from '@/services/taskService/taskService'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

interface TaskShape {
  id: string
  name: string
  description?: string
  status: 'todo' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
}

const columns = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'paused', title: 'Paused' },
  { key: 'completed', title: 'Completed' },
  { key: 'cancelled', title: 'Cancelled' },
] as const

type TaskStatus = TaskShape['status']

const normalizeTaskStatus = (status?: string): TaskStatus => {
  const normalized = status?.toLowerCase()
  if (normalized && ['todo', 'in_progress', 'paused', 'completed', 'cancelled'].includes(normalized)) {
    return normalized as TaskStatus
  }
  return 'todo'
}

const formatStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status.replace('_', ' ')
  }
}

export function KanbanBoard() {
  const queryClient = useQueryClient()
  const draggingTask = useRef<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const { data: response, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => fetchTasksService({ limit: 200 }),
})

const tasks = (response?.data ?? []).map((task) => ({
  id: task.id,
  name: task.name,
  description: task.description,
  status: normalizeTaskStatus(task.status),
}))
interface TaskListResponse {
  success: boolean
  message: string
  data: any
}

  const updateTaskMutation = useMutation({
  mutationFn: ({
    taskId,
    status,
  }: {
    taskId: string
    status: TaskStatus
  }) => updateTaskStatusService(taskId, { status }),

  onMutate: async ({ taskId, status }) => {
    await queryClient.cancelQueries({
      queryKey: ['tasks'],
    })

    const previousTasks = queryClient.getQueryData<TaskListResponse>([
      'tasks',
    ])

    queryClient.setQueryData<TaskListResponse>(
      ['tasks'],
      (old) => {
        if (!old) return old

        return {
          ...old,
          data: old.data.map((task:Task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,
                }
              : task
          ),
        }
      }
    )

    return {
      previousTasks,
    }
  },

  onError: (_error, _variables, context) => {
    if (context?.previousTasks) {
      queryClient.setQueryData(
        ['tasks'],
        context.previousTasks
      )
    }

    toast.error('Could not update task status')
  },

  onSuccess: () => {
    toast.success('Task status updated')
  },

  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ['tasks'],
    })

    draggingTask.current = null
    setDragOverColumn(null)
  },
})

  const handleDragStart = (taskId: string, e: React.DragEvent<HTMLDivElement>) => {
    draggingTask.current = taskId
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    draggingTask.current = null
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault()

    if (!draggingTask.current) return

    updateTaskMutation.mutate({ taskId: draggingTask.current, status })
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Project board</h2>
          <p className="text-sm text-muted-foreground">Drag tasks between stages to update progress.</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
          {tasks.length} tasks
        </span>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          Loading tasks...
        </div>
      ) : (
        <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-4 xl:grid-cols-5">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.key)

            return (
              <div
                key={column.key}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDrop={(e) => handleDrop(e, column.key)}
                onDragLeave={handleDragLeave}
                className={cn(
                  'flex flex-col rounded-2xl border bg-card shadow-sm transition-colors',
                  dragOverColumn === column.key && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex items-center justify-between border-b px-4 py-4">
                  <div>
                    <h2 className="font-semibold">{column.title}</h2>
                    <p className="text-xs text-muted-foreground">{columnTasks.length} Tasks</p>
                  </div>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(task.id, e)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab rounded-xl border bg-background p-4 transition-all hover:shadow-md active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-semibold">{task.name}</h3>
                        <Popover>
  <PopoverTrigger >
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full"
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </PopoverTrigger>

  <PopoverContent
    
    className="w-12 p-1"
  >
    <button
      className="flex w-5 items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
      onClick={() => {
        console.log("Start", task.id)
      }}
    >
      ▶ Start Task
    </button>

    {/* <button
      className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
      onClick={() => {
        console.log("Pause", task.id)
      }}
    >
      ⏸ Pause Task
    </button> */}
{/* 
    <button
      className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
      onClick={() => {
        console.log("Resume", task.id)
      }}
    >
      ↻ Resume Task
    </button> */}
{/* 
    <button
      className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
      onClick={() => {
        console.log("Edit", task.id)
      }}
    >
      ✏ Edit
    </button> */}

    {/* <button
      className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
      onClick={() => {
        console.log("View", task.id)
      }}
    >
      👁 View Details
    </button> */}

    <div className="my-1 border-t" />

    <button
      className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      onClick={() => {
        console.log("Delete", task.id)
      }}
    >
      🗑 Delete Task
    </button>
  </PopoverContent>
</Popover>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">
                        {task.description || 'No task details available.'}
                      </p>

                      <div className="mt-4 flex items-center flex-col justify-between">
                        <span className="rounded-full bg-muted px-2 py-1 text-xs">#{task.id}</span>
                        <span className="text-xs text-muted-foreground">{formatStatusLabel(task.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
