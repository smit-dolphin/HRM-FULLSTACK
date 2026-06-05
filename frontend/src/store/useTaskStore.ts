import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  reporterId: string;
  status: 'Todo' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  createdAt: string;
  tags: string[];
}

interface TaskState {
  tasks: Task[];
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
}

const defaultTasks: Task[] = [
  { id: 'TSK001', title: 'Design new dashboard layout', description: 'Create wireframes and mockups for the new dashboard', projectId: 'PRJ001', assigneeId: 'EMP001', reporterId: 'EMP008', status: 'Done', priority: 'High', dueDate: '2024-02-15', createdAt: '2024-01-20', tags: ['design', 'frontend'] },
  { id: 'TSK002', title: 'Implement employee CRUD API', description: 'Build REST endpoints for employee management', projectId: 'PRJ001', assigneeId: 'EMP007', reporterId: 'EMP001', status: 'In Progress', priority: 'High', dueDate: '2024-06-30', createdAt: '2024-03-01', tags: ['backend', 'api'] },
  { id: 'TSK003', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated deployments', projectId: 'PRJ002', assigneeId: 'EMP008', reporterId: 'EMP008', status: 'Todo', priority: 'Medium', dueDate: '2024-07-15', createdAt: '2024-06-01', tags: ['devops', 'automation'] },
  { id: 'TSK004', title: 'Write unit tests for auth module', description: 'Achieve 80% coverage on authentication code', projectId: 'PRJ001', assigneeId: 'EMP007', reporterId: 'EMP001', status: 'In Review', priority: 'Medium', dueDate: '2024-06-20', createdAt: '2024-05-15', tags: ['testing', 'backend'] },
  { id: 'TSK005', title: 'Social media strategy Q3', description: 'Develop content calendar and strategy for Q3', projectId: 'PRJ004', assigneeId: 'EMP003', reporterId: 'EMP003', status: 'In Progress', priority: 'Medium', dueDate: '2024-07-05', createdAt: '2024-06-01', tags: ['marketing'] },
  { id: 'TSK006', title: 'Migrate database to PostgreSQL', description: 'Migrate from MySQL to PostgreSQL for better performance', projectId: 'PRJ005', assigneeId: 'EMP006', reporterId: 'EMP006', status: 'Blocked', priority: 'Critical', dueDate: '2024-06-15', createdAt: '2024-04-10', tags: ['database', 'migration'] },
  { id: 'TSK007', title: 'Design mobile app wireframes', description: 'Create wireframes for all app screens', projectId: 'PRJ002', assigneeId: 'EMP001', reporterId: 'EMP008', status: 'Todo', priority: 'High', dueDate: '2024-07-30', createdAt: '2024-06-03', tags: ['design', 'mobile'] },
  { id: 'TSK008', title: 'Set up CRM data sync', description: 'Configure bidirectional data sync with Salesforce', projectId: 'PRJ003', assigneeId: 'EMP002', reporterId: 'EMP002', status: 'Done', priority: 'High', dueDate: '2024-02-10', createdAt: '2023-12-01', tags: ['integration', 'crm'] },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: defaultTasks,
      addTask: (t) =>
        set((s) => ({
          tasks: [...s.tasks, { ...t, id: `TSK${String(Date.now()).slice(-6)}`, createdAt: new Date().toISOString().split('T')[0] }],
        })),
      updateTask: (id, updates) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    }),
    { name: 'task-store' }
  )
);
