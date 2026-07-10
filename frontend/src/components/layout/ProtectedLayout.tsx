// import { Navigate, Outlet } from "react-router-dom"
import { Navigate, Outlet } from '@tanstack/react-router'
import { useAuthStore } from "@/store/useAuthStore"

export function ProtectedLayout() {
  const isAuthenticated = useAuthStore(
  state => state.isAuthenticated
);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
