import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

export function ProtectedLayout() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
