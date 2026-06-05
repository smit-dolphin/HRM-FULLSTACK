import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  designationId: string;
  roleId: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
  salary: number;
  avatar?: string;
}

interface EmployeeState {
  employees: Employee[];
  addEmployee: (e: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
}

const defaultEmployees: Employee[] = [
  { id: 'EMP001', name: 'Jane Doe', email: 'jane@company.com', phone: '+1-555-0101', departmentId: 'DEPT001', designationId: 'DES002', roleId: 'ROLE003', status: 'Active', joinDate: '2021-03-15', salary: 95000 },
  { id: 'EMP002', name: 'John Smith', email: 'john@company.com', phone: '+1-555-0102', departmentId: 'DEPT002', designationId: 'DES004', roleId: 'ROLE004', status: 'On Leave', joinDate: '2020-06-01', salary: 72000 },
  { id: 'EMP003', name: 'Alice Johnson', email: 'alice@company.com', phone: '+1-555-0103', departmentId: 'DEPT003', designationId: 'DES005', roleId: 'ROLE004', status: 'Active', joinDate: '2022-01-10', salary: 68000 },
  { id: 'EMP004', name: 'Bob Brown', email: 'bob@company.com', phone: '+1-555-0104', departmentId: 'DEPT004', designationId: 'DES006', roleId: 'ROLE002', status: 'Active', joinDate: '2019-09-20', salary: 78000 },
  { id: 'EMP005', name: 'Charlie Davis', email: 'charlie@company.com', phone: '+1-555-0105', departmentId: 'DEPT005', designationId: 'DES007', roleId: 'ROLE004', status: 'Inactive', joinDate: '2021-11-05', salary: 82000 },
  { id: 'EMP006', name: 'Diana Prince', email: 'diana@company.com', phone: '+1-555-0106', departmentId: 'DEPT006', designationId: 'DES008', roleId: 'ROLE005', status: 'Active', joinDate: '2020-04-12', salary: 88000 },
  { id: 'EMP007', name: 'Ethan Hunt', email: 'ethan@company.com', phone: '+1-555-0107', departmentId: 'DEPT001', designationId: 'DES001', roleId: 'ROLE004', status: 'Active', joinDate: '2023-02-01', salary: 65000 },
  { id: 'EMP008', name: 'Fiona Green', email: 'fiona@company.com', phone: '+1-555-0108', departmentId: 'DEPT001', designationId: 'DES003', roleId: 'ROLE005', status: 'Active', joinDate: '2018-07-15', salary: 110000 },
];

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employees: defaultEmployees,
      addEmployee: (e) =>
        set((s) => ({
          employees: [...s.employees, { ...e, id: `EMP${String(Date.now()).slice(-6)}` }],
        })),
      updateEmployee: (id, updates) =>
        set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, ...updates } : e)) })),
      removeEmployee: (id) =>
        set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),
    }),
    { name: 'employee-store' }
  )
);
