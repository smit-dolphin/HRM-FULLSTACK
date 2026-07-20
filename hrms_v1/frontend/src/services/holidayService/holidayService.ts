import baseApi from '@/api/baseApi'

export interface Holiday {
  id: string
  name: string
  date: string
  createdAt?: string
  updatedAt?: string
}

export interface HolidayListResponse {
  success: boolean
  message: string
  data: Holiday[]
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

export interface FetchHolidaysParams {
  page?: number
  limit?: number
  search?: string
  from?: string
  to?: string
}

export interface CreateHolidayPayload {
  name: string
  date: string
}

function cleanParams(params: FetchHolidaysParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  )
}

export async function fetchHolidaysService(params: FetchHolidaysParams = {}): Promise<HolidayListResponse> {
  const response = await baseApi.get<HolidayListResponse>('/holiday', { params: cleanParams(params) })
  return response.data
}

export async function createHolidayService(payload: CreateHolidayPayload): Promise<ApiResponse<Holiday>> {
  const response = await baseApi.post<ApiResponse<Holiday>>('/holiday', payload)
  return response.data
}

export async function updateHolidayService(id: string, payload: Partial<CreateHolidayPayload>): Promise<ApiResponse<Holiday>> {
  const response = await baseApi.patch<ApiResponse<Holiday>>(`/holiday/${id}`, payload)
  return response.data
}

export async function deleteHolidayService(id: string): Promise<ApiResponse<Holiday>> {
  const response = await baseApi.delete<ApiResponse<Holiday>>(`/holiday/${id}`)
  return response.data
}
