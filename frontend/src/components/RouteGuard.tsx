import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

type Role = 'superadmin' | 'admin' | 'manager' | 'teamleader' | 'employee'

interface RouteGuardProps {
  roles: Role[]
  children: React.ReactNode
}

export function RouteGuard({ roles, children }: RouteGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user || !roles.includes(user.role as Role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
