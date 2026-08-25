'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInitiative,
  deleteInitiative,
  getInitiative,
  listInitiatives,
  updateInitiative,
} from '@/lib/services/initiatives';
import type { Initiative } from '@/types/initiatives';
import type { ListParams } from '@/lib/services/shorts';

export function useInitiatives(params: ListParams = {}) {
  return useQuery({
    queryKey: ['initiatives', params],
    queryFn: () => listInitiatives(params),
  });
}

export function useInitiative(id: string | undefined) {
  return useQuery({
    queryKey: ['initiatives', id],
    queryFn: () => getInitiative(id as string),
    enabled: !!id,
  });
}

export function useCreateInitiative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Initiative>) => createInitiative(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    },
  });
}

export function useUpdateInitiative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Initiative> }) =>
      updateInitiative(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    },
  });
}

export function useDeleteInitiative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInitiative(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    },
  });
}