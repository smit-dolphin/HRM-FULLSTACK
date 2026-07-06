import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { DialogForm, FormField, FormInput, FormSelect, FormActions } from '@/components/forms/DialogForm'
import { useAuthStore } from '@/store/useAuthStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  fetchAllLeavesService,
  fetchMyLeavesService,
  fetchLeaveTypesService,
  fetchMyBalanceService,
  createLeaveService,
  updateLeaveStatusService,
  deleteLeaveService,
  cancelLeaveService,
  type Leave,
  type LeaveBalance,
} from '@/services/leaveService/leaveService'
import { createLeaveSchema, type CreateLeaveFormData } from '@/schemas/leave.schema'
import type { AxiosError } from 'axios'
import type { apiErrorDataShape } from '@/types/sharedTypes'

type LeaveRow = {
  id: string
  employeeName: string
  leaveTypeName: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
}

const columnHelper = createColumnHelper<LeaveRow>()

export function LeaveDashboard() {
  const { hasPermission, user } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'
  const canApprove = hasPermission('leave:request:approve')
  const canCreate = hasPermission('leave:request:create')
  const canDelete = hasPermission('leave:request:delete')

  const [data, setData] = React.useState<LeaveRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [viewAll, setViewAll] = React.useState(isSuperAdmin)
  const [addOpen, setAddOpen] = React.useState(false)
  const [leaveTypeOptions, setLeaveTypeOptions] = React.useState<{ value: string; label: string }[]>([])

  // Balance
  const [myBalance, setMyBalance] = React.useState<LeaveBalance[]>([])
  const [balanceLoading, setBalanceLoading] = React.useState(true)

  const createForm = useForm<CreateLeaveFormData>({ resolver: zodResolver(createLeaveSchema) })

  const loadMyBalance = async () => {
    try {
      setBalanceLoading(true)
      const res = await fetchMyBalanceService()
      if (res.success) setMyBalance(res.data)
    } catch { /* not an employee */ }
    finally { setBalanceLoading(false) }
  }

  const loadLeaves = async () => {
    try {
      setLoading(true)
      const response = (viewAll || isSuperAdmin) && canApprove ? await fetchAllLeavesService() : await fetchMyLeavesService()
      setData(response.data.map((leave: Leave) => ({
        id: leave.id,
        employeeName: leave.employee?.user?.name ?? 'You',
        leaveTypeName: leave.leaveType?.name ?? 'Unknown',
        startDate: leave.startDate,
        endDate: leave.endDate,
        totalDays: leave.totalDays,
        reason: leave.reason,
        status: leave.status,
      })))
    } catch {
      toast.error('Failed to fetch leaves')
    } finally {
      setLoading(false)
    }
  }

  const loadLeaveTypes = async () => {
    try {
      const res = await fetchLeaveTypesService()
      if (res.success) setLeaveTypeOptions(res.data.map(t => ({ value: t.id, label: t.name })))
    } catch { toast.error('Failed to load leave types') }
  }

  React.useEffect(() => { loadLeaves() }, [viewAll])
  
  React.useEffect(() => {
    if (!isSuperAdmin) {
      loadMyBalance()
    } else {
      setBalanceLoading(false)
      setViewAll(true)
    }
  }, [isSuperAdmin])

  const handleOpenAdd = () => { loadLeaveTypes(); setAddOpen(true) }

  const onCreateLeave = async (formData: CreateLeaveFormData) => {
    try {
      const res = await createLeaveService(formData)
      if (res.success) { toast.success(res.message); setAddOpen(false); createForm.reset(); loadLeaves(); loadMyBalance() }
    } catch (error: unknown){
          const err = error as AxiosError<apiErrorDataShape>
           toast.error(err.response?.data?.message || 'Failed to create leave') }
  }

  const handleApprove = async (id: string) => {
    try { const res = await updateLeaveStatusService(id, 'approved'); if (res.success) { toast.success(res.message); loadLeaves() } }
     catch (error: unknown){
          const err = error as AxiosError<apiErrorDataShape>
           toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleReject = async (id: string) => {
    try { const res = await updateLeaveStatusService(id, 'rejected'); if (res.success) { toast.success(res.message); loadLeaves() } }
     catch (error: unknown){
          const err = error as AxiosError<apiErrorDataShape>
           toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id: string) => {
    try { const res = await deleteLeaveService(id); if (res.success) { toast.success(res.message); loadLeaves(); loadMyBalance() } }
    catch (error: unknown){
         const err = error as AxiosError<apiErrorDataShape>
         toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleCancel = async (id: string) => {
    try { const res = await cancelLeaveService(id); if (res.success) { toast.success(res.message); loadLeaves(); loadMyBalance() } }
   catch (error: unknown){
         const err = error as AxiosError<apiErrorDataShape>
          toast.error(err.response?.data?.message || 'Failed to cancel') }
  }

  const columns = [
    ...(viewAll ? [columnHelper.accessor('employeeName', { header: 'Employee', cell: (info) => info.getValue() })] : []),
    columnHelper.accessor('leaveTypeName', { header: 'Type', cell: (info) => info.getValue() }),
    columnHelper.accessor('startDate', { header: 'From', cell: (info) => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('endDate', { header: 'To', cell: (info) => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('totalDays', { header: 'Days', cell: (info) => info.getValue() }),
    columnHelper.accessor('reason', { header: 'Reason', cell: (info) => info.getValue() }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const s = info.getValue()
        return <StatusBadge label={s} variant={s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : s === 'cancelled' ? 'default' : 'warning'} />
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const row = info.row.original
        const items: ActionMenuItem[] = []
        if (row.status === 'pending' && canApprove && viewAll) {
          items.push({ label: 'Approve', onClick: () => handleApprove(row.id) })
          items.push({ label: 'Reject', onClick: () => handleReject(row.id) })
        }
        if ((row.status === 'pending' || row.status === 'approved') && !viewAll) {
          items.push({ label: 'Cancel', onClick: () => handleCancel(row.id) })
        }
        if (row.status === 'pending' && canDelete) items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
        if (!items.length) return null
        return <ActionMenu items={items} />
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Management" subtitle="Request, view and manage leaves.">
        {canApprove && !isSuperAdmin && (
          <Button variant="outline" onClick={() => setViewAll(prev => !prev)}>
            {viewAll ? 'My Leaves' : 'All Leaves'}
          </Button>
        )}
        {canCreate && !isSuperAdmin && (
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Request Leave
          </Button>
        )}
      </PageHeader>

      {/* My Balance Cards */}
      {!balanceLoading && !isSuperAdmin && myBalance.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {myBalance.map(b => (
            <Card key={b.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{b.leaveType?.name ?? 'Unknown'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{b.allocated - b.used - b.pending} <span className="text-sm font-normal text-muted-foreground">remaining</span></div>
                <p className="text-xs text-muted-foreground mt-1">{b.allocated} allocated · {b.used} used · {b.pending} pending</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leave Requests Table */}
      <DataTable data={data} columns={columns} loading={loading} searchPlaceholder="Search leaves..." emptyMessage="No leave requests found." />

      {/* Create Leave Dialog */}
      <DialogForm open={addOpen} onClose={() => { setAddOpen(false); createForm.reset() }} title="Request Leave" subtitle="Submit a new leave request">
        <form onSubmit={createForm.handleSubmit(onCreateLeave)}>
          <div className="space-y-4">
            <FormField label="Leave Type" required error={createForm.formState.errors.leaveTypeId?.message}>
              <FormSelect {...createForm.register('leaveTypeId')} error={!!createForm.formState.errors.leaveTypeId} options={leaveTypeOptions} placeholder="Select type" />
            </FormField>
            <FormField label="Start Date" required error={createForm.formState.errors.startDate?.message}>
              <FormInput {...createForm.register('startDate')} error={!!createForm.formState.errors.startDate} type="date" />
            </FormField>
            <FormField label="End Date" required error={createForm.formState.errors.endDate?.message}>
              <FormInput {...createForm.register('endDate')} error={!!createForm.formState.errors.endDate} type="date" />
            </FormField>
            <FormField label="Reason" required error={createForm.formState.errors.reason?.message}>
              <FormInput {...createForm.register('reason')} error={!!createForm.formState.errors.reason} placeholder="Why do you need leave?" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset() }} submitLabel="Submit" isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>
    </div>
  )
}
