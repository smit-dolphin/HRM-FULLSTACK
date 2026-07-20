import baseApi from '@/api/baseApi'

export interface TaskSession {
  id: string
  taskId: string
  employeeId: string
  taskSessionStatus: 'running' | 'paused' | 'completed'
  startTime: string
  endTime?: string | null
  totalSeconds?: number
  createdAt?: string
  updatedAt?: string
  task?: {
    id: string
    name: string
    projectId: string
    project?: {
      id: string
      name: string
    }
  }
}

export interface TaskSessionTimeSummary {
  totalSeconds: number
  TotalBreaksSeconds: number
  totalElepsedTimeSeconds: number
  currentTaskStatus:"running"|"paused"|"completed"
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export async function getActiveTaskSessionService(): Promise<ApiResponse<TaskSession | null>> {
  const response = await baseApi.get<ApiResponse<TaskSession | null>>(
    '/task-session/active'
  )
  return response.data
}

export async function getActiveSessionsTimeService(): Promise<
  ApiResponse<TaskSessionTimeSummary>
> {
  const response = await baseApi.get<ApiResponse<TaskSessionTimeSummary>>(
    '/task-session/active-sessions-time'
  )

  return response.data
}

export async function startTaskSessionService(
  taskId: string
): Promise<ApiResponse<TaskSession>> {
  const response = await baseApi.post<ApiResponse<TaskSession>>(
    `/task-session/start/${taskId}`
  )
  return response.data
}

export async function pauseTaskSessionService(
  taskId: string
): Promise<ApiResponse<TaskSession>> {
  const response = await baseApi.patch<ApiResponse<TaskSession>>(
    `/task-session/pause/${taskId}`
  )
  return response.data
}

export async function completeTaskSessionService(
  taskId: string
): Promise<ApiResponse<TaskSession>> {
  const response = await baseApi.patch<ApiResponse<TaskSession>>(
    `/task-session/complete/${taskId}`
  )
  return response.data
}