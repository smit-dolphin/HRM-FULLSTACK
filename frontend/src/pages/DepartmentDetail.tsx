import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, ArrowUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { DialogForm, FormField, FormInput, FormActions } from '@/components/forms/DialogForm'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fetchDesignationsService,
  createDesignationService,
  updateDesignationService,
  deleteDesignationService,
  type Designation,
} from '@/services/designationService/designationService'
import { createDesignationSchema, updateDesignationSchema, type CreateDesignationFormData, type UpdateDesignationFormData } from '@/schemas/designation.schema'

type DesignationRow = {
  id: string
  name: string
}

const columnHelper = createColumnHelper<DesignationRow>()

export function DepartmentDetail() {
  const { id: departmentId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()

  const [deptName, setDeptName] = React.useState('')
  const [data, setData] = React.useState<DesignationRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingDesig, setEditingDesig] = React.useState<DesignationRow | null>(null)

  const createForm = useForm<CreateDesignationFormData>({
    resolver: zodResolver(createDesignationSchema),
    defaultValues: { departmentId: departmentId || '' },
  })
  const editForm = useForm<UpdateDesignationFormData>({ resolver: zodResolver(updateDesignationSchema) })

  const loadDesignations = async () => {
    if (!departmentId) return
    try {
      setLoading(true)
      const response = await fetchDesignationsService()
      const filtered = response.data.filter((d: Designation) => d.departmentId === departmentId)
      if (filtered.length > 0 && filtered[0].department) {
        setDeptName(filtered[0].department.name)
      }
      setData(filtered.map((d: Designation) => ({ id: d.id, name: d.name })))
    } catch (error) {
      toast.error('Failed to fetch designations')
    } finally {
      setLoading(false)
    }
  }

  // Load dept name even if no designations
  const loadDeptName = async () => {
    if (!departmentId) return
    try {
      const { default: baseApi } = await import('@/api/baseApi')
      const res = await baseApi.get(`/department/${departmentId}`)
      if (res.data.success) setDeptName(res.data.data.name)
    } catch { /* ignore */ }
  }

  React.useEffect(() => {
    loadDesignations()
    loadDeptName()
  }, [departmentId])

  const handleOpenEdit = (row: DesignationRow) => {
    setEditingDesig(row)
    editForm.reset({ name: row.name })
    setEditOpen(true)
  }

  const onCreateDesignation = async (formData: CreateDesignationFormData) => {
    try {
      const res = await createDesignationService({ ...formData, departmentId: departmentId! })
      if (res.success) {
        toast.success(res.message)
        setAddOpen(false)
        createForm.reset({ departmentId: departmentId || '' })
        loadDesignations()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create designation')
    }
  }

  const onUpdateDesignation = async (formData: UpdateDesignationFormData) => {
    if (!editingDesig) return
    try {
      const res = await updateDesignationService(editingDesig.id, formData)
      if (res.success) {
        toast.success(res.message)
        setEditOpen(false)
        editForm.reset()
        setEditingDesig(null)
        loadDesignations()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update designation')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteDesignationService(id)
      if (res.success) {
        toast.success(res.message)
        loadDesignations()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete designation')
    }
  }

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4 h-8">
          Designation <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const row = info.row.original
        const items: ActionMenuItem[] = []
        if (hasPermission('designation:edit')) items.push({ label: 'Edit', onClick: () => handleOpenEdit(row) })
        if (hasPermission('designation:delete')) items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
        if (!items.length) return null
        return <ActionMenu items={items} />
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/departments')} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader title={deptName || 'Department'} subtitle="Manage designations in this department." />
        </div>
        {hasPermission('designation:create') && (
          <Button onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add Designation
          </Button>
        )}
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search designations..."
        emptyMessage="No designations in this department."
      />

      {/* Add Designation */}
      <DialogForm open={addOpen} onClose={() => { setAddOpen(false); createForm.reset({ departmentId: departmentId || '' }) }} title="Add Designation" subtitle={`Add to ${deptName}`}>
        <form onSubmit={createForm.handleSubmit(onCreateDesignation)}>
          <div className="space-y-4">
            <FormField label="Designation name" required error={createForm.formState.errors.name?.message}>
              <FormInput {...createForm.register('name')} error={!!createForm.formState.errors.name} placeholder="e.g. Fullstack Developer" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset({ departmentId: departmentId || '' }) }} submitLabel="Create" isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>

      {/* Edit Designation */}
      <DialogForm open={editOpen} onClose={() => { setEditOpen(false); editForm.reset(); setEditingDesig(null) }} title="Edit Designation" subtitle={`Editing ${editingDesig?.name ?? ''}`}>
        <form onSubmit={editForm.handleSubmit(onUpdateDesignation)}>
          <div className="space-y-4">
            <FormField label="Designation name" error={editForm.formState.errors.name?.message}>
              <FormInput {...editForm.register('name')} error={!!editForm.formState.errors.name} placeholder="e.g. Fullstack Developer" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setEditOpen(false); editForm.reset(); setEditingDesig(null) }} submitLabel="Update" isSubmitting={editForm.formState.isSubmitting} />
        </form>
      </DialogForm>
    </div>
  )
}
