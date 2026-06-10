import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Download, Plus, ArrowUpDown } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable } from '@/components/ui/DataTable'
import { exportToExcel } from '@/utils/exportToExcel'
import { fetchEmployeesService, type Employee } from '@/services/employeeService/employeeService'

type EmployeeRow = {
  id: string
  name: string
  email: string
  departmentName: string
  designationName: string
  status: 'Active' | 'Blocked'
  createdAt: string
}

const columnHelper = createColumnHelper<EmployeeRow>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
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
]

export function Employees() {
  const [data, setData] = React.useState<EmployeeRow[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const loadEmployees = async () => {
      try {
        setLoading(true)
        const response = await fetchEmployeesService()

        if (!isMounted) return

        const mappedData: EmployeeRow[] = response.data.map((emp: Employee) => ({
          id: emp.id,
          name: emp.user.name,
          email: emp.user.email,
          departmentName: emp.department?.name ?? emp.departmentId,
          designationName: emp.designation?.name ?? emp.designationId,
          status: emp.isBlocked ? 'Blocked' : 'Active',
          createdAt: emp.user.createdAt,
        }))

        setData(mappedData)
      } catch (error) {
        console.error('Failed to fetch employees', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadEmployees()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" subtitle="Manage your organization's employees.">
        <Button variant="outline" onClick={() => exportToExcel({ data, sheetName: 'Employees' })} disabled={!data.length}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button>
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
    </div>
  )
}
