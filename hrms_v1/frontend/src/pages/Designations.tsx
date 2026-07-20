import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, ArrowUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { DialogForm, FormField, FormInput, FormSelect, FormActions } from '@/components/forms/DialogForm'
import {
  fetchDesignationsService,
  createDesignationService,
  updateDesignationService,
  deleteDesignationService,
  type Designation,
} from '@/services/designationService/designationService'
import { fetchDepartmentsService, type Department } from '@/services/departmentService/departmentService'
import { createDesignationSchema, updateDesignationSchema, type CreateDesignationFormData, type UpdateDesignationFormData } from '@/schemas/designation.schema'
import type { AxiosError } from 'axios'
import type { apiErrorDataShape } from '@/types/sharedTypes'

type DesignationRow = {
  id: string
  name: string
  departmentId: string
  departmentName: string
}

const columnHelper = createColumnHelper<DesignationRow>()

export function Designations() {
  const [data, setData] = React.useState<DesignationRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingDesig, setEditingDesig] = React.useState<DesignationRow | null>(null)
  const [departments, setDepartments] = React.useState<{ value: string; label: string }[]>([])

  const createForm = useForm<CreateDesignationFormData>({ resolver: zodResolver(createDesignationSchema) })
  const editForm = useForm<UpdateDesignationFormData>({ resolver: zodResolver(updateDesignationSchema) })

  const loadDesignations = async () => {
    try {
      setLoading(true)
      const response = await fetchDesignationsService()
      setData(response.data.map((d: Designation) => ({
        id: d.id,
        name: d.name,
        departmentId: d.departmentId,
        departmentName: d.department?.name ?? d.departmentId,
      })))
    } catch (error) {
      toast.error('Failed to fetch designations')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const res = await fetchDepartmentsService()
      setDepartments(res.data.map((d: Department) => ({ value: d.id, label: d.name })))
    } catch (error) {
      toast.error('Failed to load departments')
    }
  }

  React.useEffect(() => { loadDesignations() }, [])

  const handleOpenAdd = () => {
    loadDepartments()
    setAddOpen(true)
  }

  const handleOpenEdit = (row: DesignationRow) => {
    loadDepartments()
    setEditingDesig(row)
    editForm.reset({ name: row.name, departmentId: row.departmentId })
    setEditOpen(true)
  }

  const onCreateDesignation = async (formData: CreateDesignationFormData) => {
    try {
      const res = await createDesignationService(formData)
      if (res.success) {
        toast.success(res.message)
        setAddOpen(false)
        createForm.reset()
        loadDesignations()
      }
    } catch (error: unknown){
          const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to create designation')
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
    } catch (error: unknown){
          const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to update designation')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteDesignationService(id)
      if (res.success) {
        toast.success(res.message)
        loadDesignations()
      }
    } catch (error: unknown){
          const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to delete designation')
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
    columnHelper.accessor('departmentName', {
      header: 'Department',
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const row = info.row.original
        return (
          <ActionMenu items={[
            { label: 'Edit', onClick: () => handleOpenEdit(row) },
            { label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' },
          ]} />
        )
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Designations" subtitle="Manage job designations across departments.">
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Designation
        </Button>
      </PageHeader>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search designations..."
        emptyMessage="No designations found."
      />

      {/* Add Designation */}
      <DialogForm open={addOpen} onClose={() => { setAddOpen(false); createForm.reset() }} title="Add Designation" subtitle="Create a new designation">
        <form onSubmit={createForm.handleSubmit(onCreateDesignation)}>
          <div className="space-y-4">
            <FormField label="Designation name" required error={createForm.formState.errors.name?.message}>
              <FormInput {...createForm.register('name')} error={!!createForm.formState.errors.name} placeholder="e.g. Fullstack Developer" />
            </FormField>
            <FormField label="Department" required error={createForm.formState.errors.departmentId?.message}>
              <FormSelect {...createForm.register('departmentId')} error={!!createForm.formState.errors.departmentId} options={departments} placeholder="Select department" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset() }} submitLabel="Create" isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>

      {/* Edit Designation */}
      <DialogForm open={editOpen} onClose={() => { setEditOpen(false); editForm.reset(); setEditingDesig(null) }} title="Edit Designation" subtitle={`Editing ${editingDesig?.name ?? ''}`}>
        <form onSubmit={editForm.handleSubmit(onUpdateDesignation)}>
          <div className="space-y-4">
            <FormField label="Designation name" error={editForm.formState.errors.name?.message}>
              <FormInput {...editForm.register('name')} error={!!editForm.formState.errors.name} placeholder="e.g. Fullstack Developer" />
            </FormField>
            <FormField label="Department" error={editForm.formState.errors.departmentId?.message}>
              <FormSelect {...editForm.register('departmentId')} error={!!editForm.formState.errors.departmentId} options={departments} placeholder="Select department" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setEditOpen(false); editForm.reset(); setEditingDesig(null) }} submitLabel="Update" isSubmitting={editForm.formState.isSubmitting} />
        </form>
      </DialogForm>
    </div>
  )
}
