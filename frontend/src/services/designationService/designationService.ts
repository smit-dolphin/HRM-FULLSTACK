import baseApi from '@/api/baseApi'

export interface Designation {
  id: string
  name: string
  departmentId: string
  department?: { id: string; name: string }
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
