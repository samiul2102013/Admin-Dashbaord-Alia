import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/refresh/`,
          { refresh: refreshToken },
        );
        useAuthStore.getState().setAccessToken(data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: { message?: string }; detail?: string }
      | undefined;
    return data?.error?.message ?? data?.detail ?? error.message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}

export default apiClient;