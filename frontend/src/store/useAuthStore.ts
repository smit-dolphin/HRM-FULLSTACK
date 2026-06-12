import { create } from 'zustand';
import { signoutService } from '@/services/authService/authService';
import { toast } from 'sonner';
import { persist } from 'zustand/middleware';

type Role = 'employee' | 'admin' | 'manager' | 'teamleader' | 'superadmin';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  permissions: string[];
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  permissions: string[];
  login: (user: User) => void;
  logout: () => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      permissions: [],
      login: (user) => set({
        user,
        isAuthenticated: true,
        permissions: user.permissions || [],
      }),
      logout: async () => {
        try {
          const res = await signoutService();
          toast.success(res.message);
        } catch {
          toast.error("Logout failed");
        } finally {
          set({ user: null, isAuthenticated: false, permissions: [] });
        }
      },
      clearAuth: () => {
        set({ user: null, isAuthenticated: false, permissions: [] });
      },
      hasPermission: (permission: string) => {
        return get().permissions.includes(permission);
      },
    }),
    { name: "auth-storage" }
  )
)
