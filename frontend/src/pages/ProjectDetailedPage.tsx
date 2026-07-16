import React from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  ClipboardList,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/PageHeader'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { querryClient } from '@/querryOptions/querryClinets'
import { fetchEmployeesService } from '@/services/employeeService/employeeService'
import {
  fetchProjectByIdService,
  fetchProjectMembersService,
  removeProjectMemberService,
  updateProjectStatusService,
} from '@/services/projectService/projectService'
import {
  deleteTaskService,
  fetchTasksService,
  updateTaskStatusService,
  type Task,
} from '@/services/taskService/taskService'
import CreateTaskForm from '@/components/forms/projectForms/CreateTaskForm'
import EditProjectForm from '@/components/forms/projectForms/EditProjectForm'
import AssignEmployeeForm from '@/components/forms/projectForms/AssignEmployeeForm'

const PROJECT_STATUS_OPTIONS = ['planning', 'active', 'on_hold', 'completed', 'cancelled']
const TASK_STATUS_OPTIONS = ['todo','in_progress', 'paused', 'completed', 'cancelled']

export const ProjectDetailedPage = () => {
  // NOTE: adjust `from` to your actual route id for full type-safety, e.g.
  // useParams({ from: '/projects/$projectId' }). `strict: false` keeps this
  // working regardless of where this page is mounted in the route tree.
  const { id: projectId } = useParams({ strict: false }) as { id: string }

  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [editProjectDialogOpen, setEditProjectDialogOpen] = React.useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = React.useState(false)

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectByIdService(projectId),
    enabled: Boolean(projectId),
  })

  const membersQuery = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => fetchProjectMembersService(projectId),
    enabled: Boolean(projectId),
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: () => fetchTasksService({ projectId, limit: 200 }),
    enabled: Boolean(projectId),
  })

  const employeesQuery = useQuery({
    queryKey: ['employee-options'],
    queryFn: () => fetchEmployeesService({ page: 1, limit: 200 }),
  })

  const project = projectQuery.data?.data
  const members = membersQuery.data?.data ?? []
  const tasks = tasksQuery.data?.data ?? []
  const employees = employeesQuery.data?.data ?? []

  const employeeNameById = React.useMemo(() => {
    const map = new Map<string, string>()
    employees.forEach((employee) => {
      const name = `${employee.user?.firstName ?? ''} ${employee.user?.lastName ?? ''}`.trim()
      map.set(employee.id, name || employee.user?.email || 'Unknown')
    })
    return map
  }, [employees])

  const completedTasks = tasks.filter((task) => task.status === 'completed').length
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100)

  // ---------- Mutations ----------

  const updateProjectStatusMutation = useMutation({
    mutationFn: (status: string) => updateProjectStatusService(projectId, { status }),
    onSuccess: () => {
      toast.success('Project status updated')
      querryClient.invalidateQueries({ queryKey: ['project', projectId] })
      querryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project status')
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (employeeId: string) => removeProjectMemberService(projectId, employeeId),
    onSuccess: () => {
      toast.success('Member removed from project')
      querryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTaskStatusService(id, { status }),
    onSuccess: () => {
      toast.success('Task status updated')
      querryClient.invalidateQueries({ queryKey: ['tasks', { projectId }] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task status')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTaskService,
    onSuccess: () => {
      toast.success('Task deleted')
      querryClient.invalidateQueries({ queryKey: ['tasks', { projectId }] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task')
    },
  })

  // ---------- Handlers ----------

  const handleDeleteTask = (task: Task) => {
    if (window.confirm(`Delete task "${task.name}"?`)) {
      deleteTaskMutation.mutate(task.id)
    }
  }

  const buildTaskActions = (task: Task): ActionMenuItem[] => [
    {
      label: 'Delete',
      onClick: () => handleDeleteTask(task),
    },
  ]

  if (projectQuery.isPending) {
    return <div className="p-6 text-sm text-muted-foreground">Loading project…</div>
  }

  if (projectQuery.isError || !project) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Couldn't load this project.</p>
        <Button variant="outline" asChild>
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Projects
      </Link>

      <PageHeader title={project.name} subtitle={project.description || 'No description provided yet.'}>
        <Button variant="outline" onClick={() => setEditProjectDialogOpen(true)}>
          Edit Project
        </Button>
        <Button variant="outline" onClick={() => setMemberDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Employee
        </Button>
        <Button onClick={() => setTaskDialogOpen(true)}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={project.status}
          onChange={(e) => updateProjectStatusMutation.mutate(e.target.value)}
          className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium capitalize"
        >
          {PROJECT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>

        {project.deadline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
            <Calendar className="h-3.5 w-3.5" />
            {project.deadline.split('T')[0]}
          </span>
        )}

        <span className="rounded-full border px-3 py-1.5 text-xs font-medium">
          Manager: {project.managerId ? (employeeNameById.get(project.managerId) ?? 'Unassigned') : 'Unassigned'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Tasks</p>
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold">{tasks.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Members</p>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold">{members.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Progress</p>
            <BriefcaseBusiness className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold">{progress}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Members</h4>
            <span className="text-xs text-muted-foreground">Assigned people</span>
          </div>

          {membersQuery.isPending ? (
            <p className="text-sm text-muted-foreground">Loading members…</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.employeeId} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {member.employee?.user?.firstName || member.employee?.user?.email || 'Employee'}
                      {member.employee?.user?.lastName ? ` ${member.employee.user.lastName}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.employee?.user?.email || 'No email'}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMemberMutation.mutate(member.employeeId)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Tasks</h4>
            <Button variant="ghost" size="sm" onClick={() => setTaskDialogOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add task
            </Button>
          </div>

          {tasksQuery.isPending ? (
            <p className="text-sm text-muted-foreground">Loading tasks…</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks for this project yet.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {task.description || 'No description'}
                      {task.ownerId ? ` · ${employeeNameById.get(task.ownerId) ?? 'Unassigned'}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatusMutation.mutate({ id: task.id, status: e.target.value })}
                      className="rounded-full border bg-muted px-2 py-1 text-xs font-medium capitalize"
                    >
                      {TASK_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <ActionMenu items={buildTaskActions(task)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTaskForm
        open={taskDialogOpen}
        setOpen={setTaskDialogOpen}
        project={project}
        setProject={() => {}}
      />

      <EditProjectForm
        open={editProjectDialogOpen}
        setOpen={setEditProjectDialogOpen}
        project={project}
        setProject={() => {}}
      />

      <AssignEmployeeForm
        open={memberDialogOpen}
        setOpen={setMemberDialogOpen}
        project={project}
        setProject={() => {}}
      />
    </div>
  )
}
 
