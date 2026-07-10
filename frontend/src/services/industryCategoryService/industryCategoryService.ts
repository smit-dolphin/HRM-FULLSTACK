import baseApi from '@/api/baseApi'

export interface IndustryCategory {
  id: string
  name: string
  createdAt?: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  statusCode?: number
  message: string
  data: T
}

interface IndustryCategoryListResponse {
  success: boolean
  statusCode?: number
  message: string
  data: IndustryCategory[]
}

export async function fetchIndustryCategoriesService(): Promise<IndustryCategoryListResponse> {
  const response = await baseApi.get<IndustryCategoryListResponse>('/admin/industry-categories')
  return response.data
}

export async function createIndustryCategoryService(payload: { name: string }): Promise<ApiResponse<IndustryCategory>> {
  const response = await baseApi.post<ApiResponse<IndustryCategory>>('/admin/industry-categories', payload)
  return response.data
}

export async function updateIndustryCategoryService(id: string, payload: { name: string }): Promise<ApiResponse<IndustryCategory>> {
  const response = await baseApi.put<ApiResponse<IndustryCategory>>(`/admin/industry-categories/${id}`, payload)
  return response.data
}

export async function deleteIndustryCategoryService(id: string): Promise<ApiResponse<null>> {
  const response = await baseApi.delete<ApiResponse<null>>(`/admin/industry-categories/${id}`)
  return response.data
}
