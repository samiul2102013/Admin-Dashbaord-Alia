'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types/api';
import baseClient from '@/lib/base-client';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isBootstrapping: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isBootstrapping: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      bootstrap: async () => {
        const { refreshToken, accessToken } = get();
        if (accessToken || !refreshToken) {
          return;
        }
        set({ isBootstrapping: true });
        try {
          const { data } = await baseClient.post('/admin/auth/refresh/', {
            refresh: refreshToken,
          });
          set({ accessToken: data.access, isBootstrapping: false });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isBootstrapping: false });
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);