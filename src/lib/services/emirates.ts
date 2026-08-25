import type { Paginated } from '@/types/api';
import type { Emirates } from '@/types/emirates';
import type { ListParams } from './shorts';
import apiClient from '@/lib/api-client';

export async function listEmirates(params: ListParams = {}): Promise<Paginated<Emirates>> {
  const { data } = await apiClient.get<Paginated<Emirates>>('/admin/emirates', { params });
  return data;
}

export async function getEmirate(id: string): Promise<Emirates> {
  const { data } = await apiClient.get<Emirates>(`/admin/emirates/${id}`);
  return data;
}

export async function createEmirate(payload: Partial<Emirates>): Promise<Emirates> {
  const { data } = await apiClient.post<Emirates>('/admin/emirates', payload);
  return data;
}

export async function updateEmirate(id: string, payload: Partial<Emirates>): Promise<Emirates> {
  const { data } = await apiClient.put<Emirates>(`/admin/emirates/${id}`, payload);
  return data;
}

export async function deleteEmirate(id: string): Promise<void> {
  await apiClient.delete(`/admin/emirates/${id}`);
}