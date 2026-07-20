import React from 'react'
import { DialogForm, FormActions, FormField, FormInput, FormSelect, FormTextarea } from '@/components/forms/DialogForm'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createProjectService } from '@/services/projectService/projectService'
import { querryClient } from '@/querryOptions/querryClinets'
import { fetchEmployeesService } from '@/services/employeeService/employeeService'


type ProjectFormValues = {
    name: string
    description: string
    deadline?: string
    managerId?: string
}

type createProjectForm = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const CreateProjectForm = ({
    open,
    setOpen

}: createProjectForm) => {


    const employeesQuery = useQuery({
        queryKey: ['employee-options'],
        queryFn: () => fetchEmployeesService({ page: 1, limit: 200 }),
    })
    const employees = employeesQuery.data?.data ?? []

    const employeeOptions = employees.map((employee) => ({
        value: employee.id,
        label: `${employee.user?.firstName ?? ''} ${employee.user?.lastName ?? ''} (${employee.user?.email ?? ''})`,
    }))

    const projectForm = useForm<ProjectFormValues>({
        defaultValues: { name: '', description: '', deadline: '', managerId: '' },
    })

    const createProjectMutation = useMutation({
        mutationFn: createProjectService,
        onSuccess: () => {
            toast.success('Project created successfully')
            setOpen(false)
            projectForm.reset()
            querryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: (error: Error) => {

            toast.error(error.message || 'Failed to create project')
        },
    })

    const handleCreateProject = (values: ProjectFormValues) => {
        const payload: any = {
            name: values.name,
            description: values.description,
        }

        // Backend expects `deadline` as a Zod datetime() string (ISO 8601).
        // datetime-local gives `YYYY-MM-DDTHH:mm` (no timezone), so convert to ISO.
        if (values.deadline) {
            const d = new Date(values.deadline)
            payload.deadline = Number.isNaN(d.getTime()) ? undefined : d.toISOString()
        }

        if ((values as any).managerId) {
            payload.managerId = (values as any).managerId
        }
        alert(JSON.stringify(payload))

        createProjectMutation.mutate(payload)
    }
    return (
        <div>
            <DialogForm
                open={open}
                onClose={() => {
                    setOpen(false)
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

                    <FormField label="Deadline" required error={projectForm.formState.errors.deadline?.message}>
                        <FormInput
                            type="datetime-local"
                            {...projectForm.register('deadline', { required: 'Deadline is required' })}
                        />
                    </FormField>

                    {/* Backend expects managerId, but UX should be select by employee */}
                    <FormField label="Manager" required={false} error={projectForm.formState.errors.managerId?.message}>
                        <FormSelect
                            {...projectForm.register('managerId')}
                            placeholder="Select manager"
                            options={employeeOptions.map((o) => ({ value: o.value, label: o.label }))}
                        />

                    </FormField>

                    <FormActions
                        onCancel={() => {
                            setOpen(false)
                            projectForm.reset()
                        }}
                        submitLabel="Create Project"
                        isSubmitting={createProjectMutation.isPending}
                    />
                </form>
            </DialogForm>
        </div>
    )
}

export default CreateProjectForm