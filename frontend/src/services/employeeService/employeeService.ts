import baseApi from "@/api/baseApi";

export interface Employee {
  id: string;
  userId: string;
  departmentId: string;
  designationId: string;
  isBlocked: boolean;

  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  department?: {
    id: string;
    name: string;
  };
  designation?: {
    id: string;
    name: string;
    departmentId: string;
  };
}

export interface EmployeeListResponse {
  success: boolean;
  message: string;
  data: Employee[];

  meta?: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    itemPerPage: number;
  };
}

export interface CreateEmployeePayload {
  userId: string;
  departmentId: string;
  designationId: string;
}

export interface UpdateEmployeePayload {
  departmentId?: string;
  designationId?: string;
  isBlocked?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Get all employees
 */
export async function fetchEmployeesService(
  page = 1,
  limit = 100
): Promise<EmployeeListResponse> {
  const response = await baseApi.get<EmployeeListResponse>(
    "/employee",
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
}

/**
 * Create employee
 */
export async function createEmployeeService(
  payload: CreateEmployeePayload
): Promise<ApiResponse<Employee>> {
  const response = await baseApi.post<
    ApiResponse<Employee>
  >("/employee", payload);

  return response.data;
}

/**
 * Update employee
 */
export async function updateEmployeeService(
  id: string,
  payload: UpdateEmployeePayload
): Promise<ApiResponse<Employee>> {
  const response = await baseApi.patch<
    ApiResponse<Employee>
  >(`/employee/${id}`, payload);

  return response.data;
}

/**
 * Block / Unblock employee
 */
export async function toggleEmployeeBlockService(
  id: string,
  isBlocked: boolean
): Promise<ApiResponse<Employee>> {
  const response = await baseApi.patch<
    ApiResponse<Employee>
  >(`/employee/${id}/block`, {
    isBlocked,
  });

  return response.data;
}

/**
 * Delete employee
 */
export async function deleteEmployeeService(
  id: string
): Promise<ApiResponse<Employee>> {
  const response = await baseApi.delete<
    ApiResponse<Employee>
  >(`/employee/${id}`);

  return response.data;
}
