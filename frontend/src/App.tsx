import { Children, lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageLoader } from '@/components/ui/PageLoader'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { RouteGuard } from '@/components/RouteGuard'


import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider
} from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import Tasks from './pages/Tasks'





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
const RolePermission = lazy(() => import('@/pages/RolePermission').then(m => ({ default: m.RolePermission })))
const Holidays = lazy(() => import('@/pages/Holidays').then(m => ({ default: m.Holidays })))
const KanbanBoard = lazy(() => import('@/pages/KanbanBoard').then(m => ({ default: m.KanbanBoard })))
const Projects = lazy(() => import('@/pages/Projects').then(m => ({ default: m.Projects })))


export interface applayoutprop {
  children: ReactNode
}

const MainAppLayout = ({ children }: applayoutprop) => {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster richColors position="top-right" />
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

const rootRoute = createRootRoute({
  component: () => (
    <MainAppLayout>
      <div className="flex-1">
        <Outlet />
      </div>
    </MainAppLayout>
  ),
})


const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected', // changed from path: '/' to id for layout route
  component: ProtectedLayout,
})

const appLayoutRoute = createRoute({
  getParentRoute: () => protectedRoute,
  id: "app-layout",
  component: AppLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: Dashboard,
})

// ---------------- Users ----------------

const usersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "users",
  component: () => <RouteGuard permission="user:view"><Users /></RouteGuard>,
})

// ---------------- Employees ----------------

const employeesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "employees",
  component: () => <RouteGuard permission="employee:view"><Employees /></RouteGuard>,
})

// ---------------- Departments ----------------

const departmentsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "departments",
  component: () => <RouteGuard permission="department:view"><Departments /></RouteGuard>,
})

export const departmentDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "departments/$id",
  component: () => <RouteGuard permission="department:view"><DepartmentDetail /></RouteGuard>,
})

// ---------------- Permissions ----------------

export const rolePermissionRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "permissions/$id",
  component: () => <RouteGuard permission="department:view"><RolePermission /></RouteGuard>,
})

// ---------------- Leaves ----------------

const leavesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "leaves",
  component: () => <RouteGuard permission="leave:request:view_own"><LeaveDashboard /></RouteGuard>,
})

// ---------------- Holidays ----------------

const holidaysRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "holidays",
  component: () => <RouteGuard permission="holiday:view"><Holidays /></RouteGuard>,
})

// ---------------- Kanban & Projects ----------------

const kanbanRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "kanban",
  component: KanbanBoard,
})

const projectsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "projects",
  component: Projects,
})

// ---------------- Settings ----------------

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "settings",
  component: () => <RouteGuard permission="leave:type:edit"><Settings /></RouteGuard>,
})

const taskRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "task",
  component: () =><Tasks />,
})

// ---------------- Route Tree ----------------

const routeTree = rootRoute.addChildren([
  loginRoute,

  protectedRoute.addChildren([
    appLayoutRoute.addChildren([
      dashboardRoute,
      usersRoute,
      employeesRoute,
      departmentsRoute,
      departmentDetailRoute,
      rolePermissionRoute,
      leavesRoute,
      holidaysRoute,
      kanbanRoute,
      projectsRoute,
      settingsRoute,
      taskRoute
    ]),
  ]),
])

const router= createRouter({
  routeTree,
   
  
})

function App() {
  return (
    // <ErrorBoundary>
    //   <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    //     <Toaster richColors position="top-right" />
    //     <BrowserRouter>
    //       <Suspense fallback={<PageLoader />}>
    //         <Routes>
    //           <Route path="/login" element={<LoginPage />} />

    //           <Route element={<ProtectedLayout />}>
    //             <Route element={<AppLayout />}>
    //               <Route index element={<Dashboard />} />
    //               <Route path="users" element={<RouteGuard permission="user:view"><Users /></RouteGuard>} />
    //               <Route path="employees" element={<RouteGuard permission="employee:view"><Employees /></RouteGuard>} />
    //               <Route path="departments" element={<RouteGuard permission="department:view"><Departments /></RouteGuard>} />
    //               <Route path="departments/:id" element={<RouteGuard permission="department:view"><DepartmentDetail /></RouteGuard>} />
    //               <Route path="permissions/:id" element={<RouteGuard permission="department:view"><RolePermission /></RouteGuard>} />
    //               <Route path="leaves" element={<RouteGuard permission="leave:request:view_own"><LeaveDashboard /></RouteGuard>} />
    //               <Route path="holidays" element={<RouteGuard permission="holiday:view"><Holidays /></RouteGuard>} />
    //               <Route path="kanban" element={<KanbanBoard />} />
    //               <Route path="projects" element={<Projects />} />
    //               <Route path="settings" element={<RouteGuard permission="leave:type:edit"><Settings /></RouteGuard>} />
    //             </Route>
    //           </Route>

    //           <Route path="*" element={<Navigate to="/login" replace />} />
    //         </Routes>
    //       </Suspense>
    //     </BrowserRouter>
    //   </ThemeProvider>
    // </ErrorBoundary>
    <RouterProvider router={router}/>
  )
}

export default App
