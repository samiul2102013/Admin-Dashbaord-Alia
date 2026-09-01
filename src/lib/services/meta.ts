import type { UploadResponse } from '@/types/api';
import apiClient from '@/lib/api-client';

export interface MetaOption {
  value: string;
  label: string;
}

export interface MetaPayload {
  emirates: MetaOption[];
  categories: string[];
  languages: MetaOption[];
  emblems: MetaOption[];
  sessionTypes: MetaOption[];
  maritalStages: MetaOption[];
  sources: MetaOption[];
  resourceTypes: MetaOption[];
  supportPrograms: MetaOption[];
  bookingStatuses: MetaOption[];
  applicationStatuses: MetaOption[];
  statuses: MetaOption[];
}

export async function getMeta(): Promise<MetaPayload> {
  const { data } = await apiClient.get<MetaPayload>('/admin/meta');
  return data;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<UploadResponse>('/uploads', formData, { timeout: 0 });
  return data;
}