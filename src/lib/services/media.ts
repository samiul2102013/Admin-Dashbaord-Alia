import apiClient from '@/lib/api-client';
import type { MediaItem } from '@/types/media';

export const mediaKeys = {
  all: ['media'] as const,
  list: (params?: Record<string, string | number>) => [...mediaKeys.all, 'list', params] as const,
};

export interface PaginatedMediaResponse {
  data: MediaItem[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

export async function getMediaItems(params?: { page?: number; perPage?: number; search?: string; status?: string; category?: string }): Promise<PaginatedMediaResponse> {
  const { data } = await apiClient.get('/admin/media', { params });
  return data;
}

export async function createMediaItem(payload: Partial<MediaItem>): Promise<MediaItem> {
  const { data } = await apiClient.post('/admin/media', payload);
  return data;
}

export async function updateMediaItem(id: string, payload: Partial<MediaItem>): Promise<MediaItem> {
  const { data } = await apiClient.put(`/admin/media/${id}`, payload);
  return data;
}

export async function deleteMediaItem(id: string): Promise<void> {
  await apiClient.delete(`/admin/media/${id}`);
}
