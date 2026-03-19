import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createStorage } from '@enterprise/utils';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const storage = createStorage('auth');

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        storage.set('token', token, { expires: 7 * 24 * 60 * 60 * 1000 });
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        storage.remove('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),
    }),
    {
      name: 'enterprise-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
