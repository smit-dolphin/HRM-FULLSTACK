import React, { useEffect } from 'react'
import { DialogForm, FormActions, FormField, FormInput, FormSelect, FormTextarea } from '@/components/forms/DialogForm'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createProjectService, fetchProjectsService, updateProjectService, type Project } from '@/services/projectService/projectService'
import { querryClient } from '@/querryOptions/querryClinets'
import { createTaskService } from '@/services/taskService/taskService'
import { fetchEmployeesService } from '@/services/employeeService/employeeService'

type ProjectFormValues = {
    name: string
    description: string
    deadline?: string
    managerId?: string
}


type projectType = Project | null;
interface editEmployeeForm {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    project: projectType,
    setProject: React.Dispatch<React.SetStateAction<projectType>>
}
const EditProjectForm = ({
    open,
    setOpen,
    project,
    setProject

}: editEmployeeForm) => {


    const employeesQuery = useQuery({
        queryKey: ['employee-options'],
        queryFn: () => fetchEmployeesService({ page: 1, limit: 200 }),
    })
    const employees = employeesQuery.data?.data ?? []

    const employeeOptions = employees.map((employee) => ({
        value: employee.id,
        label: `${employee.user?.firstName ?? ''} ${employee.user?.lastName ?? ''} (${employee.user?.email ?? ''})`,
    }))



    const editProjectForm = useForm<ProjectFormValues>({
        defaultValues: {
            name: '',
            description: '',
            deadline: '',
        },
    })
    useEffect(() => {
        if (!project) return

        editProjectForm.reset({
            name: project.name,
            description: project.description ?? "",
            deadline: project.deadline
                ? new Date(project.deadline).toISOString().slice(0, 16)
                : "",
            managerId: project.managerId ?? "",
        })
    }, [project, editProjectForm])
    const updateProjectMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: ProjectFormValues
        }) => updateProjectService(id, data),

        onSuccess: () => {
            toast.success('Project updated successfully')

            setOpen(false)
            setProject(null)
            editProjectForm.reset()

            querryClient.invalidateQueries({
                queryKey: ['projects'],
            })
        },

        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update project')
        },
    })

    const handleUpdateProject = (values: ProjectFormValues) => {
        if (!project) return

        alert(JSON.stringify(values))
        

        const payload = {
        ...values,
        deadline: values.deadline
            ? new Date(values.deadline).toISOString()
            : undefined,
    };

    updateProjectMutation.mutate({
        id: project.id,
        data: payload,
    });
    }

    return (
        <div>
            <DialogForm
                open={open}
                onClose={() => {
                    setOpen(false)
                    setProject(null)
                    editProjectForm.reset()
                }}
                title="Edit Project"
                subtitle={project ? `Update ${project.name}` : 'Update project'}
                maxWidth="md"
            >
                <form
                    onSubmit={editProjectForm.handleSubmit(handleUpdateProject)}
                    className="space-y-4"
                >
                    <FormField label="Project name" required error={editProjectForm.formState.errors.name?.message}>
                        <FormInput
                            {...editProjectForm.register('name', { required: 'Project name is required' })}
                            placeholder="e.g. AI Learning Platform"
                        />
                    </FormField>

                    <FormField label="Description">
                        <FormTextarea
                            {...editProjectForm.register('description')}
                            placeholder="Describe the goal of this project"
                        />
                    </FormField>


                    <FormField label="Deadline" required error={editProjectForm.formState.errors.deadline?.message}>
                        <FormInput
                            type="datetime-local"
                            {...editProjectForm.register('deadline', { required: 'Deadline is required' })}
                        />
                    </FormField>


                    <FormField label="Manager" required={false} error={editProjectForm.formState.errors.managerId?.message}>
                        <FormSelect
                            {...editProjectForm.register('managerId')}
                            placeholder="Select manager"
                            options={employeeOptions.map((o) => ({ value: o.value, label: o.label }))}
                        />

                    </FormField>




                    <FormActions
                        onCancel={() => {
                            setOpen(false)
                            setProject(null)
                            editProjectForm.reset()
                        }}
                        submitLabel="Update Project"
                        isSubmitting={updateProjectMutation.isPending}
                    />
                </form>
            </DialogForm>
        </div>
    )
}

export default EditProjectForm