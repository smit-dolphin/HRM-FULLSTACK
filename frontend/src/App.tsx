import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageLoader } from '@/components/ui/PageLoader'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { RouteGuard } from '@/components/RouteGuard'

// Lazy loaded pages
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Users = lazy(() => import('@/pages/Users').then(m => ({ default: m.Users })))
const Employees = lazy(() => import('@/pages/Employees').then(m => ({ default: m.Employees })))
const LeaveDashboard = lazy(() => import('@/pages/LeaveDashboard').then(m => ({ default: m.LeaveDashboard })))
const Leaves = lazy(() => import('@/pages/Leaves').then(m => ({ default: m.Leaves })))
const ManageLeaves = lazy(() => import('@/pages/ManageLeaves').then(m => ({ default: m.ManageLeaves })))
const Departments = lazy(() => import('@/pages/Departments').then(m => ({ default: m.Departments })))
const DepartmentDetail = lazy(() => import('@/pages/DepartmentDetail').then(m => ({ default: m.DepartmentDetail })))
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })))
const RolePermission=lazy(() => import('@/pages/RolePermission').then(m => ({ default: m.RolePermission })))
const Holidays = lazy(() => import('@/pages/Holidays').then(m => ({ default: m.Holidays })))
const KanbanBoard = lazy(() => import('@/pages/KanbanBoard').then(m => ({ default: m.KanbanBoard })))

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedLayout />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="users" element={<RouteGuard permission="user:view"><Users /></RouteGuard>} />
                  <Route path="employees" element={<RouteGuard permission="employee:view"><Employees /></RouteGuard>} />
                  <Route path="departments" element={<RouteGuard permission="department:view"><Departments /></RouteGuard>} />
                  <Route path="departments/:id" element={<RouteGuard permission="department:view"><DepartmentDetail /></RouteGuard>} />
                  <Route path="permissions/:id" element={<RouteGuard permission="department:view"><RolePermission /></RouteGuard>} />
                  <Route path="leaves" element={<RouteGuard permission="leave:request:view_own"><LeaveDashboard /></RouteGuard>} />
                  <Route path="holidays" element={<RouteGuard permission="holiday:view"><Holidays /></RouteGuard>} />
                  <Route path="kanban" element={<KanbanBoard />} />
                  <Route path="settings" element={<RouteGuard permission="leave:type:edit"><Settings /></RouteGuard>} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
