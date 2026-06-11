import baseApi from '@/api/baseApi'

export interface Department {
  id: string
  name: string
  designations: { id: string; name: string }[]
}

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

interface DepartmentListResponse {
  success: boolean
  message: string
  data: Department[]
}

export async function fetchDepartmentsService(): Promise<DepartmentListResponse> {
  const response = await baseApi.get<DepartmentListResponse>('/department')
  return response.data
}

export async function createDepartmentService(payload: { name: string }): Promise<ApiResponse<Department>> {
  const response = await baseApi.post<ApiResponse<Department>>('/department', payload)
  return response.data
}

export async function updateDepartmentService(id: string, payload: { name?: string }): Promise<ApiResponse<Department>> {
  const response = await baseApi.patch<ApiResponse<Department>>(`/department/${id}`, payload)
  return response.data
}

export async function deleteDepartmentService(id: string): Promise<ApiResponse<Department>> {
  const response = await baseApi.delete<ApiResponse<Department>>(`/department/${id}`)
  return response.data
}
