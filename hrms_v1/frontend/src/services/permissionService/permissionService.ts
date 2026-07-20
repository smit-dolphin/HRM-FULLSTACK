import baseApi from '@/api/baseApi'

export interface PermissionItem {
  key: string
  label: string
}

export type PermissionGroups = Record<string, PermissionItem[]>

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface UserPermission {
  id: string
  userId: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export async function fetchAvailablePermissionsService(): Promise<ApiResponse<PermissionGroups>> {
  const response = await baseApi.get<ApiResponse<PermissionGroups>>('/permission/permissions')
  return response.data
}

export async function fetchUserPermissionService(userId: string): Promise<ApiResponse<UserPermission | null>> {
  const response = await baseApi.get<ApiResponse<UserPermission | null>>(`/permission/${userId}`)
  return response.data
}

export async function updateUserPermissionService(userId: string, permissions: string[]): Promise<ApiResponse<UserPermission>> {
  const response = await baseApi.patch<ApiResponse<UserPermission>>(`/permission/${userId}`, { permissions })
  return response.data
}
