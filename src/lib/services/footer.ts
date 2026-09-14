import apiClient from '@/lib/api-client';
import type { FooterContent } from '@/types/footer';

export const footerKeys = {
  all: ['footer'] as const,
  content: () => [...footerKeys.all, 'content'] as const,
};

export async function getFooterContent(): Promise<FooterContent | null> {
  try {
    const { data } = await apiClient.get<FooterContent>('/admin/footer');
    return data;
  } catch (e) {
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw e;
  }
}

export async function saveFooterContent(payload: Partial<FooterContent>): Promise<FooterContent> {
  const { data } = await apiClient.post<FooterContent>('/admin/footer', payload);
  return data;
}
