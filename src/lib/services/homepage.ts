import apiClient from '@/lib/api-client';
import type { HomepageContent } from '@/types/homepage';

export const homepageKeys = {
  all: ['homepage'] as const,
  content: () => [...homepageKeys.all, 'content'] as const,
};

export async function getHomepageContent(): Promise<HomepageContent | null> {
  try {
    const { data } = await apiClient.get<HomepageContent>('/admin/homepage');
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function saveHomepageContent(payload: Partial<HomepageContent>): Promise<HomepageContent> {
  const { data } = await apiClient.post<HomepageContent>('/admin/homepage', payload);
  return data;
}
