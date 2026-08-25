import apiClient from '@/lib/api-client';
import type { AuthUser, LoginResponse } from '@/types/api';

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/admin/auth/login/', {
    email,
    password,
  });
  return data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiClient.post('/admin/auth/logout/', { refresh: refreshToken });
}

export interface SettingsPayload {
  profile: AuthUser;
  privacy_policy: { content: string };
  terms: { content: string };
}

export async function getSettings(): Promise<SettingsPayload> {
  const { data } = await apiClient.get<SettingsPayload>('/admin/settings/');
  return data;
}

export async function updateProfile(payload: {
  username?: string;
  email?: string;
  contact_number?: string;
}): Promise<AuthUser> {
  const { data } = await apiClient.put<AuthUser>('/admin/settings/profile/', payload);
  return data;
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<{ success: boolean }> {
  const { data } = await apiClient.post('/admin/settings/change-password/', payload);
  return data;
}

export async function updatePrivacy(content: string): Promise<{ success: true }> {
  const { data } = await apiClient.put('/admin/settings/privacy/', { content });
  return data;
}

export async function updateTerms(content: string): Promise<{ success: true }> {
  const { data } = await apiClient.put('/admin/settings/terms/', { content });
  return data;
}