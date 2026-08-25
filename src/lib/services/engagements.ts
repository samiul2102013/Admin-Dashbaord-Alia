import type { Paginated } from '@/types/api';
import type { Booking, InitiativeApplication } from '@/types/engagements';
import type { ListParams } from './shorts';
import apiClient from '@/lib/api-client';

export async function listBookings(params: ListParams = {}): Promise<Paginated<Booking>> {
  const { data } = await apiClient.get<Paginated<Booking>>('/admin/bookings', { params });
  return data;
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.get<Booking>(`/admin/bookings/${id}`);
  return data;
}

export async function updateBooking(id: string, payload: Partial<Booking>): Promise<Booking> {
  const { data } = await apiClient.put<Booking>(`/admin/bookings/${id}`, payload);
  return data;
}

export async function listApplications(
  params: ListParams = {},
): Promise<Paginated<InitiativeApplication>> {
  const { data } = await apiClient.get<Paginated<InitiativeApplication>>('/admin/applications', {
    params,
  });
  return data;
}

export async function getApplication(id: string): Promise<InitiativeApplication> {
  const { data } = await apiClient.get<InitiativeApplication>(`/admin/applications/${id}`);
  return data;
}

export async function updateApplication(
  id: string,
  payload: Partial<InitiativeApplication>,
): Promise<InitiativeApplication> {
  const { data } = await apiClient.put<InitiativeApplication>(`/admin/applications/${id}`, payload);
  return data;
}