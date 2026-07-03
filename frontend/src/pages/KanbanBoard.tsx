import React, { useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface TaskShape {
  id: string
  name: string
  status: 'todo' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
}

const initialTasks: TaskShape[] = [
  { id: '1', name: 'Design Login Page', status: 'todo' },
  { id: '2', name: 'Create Landing Page', status: 'todo' },

  { id: '3', name: 'Build Auth API', status: 'in_progress' },
  { id: '4', name: 'Employee CRUD', status: 'in_progress' },

  { id: '5', name: 'Attendance Module', status: 'paused' },

  { id: '6', name: 'Dashboard UI', status: 'completed' },
  { id: '7', name: 'Leave Management', status: 'completed' },

  { id: '8', name: 'Legacy Payroll', status: 'cancelled' },
]

const columns = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'paused', title: 'Paused' },
  { key: 'completed', title: 'Completed' },
  { key: 'cancelled', title: 'Cancelled' },
] as const

type TaskStatus = TaskShape['status']

export function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks)

  const draggingTask = useRef<string | null>(null)

  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const handleDragStart = (
    taskId: string,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    draggingTask.current = taskId
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    draggingTask.current = null
    setDragOverColumn(null)
  }

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    status: TaskStatus
  ) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    status: TaskStatus
  ) => {
    e.preventDefault()

    if (!draggingTask.current) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggingTask.current
          ? {
              ...task,
              status,
            }
          : task
      )
    )

    draggingTask.current = null
    setDragOverColumn(null)

    // TODO:
    // await updateTaskStatus(taskId, status)
  }

  return (
    <div className="w-full">
      <div className="grid h-[calc(100vh-170px)] grid-cols-5 gap-5">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.key
          )

          return (
            <div
              key={column.key}
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDrop={(e) => handleDrop(e, column.key)}
              onDragLeave={handleDragLeave}
              className={cn(
                'flex flex-col rounded-2xl border bg-card shadow-sm transition-colors',
                dragOverColumn === column.key &&
                  'border-primary bg-primary/5'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div>
                  <h2 className="font-semibold">{column.title}</h2>

                  <p className="text-xs text-muted-foreground">
                    {columnTasks.length} Tasks
                  </p>
                </div>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks */}
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
                      <h3 className="text-sm font-semibold">
                        {task.name}
                      </h3>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      Dummy description for this task.
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-muted px-2 py-1 text-xs">
                        #{task.id}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        2 days ago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}