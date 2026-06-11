import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageLoader } from '@/components/ui/PageLoader'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'

// Lazy loaded pages
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Users = lazy(() => import('@/pages/Users').then(m => ({ default: m.Users })))
const Employees = lazy(() => import('@/pages/Employees').then(m => ({ default: m.Employees })))
const Leaves = lazy(() => import('@/pages/Leaves').then(m => ({ default: m.Leaves })))
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
                  <Route path="users" element={<Users />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="departments" element={<Departments />} />
                  <Route path="departments/:id" element={<DepartmentDetail />} />
                  <Route path="leaves" element={<Leaves />} />
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
