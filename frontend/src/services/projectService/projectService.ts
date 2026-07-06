import baseApi from '@/api/baseApi'

export interface Project {
  id: string
  name: string
  description?: string
  status: string
  ownerId: string
  createdAt?: string
  updatedAt?: string
}

export interface ProjectListResponse {
  success: boolean
  message: string
  data: Project[]
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

export interface FetchProjectsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export interface CreateProjectPayload {
  name: string
  description?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
}

export interface UpdateProjectStatusPayload {
  status: string
}

export interface AddProjectMemberPayload {
  employeeId: string
}

function cleanParams(params: FetchProjectsParams) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== '' &&
        value !== undefined &&
        value !== null
    )
  )
}

export async function fetchProjectsService(
  params: FetchProjectsParams = {}
): Promise<ProjectListResponse> {
  const response = await baseApi.get<ProjectListResponse>(
    '/project',
    {
      params: cleanParams(params)
    }
  )

  return response.data
}

export async function fetchProjectByIdService(
  id: string
): Promise<ApiResponse<Project>> {
  const response = await baseApi.get<ApiResponse<Project>>(
    `/project/${id}`
  )

  return response.data
}

export async function createProjectService(
  payload: CreateProjectPayload
): Promise<ApiResponse<Project>> {
  const response = await baseApi.post<ApiResponse<Project>>(
    '/project',
    payload
  )

  return response.data
}

export async function updateProjectService(
  id: string,
  payload: UpdateProjectPayload
): Promise<ApiResponse<Project>> {
  const response = await baseApi.patch<ApiResponse<Project>>(
    `/project/${id}`,
    payload
  )

  return response.data
}

export async function updateProjectStatusService(
  id: string,
  payload: UpdateProjectStatusPayload
): Promise<ApiResponse<Project>> {
  const response = await baseApi.patch<ApiResponse<Project>>(
    `/project/${id}/status`,
    payload
  )

  return response.data
}

export async function addProjectMemberService(
  id: string,
  payload: AddProjectMemberPayload
): Promise<ApiResponse<Project>> {
  const response = await baseApi.post<ApiResponse<Project>>(
    `/project/${id}/members`,
    payload
  )

  return response.data
}