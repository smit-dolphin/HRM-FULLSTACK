import React, { useEffect } from 'react'

import { DialogForm, FormActions, FormField, FormInput, FormSelect, FormTextarea } from '@/components/forms/DialogForm'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addProjectMemberService, type Project } from '@/services/projectService/projectService'
import { querryClient } from '@/querryOptions/querryClinets'
import { fetchEmployeesService } from '@/services/employeeService/employeeService'

type MemberFormValues = {
    employeeId: string
}
type projectType = Project | null;

interface assignEmployeeForm {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    project: projectType,
    setProject: React.Dispatch<React.SetStateAction<projectType>>
}



const AssignEmployeeForm = ({
    open,
    setOpen,
    project,
    setProject

}: assignEmployeeForm) => {

    

    const memberForm = useForm<MemberFormValues>({
        defaultValues: { employeeId: '' },
    })
    useEffect(()=>{
        memberForm.setValue('employeeId', '')
    },[project])

    const assignMemberMutation = useMutation({

        mutationFn: ({ projectId, employeeId }: { projectId: string; employeeId: string }) =>
            addProjectMemberService(projectId, { employeeId }),
        onSuccess: () => {
            toast.success('Employee assigned to project')
            setOpen(false)
            memberForm.reset()
            querryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to assign employee')
        },
    })

    const handleAssignMember = (values: MemberFormValues) => {
        if (!project) return
        assignMemberMutation.mutate({ projectId: project.id, employeeId: values.employeeId })
    }

    const employeesQuery = useQuery({
        queryKey: ['employee-options'],
        queryFn: () => fetchEmployeesService({ page: 1, limit: 200 }),
    })
    const employees = employeesQuery.data?.data ?? []

    const employeeOptions = employees.map((employee) => ({
        value: employee.id,
        label: `${employee.user?.firstName ?? ''} ${employee.user?.lastName ?? ''} (${employee.user?.email ?? ''})`,
    }))


    // Filter employees who are not already project members for the Assign Member form
    const assignMemberOptions = React.useMemo(() => {
        if (!project || !project.members) return employeeOptions
        const assignedIds = new Set(project.members.map((m: any) => m.employeeId))
        return employeeOptions.filter(opt => !assignedIds.has(opt.value))
    }, [project, employeeOptions])

    return (
        <div>
            <DialogForm
                open={open}
                onClose={() => {
                    setOpen(false)
                    memberForm.reset()
                    setProject(null)
                }}
                title="Assign Employee"
                subtitle={project ? `Add someone to ${project.name}` : 'Assign an employee to a project'}
                maxWidth="md"
            >
                <form onSubmit={memberForm.handleSubmit(handleAssignMember)} className="space-y-4">
                    <FormField label="Employee" required error={memberForm.formState.errors.employeeId?.message}>
                        <FormSelect
                            {...memberForm.register('employeeId', { required: 'Please select an employee' })}
                            options={assignMemberOptions}
                            placeholder={assignMemberOptions.length === 0 ? "All employees assigned" : "Select employee"}
                            disabled={assignMemberOptions.length === 0}
                        />
                    </FormField>

                    <FormActions
                        onCancel={() => {
                            setOpen(false)
                            memberForm.reset()
                            setProject(null)
                        }}
                        submitLabel="Assign"
                        isSubmitting={assignMemberMutation.isPending}
                    />
                </form>
            </DialogForm>

        </div>
    )
}

export default AssignEmployeeForm