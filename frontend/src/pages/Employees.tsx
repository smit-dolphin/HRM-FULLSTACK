import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Plus, ArrowUpDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  fetchEmployeesService,
  type Employee,
} from '@/services/employeeService/employeeService';

type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  departmentName: string;
  designationName: string;
  status: 'Active' | 'Blocked';
  createdAt: string;
};

const columnHelper = createColumnHelper<EmployeeRow>();

export function Employees() {
  const [data, setData] = React.useState<EmployeeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  React.useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);

        const response = await fetchEmployeesService();

        const mappedData: EmployeeRow[] = response.data.map(
          (employee: Employee) => ({
            id: employee.id,
            name: employee.user.name,
            email: employee.user.email,
            departmentName: employee.department?.name ?? employee.departmentId,
            designationName: employee.designation?.name ?? employee.designationId,
            status: employee.isBlocked ? 'Blocked' : 'Active',
            createdAt: employee.user.createdAt,
          })
        );

        setData(mappedData);
      } catch (error) {
        console.error('Failed to fetch employees', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => (
        <span className="font-medium">
          {info.getValue()}
        </span>
      ),
    }),

    columnHelper.accessor('name', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === 'asc'
            )
          }
          className="-ml-4 h-8"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('departmentName', {
      header: 'Department',
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('designationName', {
      header: 'Designation',
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status === 'Active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {status}
          </span>
        );
      },
    }),

    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) =>
        new Date(
          info.getValue()
        ).toLocaleDateString(),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filteredRows = table
    .getRowModel()
    .rows.filter((row) =>
      Object.values(row.original).some((value) =>
        String(value)
          .toLowerCase()
          .includes(globalFilter.toLowerCase())
      )
    );

  const exportToExcel = () => {
    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Employees'
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: 'xlsx',
        type: 'array',
      }
    );

    const blob = new Blob(
      [excelBuffer],
      {
        type: 'application/octet-stream',
      }
    );

    saveAs(
      blob,
      `employees_${Date.now()}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Employees
          </h2>

          <p className="text-muted-foreground">
            Manage your organization's employees.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToExcel}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search employees..."
          value={globalFilter}
          onChange={(e) =>
            setGlobalFilter(e.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header) => (
                      <TableHead
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column
                                .columnDef
                                .header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  )}
                </TableRow>
              ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length
                  }
                  className="h-24 text-center"
                >
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : filteredRows.length ? (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  {row
                    .getVisibleCells()
                    .map((cell) => (
                      <TableCell
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column
                            .columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length
                  }
                  className="h-24 text-center"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
