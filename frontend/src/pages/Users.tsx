import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Download, Plus, ArrowUpDown, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogForm, FormField, FormInput, FormSelect, FormActions } from '@/components/forms/DialogForm';
import Popover, { PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { fetchUsersService, type User } from '@/services/userService/userService';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
};

const columnHelper = createColumnHelper<UserRow>();

export function Users() {
  const [data, setData] = React.useState<UserRow[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [addOpen, setAddOpen] = React.useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<'employee' | 'admin' | 'superadmin'>('employee');
  const [newActive, setNewActive] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await fetchUsersService(1, 100);

        if (!isMounted) return;

        const mappedData = response.data.map((user: User) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: (user.isActive ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
          createdAt: user.createdAt,
        }));

        setData(mappedData);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

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
        const status = info.getValue();
        return (
          <span
            className={`inline-flex min-w-[76px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              status === 'Active'
                ? 'bg-emerald-200/80 text-emerald-600'
                : 'bg-rose-200/80 text-rose-500'
            }`}
          >
            {status}
          </span>
        );
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
        const row = info.row;
        const id = row.original.id;
        return (
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === id ? null : id)}
              className="p-1 rounded hover:bg-muted"
              aria-label="Open actions"
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
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filteredRows = table.getRowModel().rows.filter((row) =>
    Object.values(row.original).some((value) => String(value).toLowerCase().includes(globalFilter.toLowerCase())),
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `users_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage application users and access.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} disabled={!data.length}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex items-center py-4 gap-2">
        <Input placeholder="Search users..." value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm" />
        <div className="ml-auto">
          <Popover>
            <PopoverTrigger>
              <Button variant="outline">Filter</Button>
            </PopoverTrigger>
            <PopoverContent>
              <form onSubmit={(e) => { e.preventDefault(); }}>
                <div className="space-y-3">
                  <FormField label="Role">
                    <FormSelect options={[{ value: '', label: 'Any' }, { value: 'employee', label: 'Employee' }, { value: 'admin', label: 'Admin' }, { value: 'superadmin', label: 'Super Admin' }]} />
                  </FormField>
                  <FormField label="Status">
                    <FormSelect options={[{ value: '', label: 'Any' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
                  </FormField>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={() => { /* reset logic if needed */ }}>Reset</Button>
                    <Button onClick={() => { /* apply logic */ }}>Apply</Button>
                  </div>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DialogForm open={addOpen} onClose={() => setAddOpen(false)} title="Add User" subtitle="Create a new user account">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newUser: UserRow = {
              id: String(Date.now()),
              name: newName,
              email: newEmail,
              role: newRole,
              status: newActive ? 'Active' : 'Inactive',
              createdAt: new Date().toISOString(),
            };
            setData((prev) => [newUser, ...prev]);
            setAddOpen(false);
            setNewName('');
            setNewEmail('');
            setNewRole('employee');
            setNewActive(true);
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

      

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredRows.length ? (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
