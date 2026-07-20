import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarClock, FileText, ShieldCheck, Users, Ban, FolderKanban } from 'lucide-react'
// Adjust this path to your service location

import KpiCard from '@/components/cards/KpiCard'
import DonutChart from '@/components/charts/DonutCharts'
import BarChartCard from '@/components/cards/BarChartCard'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchProjectsDashboardService } from '@/services/dashboards/projectDashboardsServices/projectDashboardServices'

// Mapping chart colors to statuses based on your application theme
const STATUS_COLORS: Record<string, string> = {
    active: "#3b82f6",     // Blue
    completed: "#22c55e",  // Green
    blocked: "#ef4444",    // Red
    on_hold: "#f59e0b",    // Amber
    planning: "#a855f7",   // Purple
    todo: "#64748b",       // Slate
    in_progress: "#06b6d4",// Cyan
    paused: "#f97316",     // Orange
    cancelled: "#334155"   // Dark Slate
};

export const ProjectDashboard = () => {
    // 1. Fetching data using TanStack Query
    const { data: response, isLoading, error } = useQuery({
        queryKey: ['projectDashboard'],
        queryFn: fetchProjectsDashboardService
    });

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Loading dashboard analytics...</div>;
    }

    if (error || !response?.success) {
        return <div className="flex h-64 items-center justify-center text-sm text-red-500">Failed to load dashboard data.</div>;
    }

    const dashboardData = response.data;
    const { kpi, projectStatus, taskStatus, managerProjectStatus, upcomingdeadlines } = dashboardData;

    // 2. Transforming the dynamic live metrics into the KPI layout format
    const overview = [
        { label: 'Total Projects', value: String(kpi.totalProjects), icon: FolderKanban, tone: 'text-zinc-600' },
        { label: 'Active Projects', value: String(kpi.activeProjects), icon: Users, tone: 'text-sky-600' },
        { label: 'Blocked Projects', value: String(kpi.blockedProjects), icon: Ban, tone: 'text-red-600' },
        { label: 'Overdue Projects', value: String(kpi.overdueProjects), icon: CalendarClock, tone: 'text-amber-600' }
    ];

    // 3. Re-formatting status lists into Recharts data structures
    const projectStatusChartData = projectStatus.map(item => ({
        name: item.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: item.count,
        color: STATUS_COLORS[item.status] || "#cbd5e1"
    }));

    const taskStatusChartData = taskStatus.map(item => ({
        name: item.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: item.count,
        color: STATUS_COLORS[item.status] || "#cbd5e1"
    }));

    // 4. Transforming manager distribution stats for the BarChartCard
    const managerChartData = managerProjectStatus.map(manager => ({
        label: manager.manager,
        value: manager.projects
    }));

    return (
        <div className="space-y-6">
            {/* Top KPI Metrics Row */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {overview.map((item, index) => (
                    <KpiCard key={index} item={item} />
                ))}
            </section>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DonutChart
                    title="Project Status Distribution"
                    centerValue={kpi.totalProjects}
                    centerTitle="Total Projects"
                    data={projectStatusChartData}
                />
                <div className="col-span-1 md:col-span-2 space-y-3">
                    
                    <BarChartCard
                        title="Projects Managed per Lead"
                        data={managerChartData}
                    />
                    {/* Upcoming Alerts Board */}
                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-medium">Critical Upcoming Deadlines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingdeadlines.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4">No critical deadlines looming within the alert window.</p>
                                ) : (
                                    <div className="divide-y divide-border border-t border-b">
                                        {upcomingdeadlines.map((project) => (
                                            <div key={project.id} className="flex items-center justify-between py-3">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-foreground">{project.name}</h4>
                                                    {project.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground mb-1 capitalize">
                                                        {project.status.replace('_', ' ')}
                                                    </span>
                                                    <p className="text-xs text-amber-600 font-medium">
                                                        Due: {new Date(project.deadline).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    
                </div>

                <DonutChart
                    title="Task Breakdown Status"
                    centerValue={taskStatus.reduce((sum, item) => sum + item.count, 0)}
                    centerTitle="Total Tasks"
                    data={taskStatusChartData}
                />

            </div>

        </div>
    )
}