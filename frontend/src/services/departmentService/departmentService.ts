import baseApi from '@/api/baseApi'

export interface Department {
  id: string
  name: string
  designations: { id: string; name: string }[]
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
