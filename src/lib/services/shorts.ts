import type { Paginated } from '@/types/api';
import type { Short } from '@/types/shorts';
import apiClient from '@/lib/api-client';

export interface ListParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
}

export async function listShorts(params: ListParams = {}): Promise<Paginated<Short>> {
  const { data } = await apiClient.get<Paginated<Short>>('/admin/shorts', { params });
  return data;
}

export async function getShort(id: string): Promise<Short> {
  const { data } = await apiClient.get<Short>(`/admin/shorts/${id}`);
  return data;
}

export async function createShort(payload: Partial<Short>): Promise<Short> {
  const { data } = await apiClient.post<Short>('/admin/shorts', payload);
  return data;
}

export async function updateShort(id: string, payload: Partial<Short>): Promise<Short> {
  const { data } = await apiClient.put<Short>(`/admin/shorts/${id}`, payload);
  return data;
}

export async function deleteShort(id: string): Promise<void> {
  await apiClient.delete(`/admin/shorts/${id}`);
}