import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { BriefcaseBusiness, ClipboardList, Plus, Trash2, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/PageHeader'
import { DialogForm, FormActions, FormField, FormInput, FormSelect, FormTextarea } from '@/components/forms/DialogForm'
import { querryClient } from '@/querryOptions/querryClinets'
import { fetchEmployeesService, type Employee } from '@/services/employeeService/employeeService'
import { addProjectMemberService, createProjectService, fetchProjectMembersService, fetchProjectsService, removeProjectMemberService, type Project, type ProjectMember } from '@/services/projectService/projectService'
import { createTaskService, fetchTasksService, type Task } from '@/services/taskService/taskService'

type ProjectFormValues = {
  name: string
  description: string
}

type TaskFormValues = {
  name: string
  description: string
  projectId: string
  ownerId: string
}

type MemberFormValues = {
  employeeId: string
}

export function Projects() {
  const [projectDialogOpen, setProjectDialogOpen] = React.useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = React.useState(false)
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null)
  const [projectMembers, setProjectMembers] = React.useState<Record<string, ProjectMember[]>>({})

  const projectForm = useForm<ProjectFormValues>({
    defaultValues: { name: '', description: '' },
  })

  const taskForm = useForm<TaskFormValues>({
    defaultValues: { name: '', description: '', projectId: '', ownerId: '' },
  })

  const memberForm = useForm<MemberFormValues>({
    defaultValues: { employeeId: '' },
  })

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjectsService({ limit: 100 }),
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasksService({ limit: 200 }),
  })

  const employeesQuery = useQuery({
    queryKey: ['employee-options'],
    queryFn: () => fetchEmployeesService({ page: 1, limit: 200 }),
  })

  const projects = projectsQuery.data?.data ?? []
  const tasks = tasksQuery.data?.data ?? []
  const employees = employeesQuery.data?.data ?? []

  const projectOptions = projects.map((project) => ({ value: project.id, label: project.name }))
  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: `${employee.user?.name ?? 'Employee'} (${employee.user?.email ?? ''})`,
  }))

  const employeeNameMap = React.useMemo(() => {
    return employees.reduce<Record<string, string>>((acc, employee) => {
      acc[employee.id] = employee.user?.name ?? 'Employee'
      return acc
    }, {})
  }, [employees])

  const projectMembersQuery = useQuery({
    queryKey: ['project-members', selectedProject?.id],
    queryFn: () => fetchProjectMembersService(selectedProject!.id),
    enabled: !!selectedProject?.id,
  })

  React.useEffect(() => {
    if (selectedProject?.id && projectMembersQuery.data?.data) {
      setProjectMembers((prev) => ({ ...prev, [selectedProject.id]: projectMembersQuery.data.data }))
    }
  }, [projectMembersQuery.data, selectedProject?.id])

  const createProjectMutation = useMutation({
    mutationFn: createProjectService,
    onSuccess: () => {
      toast.success('Project created successfully')
      setProjectDialogOpen(false)
      projectForm.reset()
      querryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project')
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: createTaskService,
    onSuccess: () => {
      toast.success('Task created successfully')
      setTaskDialogOpen(false)
      taskForm.reset()
      querryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task')
    },
  })

  const assignMemberMutation = useMutation({
    mutationFn: ({ projectId, employeeId }: { projectId: string; employeeId: string }) =>
      addProjectMemberService(projectId, { employeeId }),
    onSuccess: (_, variables) => {
      toast.success('Employee assigned to project')
      setProjectMembers((prev) => ({
        ...prev,
        [variables.projectId]: [
          ...(prev[variables.projectId] ?? []),
          {
            projectId: variables.projectId,
            employeeId: variables.employeeId,
            employee: {
              id: variables.employeeId,
              departmentId: '',
              designationId: '',
              user: {
                id: variables.employeeId,
                firstName: employeeNameMap[variables.employeeId] ?? 'Employee',
                lastName: '',
                email: '',
              },
            },
          },
        ],
      }))
      setMemberDialogOpen(false)
      memberForm.reset()
      querryClient.invalidateQueries({ queryKey: ['projects'] })
      querryClient.invalidateQueries({ queryKey: ['project-members'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign employee')
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, employeeId }: { projectId: string; employeeId: string }) =>
      removeProjectMemberService(projectId, employeeId),
    onSuccess: (_, variables) => {
      toast.success('Member removed from project')
      setProjectMembers((prev) => ({
        ...prev,
        [variables.projectId]: (prev[variables.projectId] ?? []).filter((member) => member.employeeId !== variables.employeeId),
      }))
      querryClient.invalidateQueries({ queryKey: ['project-members'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })

  const handleCreateProject = (values: ProjectFormValues) => {
    createProjectMutation.mutate({ name: values.name, description: values.description })
  }

  const handleCreateTask = (values: TaskFormValues) => {
    createTaskMutation.mutate({
      name: values.name,
      description: values.description,
      projectId: values.projectId,
      ownerId: values.ownerId,
    })
  }

  const handleOpenTaskDialog = (project: Project) => {
    setSelectedProject(project)
    taskForm.setValue('projectId', project.id)
    setTaskDialogOpen(true)
  }

  const handleOpenMemberDialog = (project: Project) => {
    setSelectedProject(project)
    memberForm.setValue('employeeId', '')
    setMemberDialogOpen(true)
  }

  const handleRemoveMember = (projectId: string, employeeId: string) => {
    removeMemberMutation.mutate({ projectId, employeeId })
  }

  const handleAssignMember = (values: MemberFormValues) => {
    if (!selectedProject) return
    assignMemberMutation.mutate({ projectId: selectedProject.id, employeeId: values.employeeId })
  }

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

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
            No projects yet. Create the first one to get started.
          </div>
        ) : (
          projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id)
            const members = projectMembers[project.id] ?? []

            return (
              <div key={project.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BriefcaseBusiness className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description || 'No description provided yet.'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {project.status || 'In Progress'}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {projectTasks.length} task{projectTasks.length === 1 ? '' : 's'}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {members.length} member{members.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenMemberDialog(project)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Employee
                    </Button>
                    <Button size="sm" onClick={() => handleOpenTaskDialog(project)}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Create Task
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-xl border bg-background/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Members</h4>
                      <span className="text-xs text-muted-foreground">Assigned people</span>
                    </div>

                    {members.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No members assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div key={member.employeeId} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
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
                              onClick={() => handleRemoveMember(project.id, member.employeeId)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border bg-background/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Tasks</h4>
                      <span className="text-xs text-muted-foreground">Keep delivery moving</span>
                    </div>

                    {projectTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tasks for this project yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {projectTasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                            <div>
                              <p className="text-sm font-medium">{task.name}</p>
                              <p className="text-xs text-muted-foreground">{task.description || 'No description'}</p>
                            </div>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                              {task.status || 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <DialogForm
        open={projectDialogOpen}
        onClose={() => {
          setProjectDialogOpen(false)
          projectForm.reset()
        }}
        title="Create Project"
        subtitle="Start a new delivery track and assign work later."
        maxWidth="md"
      >
        <form onSubmit={projectForm.handleSubmit(handleCreateProject)} className="space-y-4">
          <FormField label="Project name" required error={projectForm.formState.errors.name?.message}>
            <FormInput
              {...projectForm.register('name', { required: 'Project name is required' })}
              placeholder="e.g. AI Learning Platform"
            />
          </FormField>

          <FormField label="Description">
            <FormTextarea
              {...projectForm.register('description')}
              placeholder="Describe the goal of this project"
            />
          </FormField>

          <FormActions
            onCancel={() => {
              setProjectDialogOpen(false)
              projectForm.reset()
            }}
            submitLabel="Create Project"
            isSubmitting={createProjectMutation.isPending}
          />
        </form>
      </DialogForm>

      <DialogForm
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false)
          taskForm.reset()
          setSelectedProject(null)
        }}
        title="Create Task"
        subtitle={selectedProject ? `Add a task to ${selectedProject.name}` : 'Create a task for a project'}
        maxWidth="md"
      >
        <form onSubmit={taskForm.handleSubmit(handleCreateTask)} className="space-y-4">
          <FormField label="Task name" required error={taskForm.formState.errors.name?.message}>
            <FormInput
              {...taskForm.register('name', { required: 'Task name is required' })}
              placeholder="e.g. Build onboarding flow"
            />
          </FormField>

          <FormField label="Description">
            <FormTextarea
              {...taskForm.register('description')}
              placeholder="Describe the task details"
            />
          </FormField>

          <FormField label="Project" required error={taskForm.formState.errors.projectId?.message}>
            <FormSelect
              {...taskForm.register('projectId', { required: 'Please select a project' })}
              options={projectOptions}
              placeholder="Select a project"
            />
          </FormField>

          <FormField label="Assign to employee" required error={taskForm.formState.errors.ownerId?.message}>
            <FormSelect
              {...taskForm.register('ownerId', { required: 'Please select an employee' })}
              options={employeeOptions}
              placeholder="Select employee"
            />
          </FormField>

          <FormActions
            onCancel={() => {
              setTaskDialogOpen(false)
              taskForm.reset()
              setSelectedProject(null)
            }}
            submitLabel="Create Task"
            isSubmitting={createTaskMutation.isPending}
          />
        </form>
      </DialogForm>

      <DialogForm
        open={memberDialogOpen}
        onClose={() => {
          setMemberDialogOpen(false)
          memberForm.reset()
          setSelectedProject(null)
        }}
        title="Assign Employee"
        subtitle={selectedProject ? `Add someone to ${selectedProject.name}` : 'Assign an employee to a project'}
        maxWidth="md"
      >
        <form onSubmit={memberForm.handleSubmit(handleAssignMember)} className="space-y-4">
          <FormField label="Employee" required error={memberForm.formState.errors.employeeId?.message}>
            <FormSelect
              {...memberForm.register('employeeId', { required: 'Please select an employee' })}
              options={employeeOptions}
              placeholder="Select employee"
            />
          </FormField>

          <FormActions
            onCancel={() => {
              setMemberDialogOpen(false)
              memberForm.reset()
              setSelectedProject(null)
            }}
            submitLabel="Assign"
            isSubmitting={assignMemberMutation.isPending}
          />
        </form>
      </DialogForm>
    </div>
  )
}
