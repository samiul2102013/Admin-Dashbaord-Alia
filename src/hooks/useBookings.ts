'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBooking, listBookings, updateBooking } from '@/lib/services/bookings';
import type { Booking } from '@/types/booking';
import type { BookingListParams } from '@/lib/services/bookings';

export function useBookings(params: BookingListParams = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => listBookings(params),
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => getBooking(id as string),
    enabled: !!id,
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Booking> }) =>
      updateBooking(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
