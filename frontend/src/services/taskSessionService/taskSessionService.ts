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
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
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