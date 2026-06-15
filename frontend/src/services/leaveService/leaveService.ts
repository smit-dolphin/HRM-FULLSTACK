import baseApi from '@/api/baseApi'

export interface LeaveType {
  id: string
  name: string
  description?: string
  defaultDays: number
  isPaid: boolean
  requiresApproval: boolean
}

export interface Leave {
  id: string
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  leaveType?: LeaveType
  employee?: {
    id: string
    user: { id: string; name: string; email: string }
  }
  histories?: { action: string; comment?: string; actionBy: { user: { name: string } }; createdAt: string }[]
  createdAt: string
  updatedAt: string
}

export interface LeaveBalance {
  id: string
  employeeId: string
  leaveTypeId: string
  year: number
  allocated: number
  used: number
  pending: number
  leaveType?: LeaveType
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

// Leave requests
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

export async function cancelLeaveService(id: string): Promise<ApiResponse<Leave>> {
  const response = await baseApi.post<ApiResponse<Leave>>(`/leave/${id}/cancel`)
  return response.data
}

// Leave types
export async function fetchLeaveTypesService(): Promise<ApiResponse<LeaveType[]>> {
  const response = await baseApi.get<ApiResponse<LeaveType[]>>('/leave/type')
  return response.data
}

// Leave balance
export async function fetchMyBalanceService(year?: number): Promise<ApiResponse<LeaveBalance[]>> {
  const response = await baseApi.get<ApiResponse<LeaveBalance[]>>('/leave/balance/my', { params: { year } })
  return response.data
}

export async function fetchBalanceByEmployeeService(employeeId: string, year?: number): Promise<ApiResponse<LeaveBalance[]>> {
  const response = await baseApi.get<ApiResponse<LeaveBalance[]>>(`/leave/balance/${employeeId}`, { params: { year } })
  return response.data
}

// Leave type CRUD
export async function createLeaveTypeService(payload: { name: string; description?: string; defaultDays: number; isPaid: boolean; requiresApproval: boolean }): Promise<ApiResponse<LeaveType>> {
  const response = await baseApi.post<ApiResponse<LeaveType>>('/leave/type', payload)
  return response.data
}

export async function updateLeaveTypeService(id: string, payload: Partial<{ name: string; description: string; defaultDays: number; isPaid: boolean; requiresApproval: boolean }>): Promise<ApiResponse<LeaveType>> {
  const response = await baseApi.patch<ApiResponse<LeaveType>>(`/leave/type/${id}`, payload)
  return response.data
}

export async function deleteLeaveTypeService(id: string): Promise<ApiResponse<LeaveType>> {
  const response = await baseApi.delete<ApiResponse<LeaveType>>(`/leave/type/${id}`)
  return response.data
}

// Bulk allocate
export async function bulkAllocateService(year?: number): Promise<ApiResponse<{ created: number; skipped: number; year: number }>> {
  const response = await baseApi.post<ApiResponse<{ created: number; skipped: number; year: number }>>('/leave/balance/allocate', { year })
  return response.data
}
