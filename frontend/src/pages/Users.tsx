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
import { DialogForm, FormField, FormInput, FormSelect, FormActions } from '@/components/forms/DialogForm'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fetchUsersService,
  createUserService,
  updateUserService,
  deleteUserService,
  deactivateUserService,
  type User,
} from '@/services/userService/userService'
import { createUserSchema, updateUserSchema, type CreateUserFormData, type UpdateUserFormData } from '@/schemas/user.schema'

type UserRow = {
  id: string
  name: string
  email: string
  role: 'employee' | 'admin' | 'superadmin'
  isActive: boolean
  status: 'Active' | 'Inactive'
  createdAt: string
}

const columnHelper = createColumnHelper<UserRow>()

const roleOptions = [
  { value: 'employee', label: 'Employee' },
  { value: 'teamleader', label: 'Team Leader' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
]

export function Users() {
  const { hasPermission } = useAuthStore()
  const [data, setData] = React.useState<UserRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<UserRow | null>(null)

  const createForm = useForm<CreateUserFormData>({ resolver: zodResolver(createUserSchema) })
  const editForm = useForm<UpdateUserFormData>({ resolver: zodResolver(updateUserSchema) })

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetchUsersService(1, 100)
      setData(response.data.map((user: User) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        status: user.isActive ? 'Active' : 'Inactive',
        createdAt: user.createdAt,
      })))
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadUsers() }, [])

  const handleOpenEdit = (row: UserRow) => {
    setEditingUser(row)
    editForm.reset({ name: row.name, email: row.email, role: row.role, isActive: row.isActive })
    setEditOpen(true)
  }

  const onCreateUser = async (formData: CreateUserFormData) => {
    try {
      const res = await createUserService(formData)
      if (res.success) {
        toast.success(res.message)
        setAddOpen(false)
        createForm.reset()
        loadUsers()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user')
    }
  }

  const onUpdateUser = async (formData: UpdateUserFormData) => {
    if (!editingUser) return
    try {
      const res = await updateUserService(editingUser.id, formData)
      if (res.success) {
        toast.success(res.message)
        setEditOpen(false)
        editForm.reset()
        setEditingUser(null)
        loadUsers()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      const res = await deactivateUserService(id)
      if (res.success) {
        toast.success(res.message)
        loadUsers()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteUserService(id)
      if (res.success) {
        toast.success(res.message)
        loadUsers()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
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
    columnHelper.accessor('role', { header: 'Role', cell: (info) => info.getValue() }),
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
        if (hasPermission('user:edit')) items.push({ label: 'Edit', onClick: () => handleOpenEdit(row) })
        if (hasPermission('user:delete')) items.push({ label: 'Deactivate', onClick: () => handleDeactivate(row.id) })
        if (hasPermission('user:delete')) items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
        if (!items.length) return null
        return <ActionMenu items={items} />
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Manage application users and access.">
        <Button variant="outline" onClick={() => exportToExcel({ data, sheetName: 'Users' })} disabled={!data.length}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        {hasPermission('user:create') && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        )}
      </PageHeader>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search users..."
        emptyMessage="No users found."
      />

      {/* Add User Dialog */}
      <DialogForm open={addOpen} onClose={() => { setAddOpen(false); createForm.reset() }} title="Add User" subtitle="Create a new user account">
        <form onSubmit={createForm.handleSubmit(onCreateUser)}>
          <div className="space-y-4">
            <FormField label="Full name" required error={createForm.formState.errors.name?.message}>
              <FormInput {...createForm.register('name')} error={!!createForm.formState.errors.name} placeholder="John Doe" />
            </FormField>
            <FormField label="Email" required error={createForm.formState.errors.email?.message}>
              <FormInput {...createForm.register('email')} error={!!createForm.formState.errors.email} type="email" placeholder="john@company.com" />
            </FormField>
            <FormField label="Password" required error={createForm.formState.errors.password?.message}>
              <FormInput {...createForm.register('password')} error={!!createForm.formState.errors.password} type="password" placeholder="••••••••" />
            </FormField>
            <FormField label="Role" required error={createForm.formState.errors.role?.message}>
              <FormSelect {...createForm.register('role')} error={!!createForm.formState.errors.role} options={roleOptions} placeholder="Select role" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset() }} submitLabel="Create" isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>

      {/* Edit User Dialog */}
      <DialogForm open={editOpen} onClose={() => { setEditOpen(false); editForm.reset(); setEditingUser(null) }} title="Edit User" subtitle={`Editing ${editingUser?.name ?? ''}`}>
        <form onSubmit={editForm.handleSubmit(onUpdateUser)}>
          <div className="space-y-4">
            <FormField label="Full name" error={editForm.formState.errors.name?.message}>
              <FormInput {...editForm.register('name')} error={!!editForm.formState.errors.name} placeholder="John Doe" />
            </FormField>
            <FormField label="Email" error={editForm.formState.errors.email?.message}>
              <FormInput {...editForm.register('email')} error={!!editForm.formState.errors.email} type="email" placeholder="john@company.com" />
            </FormField>
            <FormField label="Role" error={editForm.formState.errors.role?.message}>
              <FormSelect {...editForm.register('role')} error={!!editForm.formState.errors.role} options={roleOptions} placeholder="Select role" />
            </FormField>
            <FormField label="Status">
              <div className="flex items-center gap-3">
                <input type="checkbox" {...editForm.register('isActive')} />
                <span className="text-sm text-muted-foreground">User is active</span>
              </div>
            </FormField>
          </div>
          <FormActions onCancel={() => { setEditOpen(false); editForm.reset(); setEditingUser(null) }} submitLabel="Update" isSubmitting={editForm.formState.isSubmitting} />
        </form>
      </DialogForm>
    </div>
  )
}
