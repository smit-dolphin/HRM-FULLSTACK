import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
// import { useNavigate } from 'react-router-dom'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Download, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { apiErrorDataShape } from '@/types/sharedTypes'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { exportToExcel } from '@/utils/exportToExcel'
import { DialogForm, FormField, FormInput, FormSelect, FormActions } from '@/components/forms/DialogForm'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/store/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import {
  fetchUsersService,
  createUserService,
  updateUserService,
  deleteUserService,
  deactivateUserService,
  type User,
  type FetchUsersParams,
} from '@/services/userService/userService'
import { createUserSchema, updateUserSchema, type CreateUserFormData, type UpdateUserFormData } from '@/schemas/user.schema'

type UserRow = {
  id: string
  name: string
  email: string
  role: 'employee' | 'admin' | 'manager' | 'teamleader' | 'superadmin'
  isActive: boolean
  status: 'Active' | 'Inactive'
  createdAt: string
}

const columnHelper = createColumnHelper<UserRow>()

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'employee', label: 'Employee' },
  { value: 'teamleader', label: 'Team Leader' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

const limitOptions = [
  { value: '5', label: '5 items' },
  { value: '10', label: '10 items' },
  { value: '20', label: '20 items' },
]

export function Users() {
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<UserRow | null>(null)
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  const [query, setQuery] = React.useState<FetchUsersParams>({
    page: 1,
    limit: 5,
    search: '',
    role: '',
    isActive: '',
    from: '',
    to: '',
  })

  const createForm = useForm<CreateUserFormData>({ resolver: zodResolver(createUserSchema) })
  const editForm = useForm<UpdateUserFormData>({ resolver: zodResolver(updateUserSchema) })

  const usersQuery = useQuery({
    queryKey: ['users', query],
    queryFn: () => fetchUsersService(query),
    placeholderData: (previousData) => previousData,
  })

  const users = usersQuery.data?.data.map((user: User): UserRow => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    status: user.isActive ? "Active" : "Inactive",
    createdAt: user.createdAt,
  })) ?? []

  const meta = usersQuery.data?.meta ?? null
  const loading = usersQuery.isPending || usersQuery.isFetching

  const setQueryValue = (key: keyof FetchUsersParams, value: string | number | undefined) => {
    setQuery((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? Number(value) || 1 : 1,
    }))
  }

  const clearFilter = (key: keyof FetchUsersParams) => {
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
      role: '',
      isActive: '',
      from: '',
      to: '',
    }))
  }

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
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to create user')
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
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      const res = await deactivateUserService(id)
      if (res.success) {
        toast.success(res.message)
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to deactivate user')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteUserService(id)
      if (res.success) {
        toast.success(res.message)
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to delete user')
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
        if (hasPermission('user:edit')) items.push({
          label: 'Permissions', onClick: () => navigate({
            to: "/permissions/$id",
            params: {
              id: row.id,
            },
          })
        })
        if (hasPermission('user:delete')) items.push({ label: 'Deactivate', onClick: () => handleDeactivate(row.id) })
        if (hasPermission('user:delete')) items.push({ label: 'Delete', onClick: () => handleDelete(row.id), variant: 'danger' })
        if (!items.length) return null
        return <ActionMenu items={items} />
      },
    }),
  ]

  const totalPages = meta?.totalPages ?? 1
  const currentPage = meta?.currentPage ?? query.page ?? 1
  const activeFilterCount = ['search', 'role', 'isActive', 'from', 'to'].filter((key) => {
    const value = query[key as keyof FetchUsersParams]
    return value !== '' && value !== undefined && value !== null
  }).length

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Manage application users and access.">
        <Button variant="outline" onClick={() => exportToExcel({ data: users, sheetName: 'Users' })} disabled={!users.length}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        {hasPermission('user:create') && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        )}
      </PageHeader>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <FormInput
              value={query.search ?? ''}
              onChange={(e) => setQueryValue('search', e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-9"
            />
          </div>

          <Popover>
            <PopoverTrigger>
              <Button variant="outline" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Advanced filters</p>
                    <p className="text-xs text-muted-foreground">Refine the list without crowding the page</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} disabled={activeFilterCount === 0}>
                    Clear all
                  </Button>
                </div>

                <div className="space-y-3">
                  <FormSelect
                    value={query.role ?? ''}
                    onChange={(e) => setQueryValue('role', e.target.value)}
                    options={roleOptions}
                    placeholder="Role"
                  />
                  <FormSelect
                    value={query.isActive ?? ''}
                    onChange={(e) => setQueryValue('isActive', e.target.value as '' | 'true' | 'false')}
                    options={statusOptions}
                    placeholder="Status"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      type="date"
                      value={query.from ?? ''}
                      onChange={(e) => setQueryValue('from', e.target.value)}
                    />
                    <FormInput
                      type="date"
                      value={query.to ?? ''}
                      onChange={(e) => setQueryValue('to', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {query.role && (
                    <button type="button" onClick={() => clearFilter('role')} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs hover:bg-accent">
                      Role: {query.role} <X className="h-3 w-3" />
                    </button>
                  )}
                  {query.isActive && (
                    <button type="button" onClick={() => clearFilter('isActive')} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs hover:bg-accent">
                      Status: {query.isActive === 'true' ? 'Active' : 'Inactive'} <X className="h-3 w-3" />
                    </button>
                  )}
                  {query.from && (
                    <button type="button" onClick={() => clearFilter('from')} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs hover:bg-accent">
                      From: {query.from} <X className="h-3 w-3" />
                    </button>
                  )}
                  {query.to && (
                    <button type="button" onClick={() => clearFilter('to')} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs hover:bg-accent">
                      To: {query.to} <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        searchable={false}
        emptyMessage="No users found."
      />

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page</span>
          <div className="min-w-35">
            <FormSelect
              value={String(query.limit ?? 5)}
              onChange={(e) => setQueryValue('limit', Number(e.target.value))}
              options={limitOptions}
              placeholder="Items per page"
            />
          </div>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => setQuery((prev) => ({ ...prev, page: Math.max(1, currentPage - 1) }))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setQuery((prev) => ({ ...prev, page: Math.min(totalPages, currentPage + 1) }))}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

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
              <FormSelect {...createForm.register('role')} error={!!createForm.formState.errors.role} options={roleOptions.filter((r) => r.value)} placeholder="Select role" />
            </FormField>
          </div>
          <FormActions onCancel={() => { setAddOpen(false); createForm.reset() }} submitLabel="Create" isSubmitting={createForm.formState.isSubmitting} />
        </form>
      </DialogForm>

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
              <FormSelect {...editForm.register('role')} error={!!editForm.formState.errors.role} options={roleOptions.filter((r) => r.value)} placeholder="Select role" />
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
