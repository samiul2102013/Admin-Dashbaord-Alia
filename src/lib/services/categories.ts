import type { Paginated } from '@/types/api';
import type { Category } from '@/types/categories';
import type { ListParams } from './shorts';
import apiClient from '@/lib/api-client';

export async function listCategories(params: ListParams = {}): Promise<Paginated<Category>> {
  const { data } = await apiClient.get<Paginated<Category>>('/admin/categories', { params });
  return data;
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/admin/categories/${id}`);
  return data;
}

export async function createCategory(payload: Partial<Category>): Promise<Category> {
  const { data } = await apiClient.post<Category>('/admin/categories', payload);
  return data;
}

export async function updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
  const { data } = await apiClient.put<Category>(`/admin/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}