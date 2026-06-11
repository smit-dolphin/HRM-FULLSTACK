import baseApi from '@/api/baseApi';

type Role = 'employee' | 'admin' | 'manager' | 'teamleader' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: User[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    itemPerPage: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
}

export async function fetchUsersService(page = 1, limit = 100): Promise<UserListResponse> {
  const response = await baseApi.get<UserListResponse>('/user', { params: { page, limit } });
  return response.data;
}

export async function createUserService(payload: CreateUserPayload): Promise<ApiResponse<User>> {
  const response = await baseApi.post<ApiResponse<User>>('/user', payload);
  return response.data;
}

export async function updateUserService(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
  const response = await baseApi.patch<ApiResponse<User>>(`/user/${id}`, payload);
  return response.data;
}

export async function deleteUserService(id: string): Promise<ApiResponse<User>> {
  const response = await baseApi.delete<ApiResponse<User>>(`/user/${id}`);
  return response.data;
}

export async function deactivateUserService(id: string): Promise<ApiResponse<User>> {
  const response = await baseApi.patch<ApiResponse<User>>(`/user/${id}/deactivate`);
  return response.data;
}
