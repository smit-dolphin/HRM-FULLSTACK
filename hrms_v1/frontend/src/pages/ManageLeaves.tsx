import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { apiErrorDataShape } from '@/types/sharedTypes'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fetchAllLeavesService,
  updateLeaveStatusService,
  deleteLeaveService,
  type Leave,
} from '@/services/leaveService/leaveService'

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

export function ManageLeaves() {
  const { hasPermission } = useAuthStore()
  const [data, setData] = React.useState<LeaveRow[]>([])
  const [loading, setLoading] = React.useState(true)

  const canApprove = hasPermission('leave:request:approve')

  const loadLeaves = async () => {
    try {
      setLoading(true)
      const response = await fetchAllLeavesService()

      setData(response.data.map((leave: Leave) => ({
        id: leave.id,
        employeeName: leave.employee?.user?.name ?? 'Unknown',
        leaveType: leave.leaveType?.name ?? 'Unknown',
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      })))
    } catch (error) {
      toast.error('Failed to fetch leaves')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadLeaves() }, [])

  const handleApprove = async (id: string) => {
    try {
      const res = await updateLeaveStatusService(id, 'approved')
      if (res.success) {
        toast.success(res.message)
        loadLeaves()
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to approve leave')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await updateLeaveStatusService(id, 'rejected')
      if (res.success) {
        toast.success(res.message)
        loadLeaves()
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to reject leave')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteLeaveService(id)
      if (res.success) {
        toast.success(res.message)
        loadLeaves()
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to delete leave')
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
        const row = info.row.original
        const items: ActionMenuItem[] = []

        if (row.status === 'pending' && canApprove) {
            items.push({ label: 'Approve', onClick: () => handleApprove(row.id) })
            items.push({ label: 'Reject', onClick: () => handleReject(row.id) })
          }

          if (row.status === 'pending' && hasPermission('leave:request:delete')) {
            items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
          }

        if (!items.length) return null
        return <ActionMenu items={items} />
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Approvals" subtitle="Manage all employee leave requests." />

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search leaves..."
        emptyMessage="No leave requests found."
      />
    </div>
  )
}
