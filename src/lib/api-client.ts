import axios from 'axios';
import baseClient from '@/lib/base-client';

let _getToken: (() => string | null) | null = null;
let _getRefreshToken: (() => string | null) | null = null;
let _onRefreshed: ((token: string) => void) | null = null;
let _onLogout: (() => void) | null = null;

export function setAuthCallbacks(opts: {
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  onRefreshed: (token: string) => void;
  onLogout: () => void;
}) {
  _getToken = opts.getToken;
  _getRefreshToken = opts.getRefreshToken;
  _onRefreshed = opts.onRefreshed;
  _onLogout = opts.onLogout;
}

baseClient.interceptors.request.use((config) => {
  const token = _getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

baseClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = _getRefreshToken?.();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/refresh/`,
          { refresh: refreshToken },
        );
        _onRefreshed?.(data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return baseClient(originalRequest);
      } catch (refreshError) {
        _onLogout?.();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
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

export default baseClient;
