import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

interface RouteGuardProps {
  permission: string
  children: React.ReactNode
}

export function RouteGuard({ permission, children }: RouteGuardProps) {
  const { hasPermission } = useAuthStore()

  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
