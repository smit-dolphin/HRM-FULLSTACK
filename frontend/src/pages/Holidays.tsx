import React from 'react'
import { createColumnHelper, GlobalFaceting } from '@tanstack/react-table'
import { useIsFetching, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Drama, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DialogForm, FormActions, FormField, FormInput } from '@/components/forms/DialogForm'
import { createHolidayService, deleteHolidayService, fetchHolidaysService, updateHolidayService } from '@/services/holidayService/holidayService'
import { fetchHolidaysOption } from '@/querryOptions/holidayOption'

type HolidayRow = {
  id: string
  name: string
  date: string
  day: string
}

type HolidayFormData = {
  name: string
  date: string
}
type UpdateHolidayVars = {
  id: string
  payload: Partial<HolidayFormData>
}
const columnHelper = createColumnHelper<HolidayRow>()

export function Holidays() {
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingHoliday, setEditingHoliday] = React.useState<HolidayRow | null>(null)
  const querryClient = useQueryClient()


  const form = useForm<HolidayFormData>({
    defaultValues: {
      name: '',
      date: '',
    },
  })

  const fetchHolidays = useQuery(fetchHolidaysOption)

  const createHolidayMutation = useMutation({
    mutationFn: createHolidayService,
    onSuccess: () => {
      querryClient.invalidateQueries({
        queryKey: ['holidays']
      })
    }
  })


  const updateHolidayMutation = useMutation({
    mutationFn: ({ id, payload }: UpdateHolidayVars) => updateHolidayService(id, payload),
    onSuccess: () => {
      querryClient.invalidateQueries({
        queryKey: ['holidays'],
      })
    }
  })


  const deleteHolidayMutation = useMutation({
    mutationFn: deleteHolidayService,
    onSuccess: () => {
      querryClient.invalidateQueries({
        queryKey: ['holidays']
      })

    }
  })

  const onSubmit = (data: HolidayFormData) => {
    createHolidayMutation.mutate(data)
    setAddOpen(false)
  }

  const onUpdate = (data: HolidayFormData) => {
    if (!editingHoliday) return
    updateHolidayMutation.mutate({ id: editingHoliday.id, payload: data })
    form.reset({
      name: '',
      date: ''
    })
    setEditOpen(false)
    setEditingHoliday(null)

  }

  const onDelete = (id: string) => {
    deleteHolidayMutation.mutate(id)
  }


  const handleOpenEdit = (row: HolidayRow) => {
    setEditingHoliday(row)
    form.reset({
      name: row.name,
      date: new Date(row.date).toISOString().split('T')[0]
    })
    setEditOpen(true)

  }

  const handleCloseAdd = () => {
    setAddOpen(false)
    form.reset({ name: '', date: '' })
  }

  const handleCloseEdit = () => {
    form.reset({ name: '', date: '' })
    setEditOpen(false)
    setEditingHoliday(null)
  }

  const columns = [
    columnHelper.accessor('name', {
      header: 'Holiday',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor('day', {
      header: 'Day',
      cell: (info) => <StatusBadge label={info.getValue()} variant="info" />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const row = info.row.original
        return (
          <>
            <div className='flex gap-3'>

              <button
                type="button"
                onClick={() => handleOpenEdit(row)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(row.id)}
                className="text-sm font-medium text-primary hover:underline"
              >
                delete
              </button>
            </div>
          </>
        )
      },
    }),
  ]

  const holidays: HolidayRow[] =
    fetchHolidays.data?.data?.map((holiday: any) => ({
      id: holiday.id,
      name: holiday.name,
      date: holiday.date,
      day: new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' }),
    })) || []

  const globalLoading = useIsFetching()
  console.log(globalLoading)

  return (
    <div className="space-y-6">
      <PageHeader title="Holidays" subtitle="View organization holidays from the backend.">
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Holiday
        </Button>
      </PageHeader>

      {globalLoading === 1 && <Drama className="h-12 w-12 animate-spin" />}



      <DataTable
        data={holidays}
        columns={columns}
        loading={fetchHolidays.isLoading}
        searchable={false}
        emptyMessage="No holidays found."
      />

      <DialogForm open={addOpen} onClose={handleCloseAdd} title="Add Holiday" subtitle="Create a new holiday entry">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <FormField label="Holiday name" required>
              <FormInput {...form.register('name')} placeholder="e.g. New Year" />
            </FormField>
            <FormField label="Holiday date" required>
              <FormInput {...form.register('date')} type="date" />
            </FormField>
          </div>
          <FormActions onCancel={handleCloseAdd} submitLabel="Create" />
        </form>
      </DialogForm>

      <DialogForm
        open={editOpen}
        onClose={handleCloseEdit}
        title="Edit Holiday"
        subtitle={`Editing ${editingHoliday?.name ?? ''}`}
      >
        <form onSubmit={form.handleSubmit(onUpdate)}>
          <div className="space-y-4">
            <FormField label="Holiday name">
              <FormInput {...form.register('name')} placeholder="e.g. New Year" />
            </FormField>
            <FormField label="Holiday date">
              <FormInput {...form.register('date')} type="date" />
            </FormField>
          </div>
          <FormActions onCancel={handleCloseEdit} submitLabel="Update" />
        </form>
      </DialogForm>
    </div>
  )
}
