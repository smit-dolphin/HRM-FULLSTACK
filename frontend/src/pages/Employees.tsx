import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Download, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { exportToExcel } from '@/utils/exportToExcel'
import { DialogForm, FormField, FormSelect, FormActions, FormInput } from '@/components/forms/DialogForm'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fetchEmployeesService,
  createEmployeeService,
  updateEmployeeService,
  deleteEmployeeService,
  toggleEmployeeBlockService,
  type Employee,
  type FetchEmployeesParams,
} from '@/services/employeeService/employeeService'
import { fetchUsersService, type User } from '@/services/userService/userService'
import { fetchDepartmentsService, type Department } from '@/services/departmentService/departmentService'
import { fetchBalanceByEmployeeService, type LeaveBalance } from '@/services/leaveService/leaveService'
import baseApi from '@/api/baseApi'
import { createEmployeeSchema, updateEmployeeSchema, type CreateEmployeeFormData, type UpdateEmployeeFormData } from '@/schemas/employee.schema'
import { useMutation, useQuery } from '@tanstack/react-query'
import { querryClient } from '@/querryOptions/querryClinets'

type EmployeeRow = {
  id: string
  name: string
  email: string
  departmentId: string
  designationId: string
  departmentName: string
  designationName: string
  isBlocked: boolean
  status: 'Active' | 'Blocked'
  createdAt: string
  reportsToId?: string
  managerId?: string
  managerName?: string
}

const columnHelper = createColumnHelper<EmployeeRow>()

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'false', label: 'Active' },
  { value: 'true', label: 'Blocked' },
]

const limitOptions = [
  { value: '5', label: '5 items' },
  { value: '10', label: '10 items' },
  { value: '20', label: '20 items' },
]

export function Employees() {
  const { hasPermission } = useAuthStore()
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState<EmployeeRow | null>(null)
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  // Balance dialog
  const [balanceOpen, setBalanceOpen] = React.useState(false)
  const [balanceEmployee, setBalanceEmployee] = React.useState<EmployeeRow | null>(null)
  const [editingBalance, setEditingBalance] = React.useState<{ leaveTypeId: string; allocated: number } | null>(null)

  const [createDesigOptions, setCreateDesigOptions] = React.useState<{ value: string; label: string }[]>([])
  const [editDesigOptions, setEditDesigOptions] = React.useState<{ value: string; label: string }[]>([])

  const createForm = useForm<CreateEmployeeFormData>({ resolver: zodResolver(createEmployeeSchema) })
  const editForm = useForm<UpdateEmployeeFormData>({ resolver: zodResolver(updateEmployeeSchema) })

  const selectedCreateDeptId = createForm.watch('departmentId')
  const selectedEditDeptId = editForm.watch('departmentId')

  const [query, setQuery] = React.useState<FetchEmployeesParams>({
    page: 1,
    limit: 5,
    search: '',
    isBlocked: '',
    from: '',
    to: '',
  })

  const fetchEmployeeQuerry = useQuery({
    queryKey: ['employees',  query],
    queryFn: () => fetchEmployeesService(query),
  })
  const data = fetchEmployeeQuerry.data?.data.map((emp) => ({
    id: emp.id,
    name: emp.user.name,
    email: emp.user.email,

    departmentId: emp.departmentId,
    designationId: emp.designationId,

    departmentName: emp.department?.name ?? emp.departmentId,
    designationName: emp.designation?.name ?? emp.designationId,

    isBlocked: emp.isBlocked,
    status: emp.isBlocked ? "Blocked" : "Active",

    createdAt: emp.user.createdAt,

    reportsToId: emp.reportsToId,

    managerId: emp.manager?.id,
    managerName: emp.manager?.user?.name,
  })) ?? [];

  console.log(data)
  const meta = fetchEmployeeQuerry.data?.meta || null
  const { isLoading, isFetching, error } = fetchEmployeeQuerry

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsersService({ page: 1, limit: 1000 }),
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsService,
  });

  const users = usersQuery.data?.data.map((d) => ({ value: d.id, label: `${d.name} (${d.email})` })) || []
  const departments = departmentsQuery.data?.data || []

  React.useEffect(() => {
    if (selectedCreateDeptId) {
      const dept = departments.find(d => d.id === selectedCreateDeptId)
      setCreateDesigOptions(dept?.designations.map(d => ({ value: d.id, label: d.name })) || [])
    } else {
      setCreateDesigOptions([])
    }
  }, [selectedCreateDeptId, departments])

  React.useEffect(() => {
    if (selectedEditDeptId) {
      const dept = departments.find(d => d.id === selectedEditDeptId)
      setEditDesigOptions(dept?.designations.map(d => ({ value: d.id, label: d.name })) || [])
    } else {
      setEditDesigOptions([])
    }
  }, [selectedEditDeptId, departments])


  const setQueryValue = (key: keyof FetchEmployeesParams, value: string | number | undefined) => {
    setQuery((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? Number(value) || 1 : 1,
    }))
  }

  const clearFilter = (key: keyof FetchEmployeesParams) => {
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
      isBlocked: '',
      from: '',
      to: '',
    }))
  }

  const handleOpenAdd = () => {
    // loadFormOptions()
    setAddOpen(true)
  }

  const handleOpenEdit = (row: EmployeeRow) => {
    // loadFormOptions()
    setEditingEmployee(row)
    editForm.reset({ departmentId: row.departmentId, designationId: row.designationId, reportsToId: row.reportsToId })
    setEditOpen(true)
  }

  const getLeaveBalance = useQuery({
    queryKey: ["leaveBalance", balanceEmployee?.id],
    queryFn: () => fetchBalanceByEmployeeService(balanceEmployee!.id),
    enabled: !!balanceEmployee?.id,
  })

  const empBalance = getLeaveBalance.data?.data

  const handleOpenBalance = (row: EmployeeRow) => {
    setBalanceEmployee(row)
    setBalanceOpen(true)
  }

  const saveBalanceMutation=useMutation({
    mutationFn: ({ id, balance }: { id: string; balance: { leaveTypeId: string; allocated: number } }) =>
      baseApi.patch(`/leave/balance/${id}`, balance),
    onSuccess: () => {
      toast.success('Balance updated')
      querryClient.invalidateQueries({
        queryKey: ["leaveBalance", balanceEmployee?.id],
      });
      setEditingBalance(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update balance')
    }
  }
  )

  const handleSaveBalance = async () => {
    if (!balanceEmployee || !editingBalance) return
    saveBalanceMutation.mutate({ id: balanceEmployee.id, balance: editingBalance })
  }

  const createEmployeeMutation = useMutation({
    mutationFn: createEmployeeService,
    onSuccess: () => {
      toast.success("Employee created successfully")
      setAddOpen(false)
      createForm.reset()
      querryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update employee')
    }
  })

  const updateEmployeeMutation = useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: string;
      formData: UpdateEmployeeFormData;
    }) => updateEmployeeService(id, formData),
    onSuccess: () => {
      toast.success("Employee updated successfully")
      setEditOpen(false)
      querryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      setEditingEmployee(null)
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update employee')
    }
  })

  const toggleBlockMutation = useMutation({
    mutationFn: ({ id, isempBlocked }: { id: string, isempBlocked: boolean }) => toggleEmployeeBlockService(id, isempBlocked),
    onSuccess: () => {
      toast.success("Block status updated successfully")
      querryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update block status')
    }
  })

  const deleteEmployeeMutation = useMutation({
    mutationFn: deleteEmployeeService,
    onSuccess: () => {
      toast.success("Employee deleted successfully")
      querryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete employee')
    }
  })

  const onCreateEmployee = async (formData: CreateEmployeeFormData) => {
    createEmployeeMutation.mutate(formData)
  }

  const onUpdateEmployee = async (formData: UpdateEmployeeFormData) => {


    if (!editingEmployee) return
    updateEmployeeMutation.mutate({ id: editingEmployee.id, formData })

  }

  const handleToggleBlock = async (row: EmployeeRow) => {

    toggleBlockMutation.mutate({ id: row.id, isempBlocked: !row.isBlocked })
    // const res = await toggleEmployeeBlockService(row.id, !row.isBlocked)

  }

  const handleDelete = async (id: string) => {
    deleteEmployeeMutation.mutate(id)
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
    columnHelper.accessor('email', { header: 'Email', cell: (info) => info.getValue() }),
    columnHelper.accessor('departmentName', { header: 'Department', cell: (info) => info.getValue() }),
    columnHelper.accessor('designationName', { header: 'Designation', cell: (info) => info.getValue() }),
    columnHelper.accessor('reportsToId', {
      header: 'Manager',
      cell: (info) => {
        const managerId = info.getValue()
        const manager = data.find((emp) => emp.id === managerId)
        return manager?.name ?? '—'
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        return <StatusBadge label={status} variant={status === 'Active' ? 'success' : 'danger'} />
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const row = info.row.original
        const items: ActionMenuItem[] = []
        if (hasPermission('employee:edit')) items.push({ label: 'Edit', onClick: () => handleOpenEdit(row) })
        if (hasPermission('leave:balance:view')) items.push({ label: 'Manage Balance', onClick: () => handleOpenBalance(row) })
        if (hasPermission('employee:block')) items.push({ label: row.isBlocked ? 'Unblock' : 'Block', onClick: () => handleToggleBlock(row) })
        if (hasPermission('employee:delete')) items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
        if (!items.length) return null
        return <ActionMenu items={items} />
      },
    }),
  ]

  const totalPages = meta?.totalPages ?? 1
  const currentPage = meta?.currentPage ?? query.page ?? 1
  const activeFilterCount = ['search', 'isBlocked', 'from', 'to'].filter((key) => {
    const value = query[key as keyof FetchEmployeesParams]
    return value !== '' && value !== undefined && value !== null
  }).length

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" subtitle="Manage your organization's employees.">
        <Button variant="outline" onClick={() => exportToExcel({ data, sheetName: 'Employees' })} disabled={!data.length}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        {hasPermission('employee:create') && (
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        )}
      </PageHeader>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query.search ?? ''}
              onChange={(e) => setQueryValue('search', e.target.value)}
              placeholder="Search employees by name, email, department..."
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
                    <p className="font-medium">Employee Filters</p>
                    <p className="text-sm text-muted-foreground">Refine the list with server-side filters.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    Clear all
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <FormSelect
                    value={query.isBlocked ?? ''}
                    onChange={(e) => setQueryValue('isBlocked', e.target.value)}
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
                  <p className="text-muted-foreground">Only non-empty values are sent to the API.</p>
                  <div className="flex gap-2">
                    {query.isBlocked && (
                      <Button variant="outline" size="sm" onClick={() => clearFilter('isBlocked')}>Clear status</Button>
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
        loading={isLoading}
        searchable={false}
        emptyMessage="No employees found."
      />

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {currentPage} of {totalPages}
          {meta ? ` · ${meta.totalData} total employees` : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQueryValue('page', Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQueryValue('page', Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <DialogForm open={addOpen} onClose={() => { setAddOpen(false); createForm.reset() }} title="Add Employee" subtitle="Assign a user as an employee">
        <form onSubmit={createForm.handleSubmit(onCreateEmployee)}>
          <div className="space-y-4">
            <FormField label="User" required error={createForm.formState.errors.userId?.message}>
              <FormSelect {...createForm.register('userId')} error={!!createForm.formState.errors.userId} options={users} placeholder="Select a user" />
            </FormField>
            <FormField label="Department" required error={createForm.formState.errors.departmentId?.message}>
              <FormSelect {...createForm.register('departmentId')} error={!!createForm.formState.errors.departmentId} options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="Select department" />
            </FormField>
            <FormField label="Manager" error={createForm.formState.errors.reportsToId?.message}>
              <FormSelect {...createForm.register('reportsToId')} error={!!createForm.formState.errors.reportsToId} options={data.map(emp => ({ value: emp.id, label: emp.name }))} placeholder="Select manager (optional)" />
            </FormField>
            <FormField label="Designation" required error={createForm.formState.errors.designationId?.message}>
              <FormSelect {...createForm.register('designationId')} error={!!createForm.formState.errors.designationId} options={createDesigOptions} placeholder={selectedCreateDeptId ? 'Select designation' : 'Select department first'} />
            </FormField>
          </div>
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset() }} submitLabel="Create" isSubmitting={createEmployeeMutation.isPending} />
        </form>
      </DialogForm>

      <DialogForm open={editOpen} onClose={() => { setEditOpen(false); editForm.reset(); setEditingEmployee(null) }} title="Edit Employee" subtitle={`Editing ${editingEmployee?.name ?? ''}`}>
        <form onSubmit={editForm.handleSubmit(onUpdateEmployee)}>
          <div className="space-y-4">
            <FormField label="Department" error={editForm.formState.errors.departmentId?.message}>
              <FormSelect {...editForm.register('departmentId')} error={!!editForm.formState.errors.departmentId} options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="Select department" />
            </FormField>
            <FormField label="Manager" error={editForm.formState.errors.reportsToId?.message}>
              <FormSelect {...editForm.register('reportsToId')} error={!!editForm.formState.errors.reportsToId} options={data.map(emp => ({ value: emp.id, label: emp.name }))} placeholder="Select manager (optional)" />
            </FormField>
            <FormField label="Designation" error={editForm.formState.errors.designationId?.message}>
              <FormSelect {...editForm.register('designationId')} error={!!editForm.formState.errors.designationId} options={editDesigOptions} placeholder={selectedEditDeptId ? 'Select designation' : 'Select department first'} />
            </FormField>
          </div>
          <FormActions onCancel={() => { setEditOpen(false); editForm.reset(); setEditingEmployee(null) }} submitLabel="Update" isSubmitting={editForm.formState.isSubmitting} />
        </form>
      </DialogForm>

      <DialogForm open={balanceOpen} onClose={() => { setBalanceOpen(false); setBalanceEmployee(null);  setEditingBalance(null) }} title="Manage Leave Balance" subtitle={balanceEmployee?.name ?? ''}>
        <div className="space-y-3">
          {empBalance?.length === 0 && <p className="text-sm text-muted-foreground">No balance records found.</p>}
          {empBalance?.map(b => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{b.leaveType?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {b.allocated - b.used - b.pending} remaining · {b.used} used · {b.pending} pending
                </p>
              </div>
              {hasPermission('leave:balance:edit') && (
                <div className="flex items-center gap-2">
                  <FormInput
                    type="number"
                    className="h-8 w-20"
                    defaultValue={b.allocated}
                    onChange={(e) => setEditingBalance({ leaveTypeId: b.leaveTypeId, allocated: Number(e.target.value) })}
                  />
                  {editingBalance?.leaveTypeId === b.leaveTypeId && (
                    <Button size="sm" onClick={handleSaveBalance}>Save</Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogForm>
    </div>
  )
}
