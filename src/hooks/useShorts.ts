'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteShort, getShort, listShorts } from '@/lib/services/shorts';
import { createShort as apiCreateShort, updateShort as apiUpdateShort } from '@/lib/services/shorts';
import type { Short } from '@/types/shorts';
import type { ListParams } from '@/lib/services/shorts';

export function useShorts(params: ListParams = {}) {
  return useQuery({
    queryKey: ['shorts', params],
    queryFn: () => listShorts(params),
  });
}

export function useShort(id: string | undefined) {
  return useQuery({
    queryKey: ['shorts', id],
    queryFn: () => getShort(id as string),
    enabled: !!id,
  });
}

export function useCreateShort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Short>) => apiCreateShort(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
    },
  });
}

export function useUpdateShort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Short> }) =>
      apiUpdateShort(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
    },
  });
}

export function useDeleteShort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShort(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
    },
  });
}