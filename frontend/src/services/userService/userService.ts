import baseApi from '@/api/baseApi';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin' | 'superadmin';
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

export async function fetchUsersService(page = 1, limit = 100): Promise<UserListResponse> {
  const response = await baseApi.get<UserListResponse>('/user', {
    params: { page, limit },
  });

  return response.data;
}
