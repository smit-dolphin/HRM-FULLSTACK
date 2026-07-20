import baseApi from "@/api/baseApi"

export interface DashboardKPI {
  activeProjects: number
  blockedProjects: number
  overdueProjects: number
  completedProjects: number
  totalProjects: number
}

export interface StatusDistribution {
  status: string
  count: number
}

export interface ManagerProjectStatus {
  managerId: string
  manager: string
  projects: number
  tasks: number
}

export interface UpcomingDeadlineProject {
  id: string
  name: string
  description?: string
  deadline: string
  status: string
  ownerUserId: string
  managerId: string | null
  createdAt: string
  updatedAt: string
}

export interface DashboardDataPayload {
  kpi: DashboardKPI
  projectStatus: StatusDistribution[]
  taskStatus: StatusDistribution[]
  managerProjectStatus: ManagerProjectStatus[]
  upcomingdeadlines: UpcomingDeadlineProject[]
}

export interface DashboardResponse {
  success: boolean
  message: string
  data: DashboardDataPayload
}


export async function fetchProjectsDashboardService(): Promise<DashboardResponse> {
  const response = await baseApi.get<DashboardResponse>(
    '/dashboard/projects' // Appended cleanly to baseApi's configured host context
  )

  return response.data
}