import apiClient from '@/lib/api-client';
import type { AboutContent } from '@/types/about';

export const aboutKeys = {
  all: ['about'] as const,
  content: () => [...aboutKeys.all, 'content'] as const,
};

export async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const { data } = await apiClient.get<AboutContent>('/admin/about');
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function saveAboutContent(payload: Partial<AboutContent>): Promise<AboutContent> {
  const { data } = await apiClient.post<AboutContent>('/admin/about', payload);
  return data;
}
