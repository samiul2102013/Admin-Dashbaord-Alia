import type { Paginated } from '@/types/api';
import type { NewsArticle } from '@/types/news';
import type { ListParams } from './shorts';
import apiClient from '@/lib/api-client';

export async function listNewsArticles(params: ListParams = {}): Promise<Paginated<NewsArticle>> {
  const { data } = await apiClient.get<Paginated<NewsArticle>>('/admin/news', { params });
  return data;
}

export async function getNewsArticle(id: string): Promise<NewsArticle> {
  const { data } = await apiClient.get<NewsArticle>(`/admin/news/${id}`);
  return data;
}

export async function createNewsArticle(payload: Partial<NewsArticle>): Promise<NewsArticle> {
  const { data } = await apiClient.post<NewsArticle>('/admin/news', payload);
  return data;
}

export async function updateNewsArticle(
  id: string,
  payload: Partial<NewsArticle>,
): Promise<NewsArticle> {
  const { data } = await apiClient.put<NewsArticle>(`/admin/news/${id}`, payload);
  return data;
}

export async function deleteNewsArticle(id: string): Promise<void> {
  await apiClient.delete(`/admin/news/${id}`);
}