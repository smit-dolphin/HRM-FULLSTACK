import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Download, Plus, ArrowUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { exportToExcel } from '@/utils/exportToExcel'
import { DialogForm, FormField, FormSelect, FormActions, FormInput } from '@/components/forms/DialogForm'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fetchEmployeesService,
  createEmployeeService,
  updateEmployeeService,
  deleteEmployeeService,
  toggleEmployeeBlockService,
  type Employee,
} from '@/services/employeeService/employeeService'
import { fetchUsersService, type User } from '@/services/userService/userService'
import { fetchDepartmentsService, type Department } from '@/services/departmentService/departmentService'
import { fetchBalanceByEmployeeService, type LeaveBalance } from '@/services/leaveService/leaveService'
import baseApi from '@/api/baseApi'
import { createEmployeeSchema, updateEmployeeSchema, type CreateEmployeeFormData, type UpdateEmployeeFormData } from '@/schemas/employee.schema'

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

export function Employees() {
  const { hasPermission } = useAuthStore()
  const [data, setData] = React.useState<EmployeeRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState<EmployeeRow | null>(null)

  // Balance dialog
  const [balanceOpen, setBalanceOpen] = React.useState(false)
  const [balanceEmployee, setBalanceEmployee] = React.useState<EmployeeRow | null>(null)
  const [empBalance, setEmpBalance] = React.useState<LeaveBalance[]>([])
  const [editingBalance, setEditingBalance] = React.useState<{ leaveTypeId: string; allocated: number } | null>(null)

  // Dropdown options
  const [users, setUsers] = React.useState<{ value: string; label: string }[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [createDesigOptions, setCreateDesigOptions] = React.useState<{ value: string; label: string }[]>([])
  const [editDesigOptions, setEditDesigOptions] = React.useState<{ value: string; label: string }[]>([])

  const createForm = useForm<CreateEmployeeFormData>({ resolver: zodResolver(createEmployeeSchema) })
  const editForm = useForm<UpdateEmployeeFormData>({ resolver: zodResolver(updateEmployeeSchema) })

  const selectedCreateDeptId = createForm.watch('departmentId')
  const selectedEditDeptId = editForm.watch('departmentId')

  // Filter designations for create form
  React.useEffect(() => {
    if (selectedCreateDeptId) {
      const dept = departments.find(d => d.id === selectedCreateDeptId)
      setCreateDesigOptions(dept?.designations.map(d => ({ value: d.id, label: d.name })) || [])
    } else {
      setCreateDesigOptions([])
    }
  }, [selectedCreateDeptId, departments])

  // Filter designations for edit form
  React.useEffect(() => {
    if (selectedEditDeptId) {
      const dept = departments.find(d => d.id === selectedEditDeptId)
      setEditDesigOptions(dept?.designations.map(d => ({ value: d.id, label: d.name })) || [])
    } else {
      setEditDesigOptions([])
    }
  }, [selectedEditDeptId, departments])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetchEmployeesService()
      setData(response.data.map((emp: Employee) => ({
        id: emp.id,
        name: emp.user.name,
        email: emp.user.email,
        departmentId: emp.departmentId,
        designationId: emp.designationId,
        departmentName: emp.department?.name ?? emp.departmentId,
        designationName: emp.designation?.name ?? emp.designationId,
        isBlocked: emp.isBlocked,
        status: emp.isBlocked ? 'Blocked' : 'Active',
        createdAt: emp.user.createdAt,
        reportsToId: emp.reportsToId,
        managerId: emp.manager?.id,
        managerName: emp.manager?.user?.name,
      })))
    } catch (error) {
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const loadFormOptions = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        fetchUsersService(1, 1000),
        fetchDepartmentsService(),
      ])
      setUsers(usersRes.data.map((u: User) => ({ value: u.id, label: `${u.name} (${u.email})` })))
      setDepartments(deptsRes.data)
    } catch (error) {
      toast.error('Failed to load form options')
    }
  }

  React.useEffect(() => { loadEmployees() }, [])

  const handleOpenAdd = () => {
    loadFormOptions()
    setAddOpen(true)
  }

  const handleOpenEdit = (row: EmployeeRow) => {
    loadFormOptions()
    setEditingEmployee(row)
    editForm.reset({ departmentId: row.departmentId, designationId: row.designationId, reportsToId: row.reportsToId })
    setEditOpen(true)
  }

  const handleOpenBalance = async (row: EmployeeRow) => {
    setBalanceEmployee(row)
    try {
      const res = await fetchBalanceByEmployeeService(row.id)
      if (res.success) setEmpBalance(res.data)
    } catch { toast.error('Failed to load balance') }
    setBalanceOpen(true)
  }

  const handleSaveBalance = async () => {
    if (!balanceEmployee || !editingBalance) return
    try {
      const res = await baseApi.patch(`/leave/balance/${balanceEmployee.id}`, editingBalance)
      if (res.data.success) {
        toast.success('Balance updated')
        const refreshed = await fetchBalanceByEmployeeService(balanceEmployee.id)
        if (refreshed.success) setEmpBalance(refreshed.data)
        setEditingBalance(null)
      }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to update balance') }
  }

  const onCreateEmployee = async (formData: CreateEmployeeFormData) => {
    try {
      const res = await createEmployeeService(formData)
      if (res.success) {
        toast.success(res.message)
        setAddOpen(false)
        createForm.reset()
        loadEmployees()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create employee')
    }
  }

  const onUpdateEmployee = async (formData: UpdateEmployeeFormData) => {
    if (!editingEmployee) return
    try {
      const res = await updateEmployeeService(editingEmployee.id, formData)
      if (res.success) {
        toast.success(res.message)
        setEditOpen(false)
        editForm.reset()
        setEditingEmployee(null)
        loadEmployees()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update employee')
    }
  }

  const handleToggleBlock = async (row: EmployeeRow) => {
    try {
      const res = await toggleEmployeeBlockService(row.id, !row.isBlocked)
      if (res.success) {
        toast.success(res.message)
        loadEmployees()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update block status')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteEmployeeService(id)
      if (res.success) {
        toast.success(res.message)
        loadEmployees()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete employee')
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
    columnHelper.accessor('email', { header: 'Email', cell: (info) => info.getValue() }),
    columnHelper.accessor('departmentName', { header: 'Department', cell: (info) => info.getValue() }),
    columnHelper.accessor('designationName', { header: 'Designation', cell: (info) => info.getValue() }),
    columnHelper.accessor('reportsToId', {
      header: 'Manager',
      cell: (info) => {
        const managerId = info.getValue();
        const manager = data.find((emp) => emp.id === managerId);
        return manager?.name ?? '—';
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

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search employees..."
        emptyMessage="No employees found."
      />

      {/* Add Employee Dialog */}
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
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset() }} submitLabel="Create" isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>

      {/* Edit Employee Dialog */}
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

      {/* Manage Balance Dialog */}
      <DialogForm open={balanceOpen} onClose={() => { setBalanceOpen(false); setBalanceEmployee(null); setEmpBalance([]); setEditingBalance(null) }} title="Manage Leave Balance" subtitle={balanceEmployee?.name ?? ''}>
        <div className="space-y-3">
          {empBalance.length === 0 && <p className="text-sm text-muted-foreground">No balance records found.</p>}
          {empBalance.map(b => (
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
                    className="w-20 h-8"
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
