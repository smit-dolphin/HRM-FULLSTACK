import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string;
  employeeCount: number;
  createdAt: string;
}

interface DepartmentState {
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  removeDepartment: (id: string) => void;
}

const defaultDepartments: Department[] = [
  { id: 'DEPT001', name: 'Engineering', description: 'Software development and infrastructure', managerId: 'EMP001', employeeCount: 25, createdAt: '2023-01-10' },
  { id: 'DEPT002', name: 'Sales', description: 'Revenue generation and client management', managerId: 'EMP002', employeeCount: 15, createdAt: '2023-01-10' },
  { id: 'DEPT003', name: 'Marketing', description: 'Brand awareness and lead generation', managerId: 'EMP003', employeeCount: 10, createdAt: '2023-02-01' },
  { id: 'DEPT004', name: 'Human Resources', description: 'People operations and talent acquisition', managerId: 'EMP004', employeeCount: 8, createdAt: '2023-01-10' },
  { id: 'DEPT005', name: 'Finance', description: 'Financial planning and accounting', managerId: 'EMP005', employeeCount: 6, createdAt: '2023-01-10' },
  { id: 'DEPT006', name: 'Operations', description: 'Day-to-day business operations', managerId: 'EMP006', employeeCount: 12, createdAt: '2023-03-15' },
];

export const useDepartmentStore = create<DepartmentState>()(
  persist(
    (set) => ({
      departments: defaultDepartments,
      addDepartment: (dept) =>
        set((s) => ({
          departments: [
            ...s.departments,
            { ...dept, id: `DEPT${String(Date.now()).slice(-6)}`, createdAt: new Date().toISOString().split('T')[0] },
          ],
        })),
      updateDepartment: (id, updates) =>
        set((s) => ({ departments: s.departments.map((d) => (d.id === id ? { ...d, ...updates } : d)) })),
      removeDepartment: (id) =>
        set((s) => ({ departments: s.departments.filter((d) => d.id !== id) })),
    }),
    { name: 'department-store' }
  )
);
