import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'Active' | 'Suspended' | 'Inactive';
  lastLogin: string;
  createdAt: string;
}

interface UserState {
  users: User[];
  addUser: (u: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
}

const defaultUsers: User[] = [
  { id: 'USR001', name: 'Jane Doe', email: 'jane@company.com', roleId: 'ROLE001', status: 'Active', lastLogin: '2024-06-04', createdAt: '2023-01-10' },
  { id: 'USR002', name: 'Bob Brown', email: 'bob@company.com', roleId: 'ROLE002', status: 'Active', lastLogin: '2024-06-03', createdAt: '2023-01-10' },
  { id: 'USR003', name: 'Fiona Green', email: 'fiona@company.com', roleId: 'ROLE005', status: 'Active', lastLogin: '2024-06-04', createdAt: '2023-03-01' },
  { id: 'USR004', name: 'Diana Prince', email: 'diana@company.com', roleId: 'ROLE005', status: 'Active', lastLogin: '2024-06-02', createdAt: '2023-04-15' },
  { id: 'USR005', name: 'John Smith', email: 'john@company.com', roleId: 'ROLE004', status: 'Active', lastLogin: '2024-05-28', createdAt: '2023-01-10' },
  { id: 'USR006', name: 'Alice Johnson', email: 'alice@company.com', roleId: 'ROLE004', status: 'Active', lastLogin: '2024-06-01', createdAt: '2023-02-20' },
  { id: 'USR007', name: 'Charlie Davis', email: 'charlie@company.com', roleId: 'ROLE004', status: 'Suspended', lastLogin: '2024-03-15', createdAt: '2023-01-10' },
];

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: defaultUsers,
      addUser: (u) =>
        set((s) => ({
          users: [...s.users, { ...u, id: `USR${String(Date.now()).slice(-6)}`, createdAt: new Date().toISOString().split('T')[0] }],
        })),
      updateUser: (id, updates) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)) })),
      removeUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
    }),
    { name: 'user-store' }
  )
);
