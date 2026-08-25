'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNewsArticle,
  deleteNewsArticle,
  getNewsArticle,
  listNewsArticles,
  updateNewsArticle,
} from '@/lib/services/news';
import type { NewsArticle } from '@/types/news';
import type { ListParams } from '@/lib/services/shorts';

export function useNewsArticles(params: ListParams = {}) {
  return useQuery({
    queryKey: ['news', params],
    queryFn: () => listNewsArticles(params),
  });
}

export function useNewsArticle(id: string | undefined) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => getNewsArticle(id as string),
    enabled: !!id,
  });
}

export function useCreateNewsArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<NewsArticle>) => createNewsArticle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useUpdateNewsArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<NewsArticle> }) =>
      updateNewsArticle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useDeleteNewsArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNewsArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}