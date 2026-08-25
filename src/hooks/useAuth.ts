'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { loginRequest, logoutRequest } from '@/lib/services/settings';
import { useAuthStore } from '@/store/authStore';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        return logoutRequest(refreshToken);
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
      router.push('/login');
    },
    onError: () => {
      logout();
      router.push('/login');
    },
  });
}