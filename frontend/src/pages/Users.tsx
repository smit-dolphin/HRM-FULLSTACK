import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Download, Plus, ArrowUpDown, MoreVertical } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { exportToExcel } from '@/utils/exportToExcel'
import { DialogForm, FormField, FormInput, FormSelect, FormActions } from '@/components/forms/DialogForm'
import { fetchUsersService, type User } from '@/services/userService/userService'

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

const columnHelper = createColumnHelper<UserRow>()

export function Users() {
  const [data, setData] = React.useState<UserRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)

  const [newName, setNewName] = React.useState('')
  const [newEmail, setNewEmail] = React.useState('')
  const [newRole, setNewRole] = React.useState<'employee' | 'admin' | 'superadmin'>('employee')
  const [newActive, setNewActive] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const loadUsers = async () => {
      try {
        setLoading(true)
        const response = await fetchUsersService(1, 100)
        if (!isMounted) return

        const mappedData: UserRow[] = response.data.map((user: User) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'Active' : 'Inactive',
          createdAt: user.createdAt,
        }))

        setData(mappedData)
      } catch (error) {
        console.error('Failed to fetch users', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUsers()
    return () => { isMounted = false }
  }, [])

  const columns = [
    columnHelper.accessor('id', { header: 'ID', cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
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
        const id = info.row.original.id
        return (
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === id ? null : id)}
              className="p-1 rounded hover:bg-muted"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {openMenuId === id && (
              <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border bg-card p-1 shadow">
                <button className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded">Edit</button>
                <button className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded">Deactivate</button>
                <button className="w-full text-left px-2 py-1 text-sm text-destructive hover:bg-muted rounded">Delete</button>
              </div>
            )}
          </div>
        )
      },
    }),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Manage application users and access.">
        <Button variant="outline" onClick={() => exportToExcel({ data, sheetName: 'Users' })} disabled={!data.length}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </PageHeader>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search users..."
        emptyMessage="No users found."
      />

      <DialogForm open={addOpen} onClose={() => setAddOpen(false)} title="Add User" subtitle="Create a new user account">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const newUser: UserRow = {
              id: String(Date.now()),
              name: newName,
              email: newEmail,
              role: newRole,
              status: newActive ? 'Active' : 'Inactive',
              createdAt: new Date().toISOString(),
            }
            setData((prev) => [newUser, ...prev])
            setAddOpen(false)
            setNewName('')
            setNewEmail('')
            setNewRole('employee')
            setNewActive(true)
          }}
        >
          <div className="space-y-4">
            <FormField label="Full name" required>
              <FormInput value={newName} onChange={(e) => setNewName(e.target.value)} />
            </FormField>
            <FormField label="Email" required>
              <FormInput value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" />
            </FormField>
            <FormField label="Role" required>
              <FormSelect value={newRole} onChange={(e) => setNewRole(e.target.value as any)} options={[{ value: 'employee', label: 'Employee' }, { value: 'admin', label: 'Admin' }, { value: 'superadmin', label: 'Super Admin' }]} />
            </FormField>
            <FormField label="Active">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={newActive} onChange={(e) => setNewActive(e.target.checked)} />
                <span className="text-sm text-muted-foreground">User is active</span>
              </div>
            </FormField>
          </div>
          <FormActions onCancel={() => setAddOpen(false)} submitLabel="Create" />
        </form>
      </DialogForm>
    </div>
  )
}
