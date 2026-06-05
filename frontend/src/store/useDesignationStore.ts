import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Designation {
  id: string;
  title: string;
  departmentId: string;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager' | 'Director' | 'VP' | 'C-Level';
  description: string;
  createdAt: string;
}

interface DesignationState {
  designations: Designation[];
  addDesignation: (d: Omit<Designation, 'id' | 'createdAt'>) => void;
  updateDesignation: (id: string, updates: Partial<Designation>) => void;
  removeDesignation: (id: string) => void;
}

const defaultDesignations: Designation[] = [
  { id: 'DES001', title: 'Software Engineer', departmentId: 'DEPT001', level: 'Mid', description: 'Develops and maintains software systems', createdAt: '2023-01-10' },
  { id: 'DES002', title: 'Senior Software Engineer', departmentId: 'DEPT001', level: 'Senior', description: 'Leads technical design and development', createdAt: '2023-01-10' },
  { id: 'DES003', title: 'Engineering Manager', departmentId: 'DEPT001', level: 'Manager', description: 'Manages engineering teams', createdAt: '2023-01-10' },
  { id: 'DES004', title: 'Sales Executive', departmentId: 'DEPT002', level: 'Junior', description: 'Manages client accounts and sales pipeline', createdAt: '2023-01-10' },
  { id: 'DES005', title: 'Marketing Specialist', departmentId: 'DEPT003', level: 'Mid', description: 'Executes marketing campaigns', createdAt: '2023-02-01' },
  { id: 'DES006', title: 'HR Generalist', departmentId: 'DEPT004', level: 'Mid', description: 'Handles HR operations and talent acquisition', createdAt: '2023-01-10' },
  { id: 'DES007', title: 'Finance Analyst', departmentId: 'DEPT005', level: 'Mid', description: 'Analyzes financial data and prepares reports', createdAt: '2023-01-10' },
  { id: 'DES008', title: 'Operations Lead', departmentId: 'DEPT006', level: 'Lead', description: 'Oversees day-to-day operations', createdAt: '2023-03-15' },
];

export const useDesignationStore = create<DesignationState>()(
  persist(
    (set) => ({
      designations: defaultDesignations,
      addDesignation: (d) =>
        set((s) => ({
          designations: [...s.designations, { ...d, id: `DES${String(Date.now()).slice(-6)}`, createdAt: new Date().toISOString().split('T')[0] }],
        })),
      updateDesignation: (id, updates) =>
        set((s) => ({ designations: s.designations.map((d) => (d.id === id ? { ...d, ...updates } : d)) })),
      removeDesignation: (id) =>
        set((s) => ({ designations: s.designations.filter((d) => d.id !== id) })),
    }),
    { name: 'designation-store' }
  )
);
