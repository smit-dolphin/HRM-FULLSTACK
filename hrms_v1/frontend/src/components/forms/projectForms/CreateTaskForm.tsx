import React, { useEffect } from 'react'
import { DialogForm, FormActions, FormField, FormInput, FormSelect, FormTextarea } from '@/components/forms/DialogForm'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createProjectService, fetchProjectsService, type Project } from '@/services/projectService/projectService'
import { querryClient } from '@/querryOptions/querryClinets' 
import { createTaskService } from '@/services/taskService/taskService'

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

type TaskFormValues = {
  name: string
  description: string
  projectId: string
  ownerId: string
}

type projectType = Project | null;

interface assignEmployeeForm {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    project: projectType,
    setProject: React.Dispatch<React.SetStateAction<projectType>>
}



const CreateTaskForm = ({
    open,
    setOpen,
    project,
    setProject

}: assignEmployeeForm) => {

  const taskForm = useForm<TaskFormValues>({
    defaultValues: { name: '', description: '', projectId: '', ownerId: '' },
  })
    useEffect(() => {
  if (!project) return;

  taskForm.setValue("projectId", project.id);
  taskForm.setValue("ownerId", "");
}, [project]);
  const projectsQuery = useQuery({
     queryKey: ['projects'],
     queryFn: () => fetchProjectsService({ limit: 100 }),
   })
  
const projects = (projectsQuery.data?.data ?? []) as ProjectWithMembers[]
const projectOptions = projects.map((project) => ({ value: project.id, label: project.name }))

     const watchedProjectId = taskForm.watch('projectId')
    const taskProjectMembersOptions = React.useMemo(() => {
      if (!watchedProjectId) return []
      const project = projects.find(p => p.id === watchedProjectId)
      if (!project || !project.members) return []
      return project.members.map((m: any) => ({
        value: m.employee.id,
        label: `${m.employee.user?.firstName ?? ''} ${m.employee.user?.lastName ?? ''} (${m.employee.user?.email ?? ''})`,
      }))
    }, [watchedProjectId, projects])


  const createTaskMutation = useMutation({
      mutationFn: createTaskService,
      onSuccess: () => {
        toast.success('Task created successfully')
        setOpen(false)
        taskForm.reset()
        querryClient.invalidateQueries({ queryKey: ['tasks'] })
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create task')
      },
    })

    const handleCreateTask = (values: TaskFormValues) => {
    createTaskMutation.mutate({
      name: values.name,
      description: values.description,
      projectId: values.projectId,
      ownerId: values.ownerId,
    })
  }
  return (
    <div>
      <DialogForm
              open={open}
              onClose={() => {
                setOpen(false)
                taskForm.reset()
                setProject(null)
              }}
              title="Create Task"
              subtitle={project ? `Add a task to ${project.name}` : 'Create a task for a project'}
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
                    options={taskProjectMembersOptions}
                    placeholder={taskProjectMembersOptions.length === 0 ? "No members in this project yet" : "Select employee"}
                    disabled={taskProjectMembersOptions.length === 0}
                  />
                </FormField>
      
                <FormActions
                  onCancel={() => {
                    setOpen(false)
                    taskForm.reset()
                    setProject(null)
                  }}
                  submitLabel="Create Task"
                  isSubmitting={createTaskMutation.isPending}
                />
              </form>
            </DialogForm>
    </div>
  )
}

export default CreateTaskForm