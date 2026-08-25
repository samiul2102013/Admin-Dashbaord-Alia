'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmirate,
  deleteEmirate,
  getEmirate,
  listEmirates,
  updateEmirate,
} from '@/lib/services/emirates';
import type { Emirates } from '@/types/emirates';
import type { ListParams } from '@/lib/services/shorts';

export function useEmirates(params: ListParams = {}) {
  return useQuery({
    queryKey: ['emirates', params],
    queryFn: () => listEmirates(params),
  });
}

export function useEmirate(id: string | undefined) {
  return useQuery({
    queryKey: ['emirates', id],
    queryFn: () => getEmirate(id as string),
    enabled: !!id,
  });
}

export function useCreateEmirate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Emirates>) => createEmirate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emirates'] });
    },
  });
}

export function useUpdateEmirate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Emirates> }) =>
      updateEmirate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emirates'] });
    },
  });
}

export function useDeleteEmirate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmirate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emirates'] });
    },
  });
}