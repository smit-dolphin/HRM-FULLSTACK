import React from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, ArrowUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { DialogForm, FormField, FormInput, FormActions } from '@/components/forms/DialogForm'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fetchDepartmentsService,
  createDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
  type Department,
} from '@/services/departmentService/departmentService'
import { createDepartmentSchema, updateDepartmentSchema, type CreateDepartmentFormData, type UpdateDepartmentFormData } from '@/schemas/department.schema'

type DepartmentRow = {
  id: string
  name: string
  designationCount: number
}

const columnHelper = createColumnHelper<DepartmentRow>()

export function Departments() {
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()
  const [data, setData] = React.useState<DepartmentRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingDept, setEditingDept] = React.useState<DepartmentRow | null>(null)

  const createForm = useForm<CreateDepartmentFormData>({ resolver: zodResolver(createDepartmentSchema) })
  const editForm = useForm<UpdateDepartmentFormData>({ resolver: zodResolver(updateDepartmentSchema) })

  const loadDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetchDepartmentsService()
      setData(response.data.map((dept: Department) => ({
        id: dept.id,
        name: dept.name,
        designationCount: dept.designations?.length ?? 0,
      })))
    } catch (error) {
      toast.error('Failed to fetch departments')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadDepartments() }, [])

  const handleOpenEdit = (row: DepartmentRow) => {
    setEditingDept(row)
    editForm.reset({ name: row.name })
    setEditOpen(true)
  }

  const onCreateDepartment = async (formData: CreateDepartmentFormData) => {
    try {
      const res = await createDepartmentService(formData)
      if (res.success) {
        toast.success(res.message)
        setAddOpen(false)
        createForm.reset()
        loadDepartments()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create department')
    }
  }

  const onUpdateDepartment = async (formData: UpdateDepartmentFormData) => {
    if (!editingDept) return
    try {
      const res = await updateDepartmentService(editingDept.id, formData)
      if (res.success) {
        toast.success(res.message)
        setEditOpen(false)
        editForm.reset()
        setEditingDept(null)
        loadDepartments()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update department')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteDepartmentService(id)
      if (res.success) {
        toast.success(res.message)
        loadDepartments()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete department')
    }
  }

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4 h-8">
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('designationCount', {
      header: 'Designations',
      cell: (info) => (
        <button
          onClick={() => navigate(`/departments/${info.row.original.id}`)}
          className="text-primary underline-offset-4 hover:underline"
        >
          {info.getValue()} designations
        </button>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const row = info.row.original
        const items: ActionMenuItem[] = [
          { label: 'View Designations', onClick: () => navigate(`/departments/${row.id}`) },
        ]
        if (hasPermission('department:edit')) items.push({ label: 'Edit', onClick: () => handleOpenEdit(row) })
        if (hasPermission('department:delete')) items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
        return <ActionMenu items={items} />
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" subtitle="Manage organizational departments.">
        {hasPermission('department:create') && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        )}
      </PageHeader>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search departments..."
        emptyMessage="No departments found."
      />

      {/* Add Department */}
      <DialogForm open={addOpen} onClose={() => { setAddOpen(false); createForm.reset() }} title="Add Department" subtitle="Create a new department">
        <form onSubmit={createForm.handleSubmit(onCreateDepartment)}>
          <div className="space-y-4">
            <FormField label="Department name" required error={createForm.formState.errors.name?.message}>
              <FormInput {...createForm.register('name')} error={!!createForm.formState.errors.name} placeholder="e.g. Engineering" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset() }} submitLabel="Create" isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>

      {/* Edit Department */}
      <DialogForm open={editOpen} onClose={() => { setEditOpen(false); editForm.reset(); setEditingDept(null) }} title="Edit Department" subtitle={`Editing ${editingDept?.name ?? ''}`}>
        <form onSubmit={editForm.handleSubmit(onUpdateDepartment)}>
          <div className="space-y-4">
            <FormField label="Department name" error={editForm.formState.errors.name?.message}>
              <FormInput {...editForm.register('name')} error={!!editForm.formState.errors.name} placeholder="e.g. Engineering" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setEditOpen(false); editForm.reset(); setEditingDept(null) }} submitLabel="Update" isSubmitting={editForm.formState.isSubmitting} />
        </form>
      </DialogForm>
    </div>
  )
}
