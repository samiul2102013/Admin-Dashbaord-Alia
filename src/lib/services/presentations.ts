import type { Paginated } from '@/types/api';
import apiClient from '@/lib/api-client';
import type { Presentation } from '@/types/presentations';

export const SECTION_LABELS: Record<string, string> = {
  news: 'News',
  shorts: 'Shorts',
  consultation: 'Consultation',
  home: 'Home',
  initiatives: 'Initiatives',
  emirates: 'Emirates',
};

export async function listPresentations(): Promise<Presentation[]> {
  const { data } = await apiClient.get<Paginated<Presentation> | Presentation[]>(
    '/admin/presentations',
    { params: { perPage: 50 } },
  );
  return Array.isArray(data) ? data : data.data;
}

export async function updatePresentation(
  id: string,
  payload: Partial<Presentation>,
): Promise<Presentation> {
  const { data } = await apiClient.put<Presentation>(`/admin/presentations/${id}`, payload);
  return data;
}
