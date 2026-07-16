import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { BriefcaseBusiness, ClipboardList, Plus, Trash2, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/PageHeader'
import { querryClient } from '@/querryOptions/querryClinets'
import { fetchEmployeesService, type Employee } from '@/services/employeeService/employeeService'
import { fetchProjectsService, removeProjectMemberService, updateProjectStatusService, type Project } from '@/services/projectService/projectService'
import { fetchTasksService, type Task } from '@/services/taskService/taskService'
import CreateProjectForm from '@/components/forms/projectForms/CreateProjectForm'
import AssignEmployeeForm from '@/components/forms/projectForms/AssignEmployeeForm'
import CreateTaskForm from '@/components/forms/projectForms/CreateTaskForm'
import EditProjectForm from '@/components/forms/projectForms/EditProjectForm'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/shared'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { useNavigate } from '@tanstack/react-router'

type ProjectWithMembers = Project & {
  members?: Array<{
    projectId: string
    employeeId: string
    employee?: {
      id: string
      departmentId: string
      designationId: string
      user?: {
        id: string
        firstName: string
        lastName: string
        email: string
        profileImage?: string
      }
    }
  }>
}


type ProjectRow = {
  id: string
  name: string
  description: string
  status: string
  progress: number
  tasks: number
  members: number
  completedTasks: number
  deadline: string
}


export function Projects() {
  const [projectDialogOpen, setProjectDialogOpen] = React.useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = React.useState(false)
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null)
  const [editProjectDialogOpen, setEditProjectDialogOpen] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)


  const navigate = useNavigate()
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjectsService({ limit: 100 }),
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasksService({ limit: 200 }),
  })


  const projects = (projectsQuery.data?.data ?? []) as ProjectWithMembers[]
  const tasks = tasksQuery.data?.data ?? []



  const updateProjectStatusMutation = useMutation({
    mutationFn: ({
      projectId,
      status,
    }: {
      projectId: string
      status: string
    }) => updateProjectStatusService(projectId, { status }),
    onSuccess: () => {
      toast.success('Project status updated')
      querryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project status')
    },
  })


  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, employeeId }: { projectId: string; employeeId: string }) =>
      removeProjectMemberService(projectId, employeeId),
    onSuccess: () => {
      toast.success('Member removed from project')
      querryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })



  const handleOpenTaskDialog = (project: Project) => {
    setSelectedProject(project)
    setTaskDialogOpen(true)
  }

  const handleOpenMemberDialog = (project: Project) => {
    setSelectedProject(project)

    setMemberDialogOpen(true)
  }

  const handleRemoveMember = (projectId: string, employeeId: string) => {
    removeMemberMutation.mutate({ projectId, employeeId })
  }


  const employeesQuery = useQuery({
    queryKey: ['employee-options'],
    queryFn: () => fetchEmployeesService({ page: 1, limit: 200 }),
  })
  const employees = employeesQuery.data?.data ?? []


  const handleOpenEditProject = (project: Project) => {
    setEditingProject(project)
    setEditProjectDialogOpen(true)
  }

  const projectRows: ProjectRow[] = projects.map((project) => {
  const projectTasks = tasks.filter(
    (task) => task.projectId === project.id
  )

  const completedTasks = projectTasks.filter(
    (task) => task.status === 'completed'
  ).length

  const progress =
    projectTasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / projectTasks.length) * 100
        )

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? '',
    status: project.status,
    progress,
    tasks: projectTasks.length,
    members: project.members?.length ?? 0,
    completedTasks,
    deadline: project.deadline?.split('T')[0] ?? '-',
  }
})

const columnHelper = createColumnHelper<ProjectRow>()



const columns = [
  columnHelper.accessor('name', {
    header: 'Project',
    cell: (info) => (
      <div>
        <p className="font-medium">
          {info.row.original.name}
        </p>

        <p className="text-xs text-muted-foreground line-clamp-1">
          {info.row.original.description} 
        </p>
      </div>
    ),
  }),

  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <StatusBadge
        label={info.getValue()}
        variant={
          info.getValue() === 'completed'
            ? 'success'
            : 'warning'
        }
      />
    ),
  }),

  columnHelper.accessor('progress', {
    header: 'Progress',
    cell: (info) => (
      <div className="w-32">
        <div className="flex justify-between text-xs mb-1">
          <span>{info.getValue()}%</span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{
              width: `${info.getValue()}%`,
            }}
          />
        </div>
      </div>
    ),
  }),

  columnHelper.accessor('tasks', {
    header: 'Tasks',
  }),

  columnHelper.accessor('members', {
    header: 'Members',
  }),

  columnHelper.accessor('completedTasks', {
    header: 'Done',
  }),

  columnHelper.accessor('deadline', {
    header: 'Deadline',
  }),

  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => {
      const project = projects.find(
        (p) => p.id === info.row.original.id
      )

      if (!project) return null

      const items: ActionMenuItem[] = [
        {
        label: 'View Details',
        onClick: () =>
          navigate({ to: '/projects/$id', params: { id: project.id } }),
      },
        {
          label: 'Edit',
          onClick: () => handleOpenEditProject(project),
        },
        {
          label: 'Assign Employee',
          onClick: () => handleOpenMemberDialog(project),
        },
        {
          label: 'Create Task',
          onClick: () => handleOpenTaskDialog(project),
        },
      ]

      return <ActionMenu items={items} />
    },
  }),
]
  return (
    <div className="space-y-6">


      <PageHeader
        title="Projects"
        subtitle="Create projects, assign employees, and manage work items from one place."
      >
        <Button onClick={() => setProjectDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Active projects</p>
            <BriefcaseBusiness className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold">{projects.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total tasks</p>
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold">{tasks.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Employees available</p>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold">{employees.length}</p>
        </div>
      </div>

      <DataTable
  data={projectRows}
  columns={columns}
  loading={projectsQuery.isPending}
  searchable={false}
  emptyMessage="No projects found."
/>

      {/* <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
            No projects yet. Create the first one to get started.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const projectTasks = tasks.filter(
                (task) => task.projectId === project.id
              )

              const members = project.members ?? []

              const completedTasks = projectTasks.filter(
                (task) => task.status === 'completed'
              ).length

              const progress =
                projectTasks.length === 0
                  ? 0
                  : Math.round(
                    (completedTasks / projectTasks.length) * 100
                  )

              return (
                <div
                  key={project.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {project.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {project.description ||
                          'No description available'}
                      </p>
                    </div>

                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">
                        Tasks
                      </p>
                      <p className="text-lg font-semibold">
                        {projectTasks?.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">
                        Members
                      </p>
                      <p className="text-lg font-semibold">
                        {members.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">
                        Done
                      </p>
                      <p className="text-lg font-semibold">
                        {completedTasks}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-xl border p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Deadline
                      </p>

                      <p className="font-medium">
                        {project?.deadline?.split('T')[0]}
                      </p>
                    </div>

                    <div className="flex -space-x-2">
                      {members.slice(0, 4).map((member) => (
                        <div
                          key={member.employeeId}
                          className="flex h-8 w-8 items-center justify-center rounded-full border bg-primary/10 text-xs font-semibold"
                          title={member.employee?.user?.email}
                        >
                          {(
                            member.employee?.user?.email[0] ??
                            'U'
                          ).toUpperCase()}
                        </div>
                      ))}

                      {members.length > 4 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-xs">
                          +{members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleOpenEditProject(project)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleOpenMemberDialog(project)
                      }
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign
                    </Button>

                    <Button
                      size="sm"
                      onClick={() =>
                        handleOpenTaskDialog(project)
                      }
                    >
                      Create Task
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div> */}


      <CreateProjectForm
        open={projectDialogOpen}
        setOpen={setProjectDialogOpen} />

      <CreateTaskForm
        open={taskDialogOpen}
        setOpen={setTaskDialogOpen}
        project={selectedProject}
        setProject={setSelectedProject} />

      <EditProjectForm
        open={editProjectDialogOpen}
        setOpen={setEditProjectDialogOpen}
        project={editingProject}
        setProject={setEditingProject}
      />

      <AssignEmployeeForm
        open={memberDialogOpen}
        setOpen={setMemberDialogOpen}
        project={selectedProject}
        setProject={setSelectedProject}
      />
    </div>
  )
}
