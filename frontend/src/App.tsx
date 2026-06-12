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
const Leaves = lazy(() => import('@/pages/Leaves').then(m => ({ default: m.Leaves })))
const ManageLeaves = lazy(() => import('@/pages/ManageLeaves').then(m => ({ default: m.ManageLeaves })))
const Departments = lazy(() => import('@/pages/Departments').then(m => ({ default: m.Departments })))
const DepartmentDetail = lazy(() => import('@/pages/DepartmentDetail').then(m => ({ default: m.DepartmentDetail })))

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
                  <Route path="leaves" element={<RouteGuard permission="leave:view"><Leaves /></RouteGuard>} />
                  <Route path="leaves/manage" element={<RouteGuard permission="leave:approve"><ManageLeaves /></RouteGuard>} />
                  <Route path="settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
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
