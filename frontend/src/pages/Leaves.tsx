import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { DialogForm, FormField, FormInput, FormSelect, FormActions } from '@/components/forms/DialogForm'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fetchAllLeavesService,
  fetchMyLeavesService,
  fetchLeaveTypesService,
  fetchMyBalanceService,
  fetchBalanceByEmployeeService,
  createLeaveService,
  updateLeaveStatusService,
  deleteLeaveService,
  type Leave,
  type LeaveBalance,
} from '@/services/leaveService/leaveService'
import { fetchEmployeesService, type Employee } from '@/services/employeeService/employeeService'
import { createLeaveSchema, type CreateLeaveFormData } from '@/schemas/leave.schema'
import baseApi from '@/api/baseApi'

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

export function Leaves() {
  const { hasPermission } = useAuthStore()
  const [data, setData] = React.useState<LeaveRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [leaveTypeOptions, setLeaveTypeOptions] = React.useState<{ value: string; label: string }[]>([])

  // Balance state
  const [myBalance, setMyBalance] = React.useState<LeaveBalance[]>([])
  const [balanceLoading, setBalanceLoading] = React.useState(true)

  // Admin balance management
  const [editBalanceOpen, setEditBalanceOpen] = React.useState(false)
  const [employees, setEmployees] = React.useState<{ value: string; label: string }[]>([])
  const [selectedEmpId, setSelectedEmpId] = React.useState('')
  const [empBalance, setEmpBalance] = React.useState<LeaveBalance[]>([])
  const [editingBalance, setEditingBalance] = React.useState<{ leaveTypeId: string; allocated: number } | null>(null)

  const createForm = useForm<CreateLeaveFormData>({ resolver: zodResolver(createLeaveSchema) })
  const canApprove = hasPermission('leave:approve')
  const canManageBalance = hasPermission('leave:balance:edit')
  const canViewBalance = hasPermission('leave:balance:view')

  // Load my balance
  const loadMyBalance = async () => {
    try {
      setBalanceLoading(true)
      const res = await fetchMyBalanceService()
      if (res.success) setMyBalance(res.data)
    } catch { /* ignore if not employee */ }
    finally { setBalanceLoading(false) }
  }

  // Load leaves
  const loadLeaves = async () => {
    try {
      setLoading(true)
      const response = canApprove
        ? await fetchAllLeavesService()
        : await fetchMyLeavesService()

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
    } catch (error) {
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

  React.useEffect(() => {
    loadLeaves()
    loadMyBalance()
  }, [])

  // Admin: load employees for balance management
  const loadEmployees = async () => {
    try {
      const res = await fetchEmployeesService()
      setEmployees(res.data.map((e: Employee) => ({ value: e.id, label: e.user.name })))
    } catch { toast.error('Failed to load employees') }
  }

  const loadEmpBalance = async (empId: string) => {
    try {
      const res = await fetchBalanceByEmployeeService(empId)
      if (res.success) setEmpBalance(res.data)
    } catch { toast.error('Failed to load balance') }
  }

  const handleUpdateBalance = async () => {
    if (!selectedEmpId || !editingBalance) return
    try {
      const res = await baseApi.patch(`/leave/balance/${selectedEmpId}`, editingBalance)
      if (res.data.success) {
        toast.success('Balance updated')
        loadEmpBalance(selectedEmpId)
        setEditingBalance(null)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update balance')
    }
  }

  const handleBulkAllocate = async () => {
    try {
      const res = await baseApi.post('/leave/balance/allocate', { year: new Date().getFullYear() })
      if (res.data.success) {
        toast.success(`Allocated: ${res.data.data.created} created, ${res.data.data.skipped} skipped`)
        loadMyBalance()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to allocate')
    }
  }

  const handleOpenAdd = () => { loadLeaveTypes(); setAddOpen(true) }

  const onCreateLeave = async (formData: CreateLeaveFormData) => {
    try {
      const res = await createLeaveService(formData)
      if (res.success) {
        toast.success(res.message)
        setAddOpen(false)
        createForm.reset()
        loadLeaves()
        loadMyBalance()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create leave')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await updateLeaveStatusService(id, 'approved')
      if (res.success) { toast.success(res.message); loadLeaves() }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to approve') }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await updateLeaveStatusService(id, 'rejected')
      if (res.success) { toast.success(res.message); loadLeaves() }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to reject') }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteLeaveService(id)
      if (res.success) { toast.success(res.message); loadLeaves(); loadMyBalance() }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to delete') }
  }

  const columns = [
    ...(canApprove ? [columnHelper.accessor('employeeName', { header: 'Employee', cell: (info) => info.getValue() })] : []),
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
        if (row.status === 'pending' && canApprove) {
          items.push({ label: 'Approve', onClick: () => handleApprove(row.id) })
          items.push({ label: 'Reject', onClick: () => handleReject(row.id) })
        }
        if (row.status === 'pending' && hasPermission('leave:delete')) {
          items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
        }
        if (!items.length) return null
        return <ActionMenu items={items} />
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Management" subtitle={canApprove ? "Manage all employee leave requests." : "View and request your leaves."}>
        {canManageBalance && (
          <Button variant="outline" onClick={handleBulkAllocate}>
            <RefreshCw className="mr-2 h-4 w-4" /> Bulk Allocate
          </Button>
        )}
        {hasPermission('leave:create') && (
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Request Leave
          </Button>
        )}
      </PageHeader>

      {/* My Balance Cards */}
      {!balanceLoading && myBalance.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {myBalance.map(b => (
            <Card key={b.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{b.leaveType?.name ?? 'Unknown'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{b.allocated - b.used - b.pending} <span className="text-sm font-normal text-muted-foreground">remaining</span></div>
                <p className="text-xs text-muted-foreground mt-1">
                  {b.allocated} allocated · {b.used} used · {b.pending} pending
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Admin: Manage Employee Balance */}
      {canViewBalance && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Employee Leave Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FormSelect
                  value={selectedEmpId}
                  onChange={(e) => { setSelectedEmpId(e.target.value); if (e.target.value) loadEmpBalance(e.target.value) }}
                  options={employees}
                  placeholder="Select employee"
                />
              </div>
              {!employees.length && <Button variant="outline" onClick={loadEmployees}>Load Employees</Button>}
            </div>

            {selectedEmpId && empBalance.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {empBalance.map(b => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{b.leaveType?.name}</p>
                      <p className="text-xs text-muted-foreground">{b.used} used · {b.pending} pending · {b.allocated - b.used - b.pending} left</p>
                    </div>
                    {canManageBalance && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-16 h-8 rounded border px-2 text-sm"
                          defaultValue={b.allocated}
                          onBlur={(e) => setEditingBalance({ leaveTypeId: b.leaveTypeId, allocated: Number(e.target.value) })}
                        />
                        {editingBalance?.leaveTypeId === b.leaveTypeId && (
                          <Button size="sm" onClick={handleUpdateBalance}>Save</Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leave Requests Table */}
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search leaves..."
        emptyMessage="No leave requests found."
      />

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
