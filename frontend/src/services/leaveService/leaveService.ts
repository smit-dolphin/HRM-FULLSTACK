import baseApi from '@/api/baseApi'

export interface Leave {
  id: string
  employeeId: string
  startDate: string
  endDate: string
  reason: string
  leaveType: { id: string; name: string; isPaid: boolean }
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  actionTakenById?: string
  employee?: {
    id: string
    user: { id: string; name: string; email: string }
  }
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

interface LeaveListResponse {
  success: boolean
  message: string
  data: Leave[]
}

export interface CreateLeavePayload {
  startDate: string
  endDate: string
  reason: string
  leaveTypeId: string
}

export async function fetchAllLeavesService(): Promise<LeaveListResponse> {
  const response = await baseApi.get<LeaveListResponse>('/leave')
  return response.data
}

export async function fetchMyLeavesService(): Promise<LeaveListResponse> {
  const response = await baseApi.get<LeaveListResponse>('/leave/my-leaves')
  return response.data
}

export async function createLeaveService(payload: CreateLeavePayload): Promise<ApiResponse<Leave>> {
  const response = await baseApi.post<ApiResponse<Leave>>('/leave', payload)
  return response.data
}

export async function updateLeaveStatusService(id: string, status: 'approved' | 'rejected'): Promise<ApiResponse<Leave>> {
  const response = await baseApi.patch<ApiResponse<Leave>>(`/leave/${id}?status=${status}`)
  return response.data
}

export async function deleteLeaveService(id: string): Promise<ApiResponse<Leave>> {
  const response = await baseApi.delete<ApiResponse<Leave>>(`/leave/${id}`)
  return response.data
}
