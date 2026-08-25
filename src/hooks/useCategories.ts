'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from '@/lib/services/categories';
import type { Category } from '@/types/categories';
import type { ListParams } from '@/lib/services/shorts';

export function useCategories(params: ListParams = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => listCategories(params),
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategory(id as string),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Category>) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Category> }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}