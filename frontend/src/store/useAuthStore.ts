import { create } from 'zustand';

type Role = 'Employee' | 'Admin' | 'Super Admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: '',
    name: '',
    email: '',
    isActive: true,
    role: 'Employee', // Default to Admin for testing
  },
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
