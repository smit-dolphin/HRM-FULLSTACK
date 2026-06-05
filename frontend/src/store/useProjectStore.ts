import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  description: string;
  managerId: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  endDate: string;
  budget: number;
  teamIds: string[];
}

interface ProjectState {
  projects: Project[];
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
}

const defaultProjects: Project[] = [
  { id: 'PRJ001', name: 'HRM System Redesign', description: 'Complete redesign of the HR management platform', managerId: 'EMP001', status: 'In Progress', priority: 'High', startDate: '2024-01-15', endDate: '2024-08-31', budget: 150000, teamIds: ['EMP001', 'EMP007', 'EMP008'] },
  { id: 'PRJ002', name: 'Mobile App Development', description: 'Native mobile app for Android and iOS', managerId: 'EMP008', status: 'Planning', priority: 'Critical', startDate: '2024-06-01', endDate: '2024-12-31', budget: 250000, teamIds: ['EMP008', 'EMP007'] },
  { id: 'PRJ003', name: 'Sales CRM Integration', description: 'Integrate third-party CRM with existing sales tools', managerId: 'EMP002', status: 'Completed', priority: 'Medium', startDate: '2023-10-01', endDate: '2024-02-28', budget: 80000, teamIds: ['EMP002', 'EMP003'] },
  { id: 'PRJ004', name: 'Marketing Campaign Q3', description: 'Q3 digital marketing campaign across all channels', managerId: 'EMP003', status: 'In Progress', priority: 'Medium', startDate: '2024-07-01', endDate: '2024-09-30', budget: 50000, teamIds: ['EMP003'] },
  { id: 'PRJ005', name: 'Infrastructure Upgrade', description: 'Cloud infrastructure migration and upgrade', managerId: 'EMP006', status: 'On Hold', priority: 'High', startDate: '2024-04-01', endDate: '2024-10-31', budget: 120000, teamIds: ['EMP006', 'EMP001'] },
  { id: 'PRJ006', name: 'Finance Dashboard', description: 'Real-time financial reporting dashboard', managerId: 'EMP005', status: 'Planning', priority: 'Low', startDate: '2024-09-01', endDate: '2025-01-31', budget: 60000, teamIds: ['EMP005'] },
];

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: defaultProjects,
      addProject: (p) =>
        set((s) => ({
          projects: [...s.projects, { ...p, id: `PRJ${String(Date.now()).slice(-6)}` }],
        })),
      updateProject: (id, updates) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
      removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    { name: 'project-store' }
  )
);
