import baseApi from '@/api/baseApi'

export interface Task {
  id: string
  name: string
  description?: string
  status: string

  projectId: string
  ownerId: string

  createdAt?: string
  updatedAt?: string
}

export interface TaskListResponse {
  success: boolean
  message: string
  data: Task[]
  meta?: {
    totalData: number
    totalPages: number
    currentPage: number
    itemPerPage: number
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface FetchTasksParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  projectId?: string
  ownerId?: string
}

export interface CreateTaskPayload {
  name: string
  description?: string
  projectId: string
  ownerId: string
}

export interface UpdateTaskPayload {
  name?: string
  description?: string
  projectId?: string
  ownerId?: string
}

export interface UpdateTaskStatusPayload {
  status: string
}

function cleanParams(params: FetchTasksParams) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== '' &&
        value !== undefined &&
        value !== null
    )
  )
}

export async function fetchTasksService(
  params: FetchTasksParams = {}
): Promise<TaskListResponse> {
  const response = await baseApi.get<TaskListResponse>(
    '/task',
    {
      params: cleanParams(params)
    }
  )

  return response.data
}

export async function fetchTaskByIdService(
  id: string
): Promise<ApiResponse<Task>> {
  const response = await baseApi.get<ApiResponse<Task>>(
    `/task/${id}`
  )

  return response.data
}

export async function createTaskService(
  payload: CreateTaskPayload
): Promise<ApiResponse<Task>> {
  const response = await baseApi.post<ApiResponse<Task>>(
    '/task',
    payload
  )

  return response.data
}

export async function updateTaskService(
  id: string,
  payload: UpdateTaskPayload
): Promise<ApiResponse<Task>> {
  const response = await baseApi.patch<ApiResponse<Task>>(
    `/task/${id}`,
    payload
  )

  return response.data
}

export async function updateTaskStatusService(
  id: string,
  payload: UpdateTaskStatusPayload
): Promise<ApiResponse<Task>> {
  const response = await baseApi.patch<ApiResponse<Task>>(
    `/task/${id}/status`,
    payload
  )

  return response.data
}

export async function deleteTaskService(
  id: string
): Promise<ApiResponse<Task>> {
  const response = await baseApi.delete<ApiResponse<Task>>(
    `/task/${id}`
  )

  return response.data
}