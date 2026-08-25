import type { Paginated } from '@/types/api';
import type { Initiative } from '@/types/initiatives';
import type { ListParams } from './shorts';
import apiClient from '@/lib/api-client';

export async function listInitiatives(params: ListParams = {}): Promise<Paginated<Initiative>> {
  const { data } = await apiClient.get<Paginated<Initiative>>('/admin/initiatives', { params });
  return data;
}

export async function getInitiative(id: string): Promise<Initiative> {
  const { data } = await apiClient.get<Initiative>(`/admin/initiatives/${id}`);
  return data;
}

export async function createInitiative(payload: Partial<Initiative>): Promise<Initiative> {
  const { data } = await apiClient.post<Initiative>('/admin/initiatives', payload);
  return data;
}

export async function updateInitiative(
  id: string,
  payload: Partial<Initiative>,
): Promise<Initiative> {
  const { data } = await apiClient.patch<Initiative>(`/admin/initiatives/${id}`, payload);
  return data;
}

export async function deleteInitiative(id: string): Promise<void> {
  await apiClient.delete(`/admin/initiatives/${id}`);
}