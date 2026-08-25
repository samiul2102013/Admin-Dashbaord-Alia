'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { getMeta, uploadFile } from '@/lib/services/meta';

export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: () => getMeta(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpload() {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
  });
}