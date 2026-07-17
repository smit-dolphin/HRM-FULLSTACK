import baseApi from '@/api/baseApi'

export interface AttendanceParams {
  type: 'daily' | 'weekly' | 'monthly'
  date?: string
}

export interface WorkReportParams {
  startDate?: string
  endDate?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export async function fetchAttendanceReportService(
  params: AttendanceParams
): Promise<ApiResponse<any>> {
  const response = await baseApi.get<ApiResponse<any>>('/report/attendance/me', {
    params
  })
  return response.data
}

export async function fetchWorkReportService(
  params: WorkReportParams = {}
): Promise<ApiResponse<any>> {
  const response = await baseApi.get<ApiResponse<any>>('/report/work', { params })
  return response.data
}
