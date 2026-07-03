import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { apiErrorDataShape } from '@/types/sharedTypes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { DialogForm, FormField, FormInput, FormSelect, FormActions } from '@/components/forms/DialogForm'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  type FetchLeavesParams,
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

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

const limitOptions = [
  { value: '5', label: '5 items' },
  { value: '10', label: '10 items' },
  { value: '20', label: '20 items' },
]

export function Leaves() {
  const { hasPermission, user } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'
  const [data, setData] = React.useState<LeaveRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [viewAll, setViewAll] = React.useState(isSuperAdmin)
  const [addOpen, setAddOpen] = React.useState(false)
  const [leaveTypeOptions, setLeaveTypeOptions] = React.useState<{ value: string; label: string }[]>([])
  const [meta, setMeta] = React.useState<{ totalData: number; totalPages: number; currentPage: number; itemPerPage: number } | null>(null)
  const [filtersOpen, setFiltersOpen] = React.useState(false)

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
  const canApprove = hasPermission('leave:request:approve')
  const canManageBalance = hasPermission('leave:balance:edit')
  const canViewBalance = hasPermission('leave:balance:view')

  const [query, setQuery] = React.useState<FetchLeavesParams>({
    page: 1,
    limit: 5,
    search: '',
    status: '',
    from: '',
    to: '',
  })

  const loadMyBalance = async () => {
    try {
      setBalanceLoading(true)
      const res = await fetchMyBalanceService()
      if (res.success) setMyBalance(res.data)
    } catch {
      // ignore if not employee
    } finally {
      setBalanceLoading(false)
    }
  }

  const loadLeaves = async (params = query) => {
    try {
      setLoading(true)
      const response = (viewAll || isSuperAdmin) && canApprove
        ? await fetchAllLeavesService(params)
        : await fetchMyLeavesService(params)

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
      setMeta(response.meta ?? null)
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
    } catch {
      toast.error('Failed to load leave types')
    }
  }

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      loadLeaves(query)
    }, query.search ? 350 : 0)

    return () => window.clearTimeout(timer)
  }, [query, canApprove, viewAll])

  React.useEffect(() => {
    if (!isSuperAdmin) {
      loadMyBalance()
    } else {
      setBalanceLoading(false)
      setViewAll(true)
    }
  }, [isSuperAdmin])

  const loadEmployees = async () => {
    try {
      const res = await fetchEmployeesService({ page: 1, limit: 1000 })
      setEmployees(res.data.map((e: Employee) => ({ value: e.id, label: e.user.name })))
    } catch {
      toast.error('Failed to load employees')
    }
  }

  const loadEmpBalance = async (empId: string) => {
    try {
      const res = await fetchBalanceByEmployeeService(empId)
      if (res.success) setEmpBalance(res.data)
    } catch {
      toast.error('Failed to load balance')
    }
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
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to update balance')
    }
  }

  const handleBulkAllocate = async () => {
    try {
      const res = await baseApi.post('/leave/balance/allocate', { year: new Date().getFullYear() })
      if (res.data.success) {
        toast.success(`Allocated: ${res.data.data.created} created, ${res.data.data.skipped} skipped`)
        loadMyBalance()
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to allocate')
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
        loadLeaves(query)
        loadMyBalance()
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to create leave')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await updateLeaveStatusService(id, 'approved')
      if (res.success) { toast.success(res.message); loadLeaves(query) }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to approve')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await updateLeaveStatusService(id, 'rejected')
      if (res.success) { toast.success(res.message); loadLeaves(query) }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to reject')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteLeaveService(id)
      if (res.success) { toast.success(res.message); loadLeaves(query); loadMyBalance() }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const setQueryValue = (key: keyof FetchLeavesParams, value: string | number | undefined) => {
    setQuery((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? Number(value) || 1 : 1,
    }))
  }

  const clearFilter = (key: keyof FetchLeavesParams) => {
    setQuery((prev) => ({
      ...prev,
      [key]: '',
      page: 1,
    }))
  }

  const clearAllFilters = () => {
    setQuery((prev) => ({
      page: 1,
      limit: prev.limit ?? 5,
      search: '',
      status: '',
      from: '',
      to: '',
    }))
  }

  const columns = [
    ...((viewAll || isSuperAdmin) && canApprove ? [columnHelper.accessor('employeeName', { header: 'Employee', cell: (info) => info.getValue() })] : []),
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
        if (row.status === 'pending' && canApprove && (viewAll || isSuperAdmin)) {
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

  const totalPages = meta?.totalPages ?? 1
  const currentPage = meta?.currentPage ?? query.page ?? 1
  const activeFilterCount = ['search', 'status', 'from', 'to'].filter((key) => {
    const value = query[key as keyof FetchLeavesParams]
    return value !== '' && value !== undefined && value !== null
  }).length

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Management" subtitle={canApprove && (viewAll || isSuperAdmin) ? "Manage all employee leave requests." : "View and request your leaves."}>
        {canApprove && !isSuperAdmin && (
          <Button variant="outline" onClick={() => setViewAll(prev => !prev)}>
            {viewAll ? 'My Leaves' : 'All Leaves'}
          </Button>
        )}
        {canManageBalance && (
          <Button variant="outline" onClick={handleBulkAllocate}>
            <RefreshCw className="mr-2 h-4 w-4" /> Bulk Allocate
          </Button>
        )}
        {hasPermission('leave:request:create') && !isSuperAdmin && (
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Request Leave
          </Button>
        )}
      </PageHeader>

      {!balanceLoading && !isSuperAdmin && myBalance.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {myBalance.map(b => (
            <Card key={b.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{b.leaveType?.name ?? 'Unknown'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{b.allocated - b.used - b.pending} <span className="text-sm font-normal text-muted-foreground">remaining</span></div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {b.allocated} allocated · {b.used} used · {b.pending} pending
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                          className="h-8 w-16 rounded border px-2 text-sm"
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

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query.search ?? ''}
              onChange={(e) => setQueryValue('search', e.target.value)}
              placeholder="Search leave requests..."
              className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 min-w-40 justify-between rounded-xl border-dashed px-4">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </span>
                <span className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{filtersOpen ? 'Close' : 'Open'}</span>
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[520px] p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Leave Filters</p>
                    <p className="text-sm text-muted-foreground">Refine requests without cluttering the page.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    Clear all
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <FormSelect
                    value={query.status ?? ''}
                    onChange={(e) => setQueryValue('status', e.target.value)}
                    options={statusOptions}
                    placeholder="Status"
                  />
                  <FormInput
                    type="date"
                    value={query.from ?? ''}
                    onChange={(e) => setQueryValue('from', e.target.value)}
                    placeholder="From"
                  />
                  <FormInput
                    type="date"
                    value={query.to ?? ''}
                    onChange={(e) => setQueryValue('to', e.target.value)}
                    placeholder="To"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">Only filled filters are passed to the API.</p>
                  <div className="flex gap-2">
                    {query.status && (
                      <Button variant="outline" size="sm" onClick={() => clearFilter('status')}>Clear status</Button>
                    )}
                    {(query.from || query.to) && (
                      <Button variant="outline" size="sm" onClick={() => { clearFilter('from'); clearFilter('to') }}>
                        Clear dates
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-3 lg:ml-auto">
            <FormSelect
              value={String(query.limit ?? 5)}
              onChange={(e) => setQueryValue('limit', Number(e.target.value))}
              options={limitOptions}
              placeholder="Items per page"
              className="w-40"
            />
            <Button variant="outline" onClick={clearAllFilters} className="h-12 rounded-xl px-5">
              Reset
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchable={false}
        emptyMessage="No leave requests found."
      />

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {currentPage} of {totalPages}
          {meta ? ` · ${meta.totalData} total leave requests` : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQueryValue('page', Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || loading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQueryValue('page', Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || loading}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

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
