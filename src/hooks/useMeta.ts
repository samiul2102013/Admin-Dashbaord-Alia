'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  abortChunkedUpload,
  completeChunkedUpload,
  getMeta,
  uploadChunk,
  uploadFile,
} from '@/lib/services/meta';
import type { ChunkedUploadOptions, ChunkedUploadProgress, UploadResponse } from '@/types/api';

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

const DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB

function uuidv4(): string {
  // RFC4122 v4 UUID using crypto when available.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  // Fallback (admin dashboard is always modern, but be safe).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useChunkedUpload() {
  const [progress, setProgress] = useState<ChunkedUploadProgress>({
    fileId: null,
    bytesUploaded: 0,
    totalBytes: 0,
    chunksUploaded: 0,
    totalChunks: 0,
    percent: 0,
    status: 'idle',
  });

  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setProgress({
      fileId: null,
      bytesUploaded: 0,
      totalBytes: 0,
      chunksUploaded: 0,
      totalChunks: 0,
      percent: 0,
      status: 'idle',
    });
  }, []);

  const abort = useCallback(async () => {
    abortRef.current?.abort();
    if (progress.fileId && progress.status !== 'completed') {
      try {
        await abortChunkedUpload(progress.fileId);
      } catch {
        // Best-effort cleanup; ignore.
      }
    }
    setProgress((p) => ({ ...p, status: 'aborted' }));
  }, [progress.fileId, progress.status]);

  const upload = useCallback(
    async (file: File, options: ChunkedUploadOptions = {}): Promise<UploadResponse> => {
      const chunkSize = options.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE;
      const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
      const fileId = uuidv4();
      const controller = new AbortController();
      abortRef.current = controller;

      setProgress({
        fileId,
        bytesUploaded: 0,
        totalBytes: file.size,
        chunksUploaded: 0,
        totalChunks,
        percent: 0,
        status: 'preparing',
      });
      options.onProgress?.({
        fileId,
        bytesUploaded: 0,
        totalBytes: file.size,
        chunksUploaded: 0,
        totalChunks,
        percent: 0,
        status: 'preparing',
      });

      try {
        for (let i = 0; i < totalChunks; i++) {
          if (controller.signal.aborted) throw new Error('aborted');
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const blob = file.slice(start, end);
          const response = await uploadChunk({
            fileId,
            chunkIndex: i,
            totalChunks,
            filename: file.name,
            mimeType: file.type,
            chunk: blob,
            signal: controller.signal,
          });
          const percent = Math.min(100, Math.round((response.bytesReceived / file.size) * 100));
          const nextState: ChunkedUploadProgress = {
            fileId,
            bytesUploaded: response.bytesReceived,
            totalBytes: file.size,
            chunksUploaded: response.received.length,
            totalChunks,
            percent,
            status: 'uploading',
          };
          setProgress(nextState);
          options.onProgress?.(nextState);
        }

        const finalizing: ChunkedUploadProgress = {
          fileId,
          bytesUploaded: file.size,
          totalBytes: file.size,
          chunksUploaded: totalChunks,
          totalChunks,
          percent: 100,
          status: 'finalizing',
        };
        setProgress(finalizing);
        options.onProgress?.(finalizing);

        const result = await completeChunkedUpload({
          fileId,
          category: options.category,
          alt: options.alt,
          altAr: options.altAr,
          caption: options.caption,
          captionAr: options.captionAr,
        });

        const completed: ChunkedUploadProgress = {
          ...finalizing,
          status: 'completed',
        };
        setProgress(completed);
        options.onProgress?.(completed);
        return result;
      } catch (e: any) {
        const status: ChunkedUploadProgress['status'] =
          controller.signal.aborted || e?.message === 'aborted' ? 'aborted' : 'error';
        const failed: ChunkedUploadProgress = {
          fileId,
          bytesUploaded: 0,
          totalBytes: file.size,
          chunksUploaded: 0,
          totalChunks,
          percent: 0,
          status,
          errorMessage: e?.message ?? 'Upload failed',
        };
        setProgress(failed);
        options.onProgress?.(failed);
        throw e;
      } finally {
        abortRef.current = null;
      }
    },
    [],
  );

  return { upload, abort, progress, reset };
}