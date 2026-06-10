import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Download, Plus, ArrowUpDown, MoreVertical } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { exportToExcel } from '@/utils/exportToExcel'
import { DialogForm, FormField, FormSelect, FormActions } from '@/components/forms/DialogForm'
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
}

const columnHelper = createColumnHelper<EmployeeRow>()

export function Employees() {
  const [data, setData] = React.useState<EmployeeRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState<EmployeeRow | null>(null)
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)

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
    editForm.reset({ departmentId: row.departmentId, designationId: row.designationId })
    setEditOpen(true)
    setOpenMenuId(null)
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
    setOpenMenuId(null)
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
    setOpenMenuId(null)
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
        return (
          <div className="relative">
            <button onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)} className="p-1 rounded hover:bg-muted">
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenuId === row.id && (
              <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border bg-card p-1 shadow">
                <button onClick={() => handleOpenEdit(row)} className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded">Edit</button>
                <button onClick={() => handleToggleBlock(row)} className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded">
                  {row.isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button onClick={() => handleDelete(row.id)} className="w-full text-left px-2 py-1 text-sm text-destructive hover:bg-muted rounded">Delete</button>
              </div>
            )}
          </div>
        )
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" subtitle="Manage your organization's employees.">
        <Button variant="outline" onClick={() => exportToExcel({ data, sheetName: 'Employees' })} disabled={!data.length}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
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
            <FormField label="Designation" error={editForm.formState.errors.designationId?.message}>
              <FormSelect {...editForm.register('designationId')} error={!!editForm.formState.errors.designationId} options={editDesigOptions} placeholder={selectedEditDeptId ? 'Select designation' : 'Select department first'} />
            </FormField>
          </div>
          <FormActions onCancel={() => { setEditOpen(false); editForm.reset(); setEditingEmployee(null) }} submitLabel="Update" isSubmitting={editForm.formState.isSubmitting} />
        </form>
      </DialogForm>
    </div>
  )
}
