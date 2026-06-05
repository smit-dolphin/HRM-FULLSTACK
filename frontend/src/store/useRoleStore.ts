import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

interface RoleState {
  roles: Role[];
  addRole: (r: Omit<Role, 'id' | 'createdAt'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  removeRole: (id: string) => void;
}

const defaultRoles: Role[] = [
  { id: 'ROLE001', name: 'Super Admin', description: 'Full access to all modules', permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles'], createdAt: '2023-01-01' },
  { id: 'ROLE002', name: 'HR Admin', description: 'Manages employees, leaves, and HR operations', permissions: ['read', 'write', 'manage_employees', 'manage_leaves', 'manage_holidays'], createdAt: '2023-01-01' },
  { id: 'ROLE003', name: 'Project Manager', description: 'Manages projects and tasks', permissions: ['read', 'write', 'manage_projects', 'manage_tasks'], createdAt: '2023-01-01' },
  { id: 'ROLE004', name: 'Employee', description: 'Basic employee access - view only', permissions: ['read', 'submit_leaves', 'log_breaks'], createdAt: '2023-01-01' },
  { id: 'ROLE005', name: 'Team Lead', description: 'Manages team tasks and approvals', permissions: ['read', 'write', 'approve_leaves', 'manage_tasks'], createdAt: '2023-02-15' },
  { id: 'ROLE006', name: 'Finance Manager', description: 'Manages financial operations', permissions: ['read', 'write', 'manage_payroll', 'view_reports'], createdAt: '2023-02-15' },
];

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      roles: defaultRoles,
      addRole: (r) =>
        set((s) => ({
          roles: [...s.roles, { ...r, id: `ROLE${String(Date.now()).slice(-6)}`, createdAt: new Date().toISOString().split('T')[0] }],
        })),
      updateRole: (id, updates) =>
        set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...updates } : r)) })),
      removeRole: (id) => set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),
    }),
    { name: 'role-store' }
  )
);
