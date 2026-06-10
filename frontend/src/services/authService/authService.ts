import baseApi from "@/api/baseApi"

interface User {
    id: string
    name: string
    email: string
    role: 'employee' | 'admin' | 'superadmin'
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface AuthResponse {
    success: boolean
    message: string
    data: User
}

interface SigninPayload {
    email: string
    password: string
}

export async function signinService(payload: SigninPayload): Promise<AuthResponse> {
    const response = await baseApi.post<AuthResponse>("/auth/signin", payload)
    return response.data
}

export async function signoutService(): Promise<{ success: boolean; message: string }> {
    const response = await baseApi.post("/auth/signout")
    return response.data
}
