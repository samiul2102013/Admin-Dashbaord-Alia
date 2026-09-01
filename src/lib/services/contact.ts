import apiClient from '@/lib/api-client';
import type { ContactContent } from '@/types/contact';

export const contactKeys = {
  all: ['contact'] as const,
  content: () => [...contactKeys.all, 'content'] as const,
};

export async function getContactContent(): Promise<ContactContent | null> {
  try {
    const { data } = await apiClient.get<ContactContent>('/admin/contact');
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function saveContactContent(payload: Partial<ContactContent>): Promise<ContactContent> {
  const { data } = await apiClient.post<ContactContent>('/admin/contact', payload);
  return data;
}
