import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Download, Plus, ArrowUpDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex items-center py-4">
        <Input placeholder="Search users..." value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm" />
      </div>

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
