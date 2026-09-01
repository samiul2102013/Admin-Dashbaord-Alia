import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMediaItem, deleteMediaItem, getMediaItems, mediaKeys, updateMediaItem } from '@/lib/services/media';

export function useMediaItems(params?: { page?: number; perPage?: number; search?: string; status?: string; category?: string }) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => getMediaItems(params),
  });
}

export function useCreateMediaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMediaItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

export function useUpdateMediaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<import('@/types/media').MediaItem> }) =>
      updateMediaItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

export function useDeleteMediaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMediaItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}
