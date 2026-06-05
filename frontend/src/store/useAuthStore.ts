import { create } from 'zustand';
import { signoutService } from '@/services/authService/authService';
import { toast } from 'sonner';

type Role = 'employee' | 'admin' | 'superadmin';

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
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: async () => {
    try {
      const res = await signoutService();
      toast.success(res.message);
    } catch {
      toast.error("Logout failed");
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
