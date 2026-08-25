import type { Paginated } from '@/types/api';
import type { Consultation } from '@/types/consultations';
import type { ListParams } from './shorts';
import apiClient from '@/lib/api-client';

export async function listConsultations(
  params: ListParams = {},
): Promise<Paginated<Consultation>> {
  const { data } = await apiClient.get<Paginated<Consultation>>('/admin/consultations', {
    params,
  });
  return data;
}

export async function getConsultation(id: string): Promise<Consultation> {
  const { data } = await apiClient.get<Consultation>(`/admin/consultations/${id}`);
  return data;
}

export async function createConsultation(payload: Partial<Consultation>): Promise<Consultation> {
  const { data } = await apiClient.post<Consultation>('/admin/consultations', payload);
  return data;
}

export async function updateConsultation(
  id: string,
  payload: Partial<Consultation>,
): Promise<Consultation> {
  const { data } = await apiClient.put<Consultation>(`/admin/consultations/${id}`, payload);
  return data;
}

export async function deleteConsultation(id: string): Promise<void> {
  await apiClient.delete(`/admin/consultations/${id}`);
}