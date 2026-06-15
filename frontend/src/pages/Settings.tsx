import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { DialogForm, FormField, FormInput, FormActions } from '@/components/forms/DialogForm'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fetchLeaveTypesService,
  createLeaveTypeService,
  updateLeaveTypeService,
  deleteLeaveTypeService,
  bulkAllocateService,
  type LeaveType,
} from '@/services/leaveService/leaveService'
import { createLeaveTypeSchema, updateLeaveTypeSchema, type CreateLeaveTypeFormData, type UpdateLeaveTypeFormData } from '@/schemas/leaveType.schema'

type LeaveTypeRow = {
  id: string
  name: string
  description: string
  defaultDays: number
  isPaid: boolean
  requiresApproval: boolean
}

const columnHelper = createColumnHelper<LeaveTypeRow>()

export function Settings() {
  const { hasPermission } = useAuthStore()
  const canManageType = hasPermission('leave:type:manage')
  const canAllocate = hasPermission('leave:balance:edit')

  const [leaveTypes, setLeaveTypes] = React.useState<LeaveTypeRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingType, setEditingType] = React.useState<LeaveTypeRow | null>(null)
  const [allocating, setAllocating] = React.useState(false)

  const createForm = useForm<CreateLeaveTypeFormData>({ resolver: zodResolver(createLeaveTypeSchema), defaultValues: { isPaid: true, requiresApproval: true } })
  const editForm = useForm<UpdateLeaveTypeFormData>({ resolver: zodResolver(updateLeaveTypeSchema) })

  const loadLeaveTypes = async () => {
    try {
      setLoading(true)
      const res = await fetchLeaveTypesService()
      if (res.success) {
        setLeaveTypes(res.data.map((t: LeaveType) => ({
          id: t.id,
          name: t.name,
          description: t.description ?? '',
          defaultDays: t.defaultDays,
          isPaid: t.isPaid,
          requiresApproval: t.requiresApproval,
        })))
      }
    } catch { toast.error('Failed to load leave types') }
    finally { setLoading(false) }
  }

  React.useEffect(() => { loadLeaveTypes() }, [])

  const handleOpenEdit = (row: LeaveTypeRow) => {
    setEditingType(row)
    editForm.reset({ name: row.name, description: row.description, defaultDays: row.defaultDays, isPaid: row.isPaid, requiresApproval: row.requiresApproval })
    setEditOpen(true)
  }

  const onCreateType = async (formData: CreateLeaveTypeFormData) => {
    try {
      const res = await createLeaveTypeService(formData)
      if (res.success) { toast.success(res.message); setAddOpen(false); createForm.reset({ isPaid: true, requiresApproval: true }); loadLeaveTypes() }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to create') }
  }

  const onUpdateType = async (formData: UpdateLeaveTypeFormData) => {
    if (!editingType) return
    try {
      const res = await updateLeaveTypeService(editingType.id, formData)
      if (res.success) { toast.success(res.message); setEditOpen(false); editForm.reset(); setEditingType(null); loadLeaveTypes() }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to update') }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteLeaveTypeService(id)
      if (res.success) { toast.success(res.message); loadLeaveTypes() }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to delete') }
  }

  const handleBulkAllocate = async () => {
    setAllocating(true)
    try {
      const res = await bulkAllocateService(new Date().getFullYear())
      if (res.success) { toast.success(`Allocated: ${res.data.created} created, ${res.data.skipped} skipped`) }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to allocate') }
    finally { setAllocating(false) }
  }

  const columns = [
    columnHelper.accessor('name', { header: 'Name', cell: (info) => info.getValue() }),
    columnHelper.accessor('description', { header: 'Description', cell: (info) => info.getValue() || '—' }),
    columnHelper.accessor('defaultDays', { header: 'Default Days', cell: (info) => info.getValue() }),
    columnHelper.accessor('isPaid', {
      header: 'Paid',
      cell: (info) => <StatusBadge label={info.getValue() ? 'Yes' : 'No'} variant={info.getValue() ? 'success' : 'default'} />,
    }),
    columnHelper.accessor('requiresApproval', {
      header: 'Approval',
      cell: (info) => <StatusBadge label={info.getValue() ? 'Required' : 'Auto'} variant={info.getValue() ? 'warning' : 'info'} />,
    }),
    ...(canManageType ? [columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original
        const items: ActionMenuItem[] = [
          { label: 'Edit', onClick: () => handleOpenEdit(row) },
          { label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' },
        ]
        return <ActionMenu items={items} />
      },
    })] : []),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage system configuration." />

      {/* Bulk Allocate */}
      {canAllocate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Balance Allocation</CardTitle>
            <CardDescription>Allocate yearly leave balances for all active employees based on leave type defaults.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBulkAllocate} disabled={allocating}>
              <RefreshCw className={`mr-2 h-4 w-4 ${allocating ? 'animate-spin' : ''}`} />
              {allocating ? 'Allocating...' : `Allocate for ${new Date().getFullYear()}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Leave Types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Leave Types</CardTitle>
            <CardDescription>Configure available leave types for your organization.</CardDescription>
          </div>
          {canManageType && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Type
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <DataTable
            data={leaveTypes}
            columns={columns}
            loading={loading}
            searchable={false}
            emptyMessage="No leave types configured."
          />
        </CardContent>
      </Card>

      {/* Add Leave Type */}
      <DialogForm open={addOpen} onClose={() => { setAddOpen(false); createForm.reset({ isPaid: true, requiresApproval: true }) }} title="Add Leave Type" subtitle="Create a new leave type">
        <form onSubmit={createForm.handleSubmit(onCreateType)}>
          <div className="space-y-4">
            <FormField label="Name" required error={createForm.formState.errors.name?.message}>
              <FormInput {...createForm.register('name')} error={!!createForm.formState.errors.name} placeholder="e.g. Sick Leave" />
            </FormField>
            <FormField label="Description" error={createForm.formState.errors.description?.message}>
              <FormInput {...createForm.register('description')} placeholder="Optional description" />
            </FormField>
            <FormField label="Default Days" required error={createForm.formState.errors.defaultDays?.message}>
              <FormInput {...createForm.register('defaultDays')} error={!!createForm.formState.errors.defaultDays} type="number" placeholder="10" />
            </FormField>
            <div className="flex gap-6">
              <FormField label="Paid Leave">
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...createForm.register('isPaid')} />
                  <span className="text-sm text-muted-foreground">This is a paid leave</span>
                </div>
              </FormField>
              <FormField label="Requires Approval">
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...createForm.register('requiresApproval')} />
                  <span className="text-sm text-muted-foreground">Needs manager approval</span>
                </div>
              </FormField>
            </div>
          </div>
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset({ isPaid: true, requiresApproval: true }) }} submitLabel="Create" isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>

      {/* Edit Leave Type */}
      <DialogForm open={editOpen} onClose={() => { setEditOpen(false); editForm.reset(); setEditingType(null) }} title="Edit Leave Type" subtitle={`Editing ${editingType?.name ?? ''}`}>
        <form onSubmit={editForm.handleSubmit(onUpdateType)}>
          <div className="space-y-4">
            <FormField label="Name" error={editForm.formState.errors.name?.message}>
              <FormInput {...editForm.register('name')} error={!!editForm.formState.errors.name} placeholder="e.g. Sick Leave" />
            </FormField>
            <FormField label="Description" error={editForm.formState.errors.description?.message}>
              <FormInput {...editForm.register('description')} placeholder="Optional description" />
            </FormField>
            <FormField label="Default Days" error={editForm.formState.errors.defaultDays?.message}>
              <FormInput {...editForm.register('defaultDays')} error={!!editForm.formState.errors.defaultDays} type="number" />
            </FormField>
            <div className="flex gap-6">
              <FormField label="Paid Leave">
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...editForm.register('isPaid')} />
                  <span className="text-sm text-muted-foreground">This is a paid leave</span>
                </div>
              </FormField>
              <FormField label="Requires Approval">
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...editForm.register('requiresApproval')} />
                  <span className="text-sm text-muted-foreground">Needs manager approval</span>
                </div>
              </FormField>
            </div>
          </div>
          <FormActions onCancel={() => { setEditOpen(false); editForm.reset(); setEditingType(null) }} submitLabel="Update" isSubmitting={editForm.formState.isSubmitting} />
        </form>
      </DialogForm>
    </div>
  )
}
