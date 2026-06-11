import baseApi from '@/api/baseApi'

export interface Designation {
  id: string
  name: string
  departmentId: string
  department?: { id: string; name: string }
}

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

interface DesignationListResponse {
  success: boolean
  message: string
  data: Designation[]
}

export async function fetchDesignationsService(): Promise<DesignationListResponse> {
  const response = await baseApi.get<DesignationListResponse>('/designation')
  return response.data
}

export async function createDesignationService(payload: { name: string; departmentId: string }): Promise<ApiResponse<Designation>> {
  const response = await baseApi.post<ApiResponse<Designation>>('/designation', payload)
  return response.data
}

export async function updateDesignationService(id: string, payload: { name?: string; departmentId?: string }): Promise<ApiResponse<Designation>> {
  const response = await baseApi.patch<ApiResponse<Designation>>(`/designation/${id}`, payload)
  return response.data
}

export async function deleteDesignationService(id: string): Promise<ApiResponse<Designation>> {
  const response = await baseApi.delete<ApiResponse<Designation>>(`/designation/${id}`)
  return response.data
}
