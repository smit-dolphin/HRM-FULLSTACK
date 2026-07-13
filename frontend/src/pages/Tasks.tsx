import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { ArrowUpDown, Search, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FormInput, FormSelect } from '@/components/forms/DialogForm'
import { fetchMyTasksService } from '@/services/taskService/taskService'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu'
import { useTaskStore } from '@/store/useTaskStore'
import { activeTaskSessionQueryOptions, usePauseTaskSession, useStartTaskSession } from '@/querryOptions/taskSessionOptions'

type TaskRow = {
    id: string
    name: string
    project: string
    status: string
    priority: string
    createdAt: string
}

const columnHelper = createColumnHelper<TaskRow>()


export default function Tasks() {

    const { currentTask, addTask } = useTaskStore()
    const [query, setQuery] = React.useState({
        page: 1,
        limit: 10,
        search: '',
    })


    const startTask = useStartTaskSession()
    const pauseTask = usePauseTaskSession()
    const activeSessionQuery = useQuery(activeTaskSessionQueryOptions)

    const currentsession=activeSessionQuery.data

    const tasksQuery = useQuery({
        queryKey: ['my-tasks', query],
        queryFn: () => fetchMyTasksService(query),
        placeholderData: p => p,
    })

    const tasks: TaskRow[] =
        tasksQuery.data?.data?.map((task: any) => ({
            id: task.id,
            name: task.name,
            project: task.project?.name ?? '-',
            status: task.status,
            priority: task.priority ?? '-',
            createdAt: task.createdAt,
        })) ?? []

    const meta = tasksQuery.data?.meta
    const loading = tasksQuery.isPending || tasksQuery.isFetching

    const columns = [
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Task <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        }),
        columnHelper.accessor('project', { header: 'Project' }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => <StatusBadge
                label={info.getValue()}
                variant={
                    info.getValue() === 'completed' ? 'success' :
                        info.getValue() === 'running' ? 'info' :
                            info.getValue() === 'paused' ? 'warning' : 'secondary'
                }
            />
        }),
        columnHelper.accessor('priority', { header: 'Priority' }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: (i) => new Date(i.getValue()).toLocaleDateString()
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => {
                // console.log(info.row.original.id ," AND ",currentTask?.id)
                return (
                    
                    <>
                    
                        {(info.row.original.id !== currentTask?.id) || (currentsession?.taskSessionStatus !== 'running')   ? (
                            <button onClick={() => {
                                startTask.mutate(info.row.original.id)
                                 
                                const currenttask = tasksQuery.data?.data.find(
                                    (task) => task.id === info.row.original.id
                                )
                                if (currenttask) {
                                    addTask(currenttask)
                                }
                            }}>
                                <Play className="h-4 w-4 fill-current text-green-600" />
                            </button>
                        ) : (
                            <button onClick={() => {
                                pauseTask.mutate(info.row.original.id)
                            }}>
                                <Pause className="h-4 w-4 fill-current text-amber-600" />
                            </button>
                        )}
                    </>
                )
            },
        }),
    ]

    return (
        <div className="space-y-6">
            <PageHeader title="My Tasks" subtitle="Tasks assigned to you" />


            <DataTable
                data={tasks}
                columns={columns}
                // loading={loading}
                searchable={false}
                emptyMessage="No tasks found."
            />

            {meta && (
                <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        Page {meta.currentPage} of {meta.totalPages}
                    </p>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={meta.currentPage <= 1}
                            onClick={() => setQuery({ ...query, page: meta.currentPage - 1 })}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />Previous
                        </Button>

                        <Button
                            variant="outline"
                            disabled={meta.currentPage >= meta.totalPages}
                            onClick={() => setQuery({ ...query, page: meta.currentPage + 1 })}
                        >
                            Next<ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
