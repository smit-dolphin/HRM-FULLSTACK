import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'sonner'
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
  createLeaveService,
  updateLeaveStatusService,
  deleteLeaveService,
  type Leave,
} from '@/services/leaveService/leaveService'
import { createLeaveSchema, type CreateLeaveFormData } from '@/schemas/leave.schema'

// -----------------------------------------------------------------------------
// UI - Leave Dashboard (HRM style)
// -----------------------------------------------------------------------------

type LeaveRow = {
  id: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
}

const columnHelper = createColumnHelper<LeaveRow>()

export function LeaveDashboard() {
  const { hasPermission, user } = useAuthStore()
  const canApprove = hasPermission('leave:approve')
  const canCreate = hasPermission('leave:create')
  const canDelete = hasPermission('leave:delete')

  const [data, setData] = React.useState<LeaveRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [viewAll, setViewAll] = React.useState(false) // manager/admin view toggle
  const [addOpen, setAddOpen] = React.useState(false)
  const createForm = useForm<CreateLeaveFormData>({ resolver: zodResolver(createLeaveSchema) })
  const loadLeaves = async () => {
    try {
      setLoading(true)
      const service = viewAll && (user.role === 'admin' || user.role === 'superadmin') ? fetchAllLeavesService : fetchMyLeavesService
      const response = await service()
      setData(
        response.data.map((leave: Leave) => ({
          id: leave.id,
          employeeName: leave.employee?.user?.name ?? 'You',
          leaveType: leave.leaveType?.name ?? 'Unknown',
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
          status: leave.status,
        }))
      )
    } catch (error) {
      toast.error('Failed to fetch leaves')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadLeaves()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAll])

  const onCreateLeave = async (formData: CreateLeaveFormData) => {
    try {
      const res = await createLeaveService(formData)
      if (res.success) {
        toast.success(res.message)
        setAddOpen(false)
        loadLeaves()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create leave')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await updateLeaveStatusService(id, 'approved')
      if (res.success) {
        toast.success(res.message)
        loadLeaves()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve leave')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await updateLeaveStatusService(id, 'rejected')
      if (res.success) {
        toast.success(res.message)
        loadLeaves()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject leave')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteLeaveService(id)
      if (res.success) {
        toast.success(res.message)
        loadLeaves()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete leave')
    }
  }

  const columns = [
    columnHelper.accessor('employeeName', { header: 'Employee', cell: (info) => info.getValue() }),
    columnHelper.accessor('leaveType', {
      header: 'Type',
      cell: (info) => <span className="capitalize">{info.getValue()}</span>,
    }),
    columnHelper.accessor('startDate', {
      header: 'From',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor('endDate', {
      header: 'To',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor('reason', { header: 'Reason', cell: (info) => info.getValue() }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        const variant = status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'
        return <StatusBadge label={status} variant={variant} />
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const row = info.row.original as LeaveRow
        const items: ActionMenuItem[] = []

        if (row.status === 'pending' && canApprove) {
          items.push({ label: 'Approve', onClick: () => handleApprove(row.id) })
          items.push({ label: 'Reject', onClick: () => handleReject(row.id) })
        }

        if (row.status === 'pending' && canDelete) {
          items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
        }

        if (!items.length) return null
        return <ActionMenu items={items} />
      },
    }),
  ]

  // ---------------------------------------------------------------------------
  // UI – Create Leave Dialog
  // ---------------------------------------------------------------------------
  const leaveTypeOptions = [
    { value: 'sick', label: 'Sick' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle="Request, view and approve employee leaves."
      >
        {canCreate && (
          <button
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={() => setAddOpen(true)}
          >
            Request Leave
          </button>
        )}
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <button
            className="ml-4 text-sm underline"
            onClick={() => setViewAll((prev) => !prev)}
          >
            {viewAll ? 'Show My Leaves' : 'Show All Leaves'}
          </button>
        )}
      </PageHeader>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search leaves..."
        emptyMessage="No leave requests found."
      />

      {/* Create Leave Dialog */}
      <DialogForm
        open={addOpen}
        onClose={() => {
          setAddOpen(false)
        }}
        title="Request New Leave"
        subtitle="Fill the form below to create a leave request"
      >
        <form onSubmit={createForm.handleSubmit(onCreateLeave)} className="space-y-4">
          <FormField label="Leave Type" error={createForm.formState.errors.leaveTypeId?.message}>
            <FormSelect
              {...createForm.register('leaveTypeId')}
              options={leaveTypeOptions}
              placeholder="Select type"
            />
          </FormField>
          <FormField label="Start Date" error={createForm.formState.errors.startDate?.message}>
            <FormInput {...createForm.register('startDate')} type="date" />
          </FormField>
          <FormField label="End Date" error={createForm.formState.errors.endDate?.message}>
            <FormInput {...createForm.register('endDate')} type="date" />
          </FormField>
          <FormField label="Reason" error={createForm.formState.errors.reason?.message}>
            <FormInput {...createForm.register('reason')} placeholder="Why you need the leave" />
          </FormField>
          <FormActions onCancel={() => setAddOpen(false)} isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>
    </div>
  )
}
