'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listBookings,
  updateBooking,
  listApplications,
  updateApplication,
} from '@/lib/services/engagements';
import type { Booking, InitiativeApplication } from '@/types/engagements';
import type { ListParams } from '@/lib/services/shorts';

export function useBookings(params: ListParams = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => listBookings(params),
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

export function useApplications(params: ListParams = {}) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => listApplications(params),
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<InitiativeApplication> }) =>
      updateApplication(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}