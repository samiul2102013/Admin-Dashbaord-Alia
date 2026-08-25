'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createConsultation,
  deleteConsultation,
  getConsultation,
  listConsultations,
  updateConsultation,
} from '@/lib/services/consultations';
import type { Consultation } from '@/types/consultations';
import type { ListParams } from '@/lib/services/shorts';

export function useConsultations(params: ListParams = {}) {
  return useQuery({
    queryKey: ['consultations', params],
    queryFn: () => listConsultations(params),
  });
}

export function useConsultation(id: string | undefined) {
  return useQuery({
    queryKey: ['consultations', id],
    queryFn: () => getConsultation(id as string),
    enabled: !!id,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Consultation>) => createConsultation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Consultation> }) =>
      updateConsultation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

export function useDeleteConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteConsultation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}