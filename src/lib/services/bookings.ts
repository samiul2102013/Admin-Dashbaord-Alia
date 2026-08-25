import type { Paginated } from '@/types/api';
import type { Booking } from '@/types/booking';
import type { ListParams } from './shorts';
import apiClient from '@/lib/api-client';

export interface BookingListParams extends ListParams {
  status?: string;
}

export async function listBookings(params: BookingListParams = {}): Promise<Paginated<Booking>> {
  const { data } = await apiClient.get<Paginated<Booking>>('/admin/bookings', { params });
  return data;
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.get<Booking>(`/admin/bookings/${id}`);
  return data;
}

export async function updateBooking(
  id: string,
  payload: Partial<Booking>,
): Promise<Booking> {
  const { data } = await apiClient.put<Booking>(`/admin/bookings/${id}`, payload);
  return data;
}
