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

const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB (reliable on all networks, smooth progress)
// How many chunks to push in parallel. Chunks are small, so sending a few at
// once hides per-request round-trip latency and makes large videos much faster
// than a strictly sequential loop, without hammering the server.
const DEFAULT_CONCURRENCY = 4;

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

async function uploadChunkWithRetry(
  params: Parameters<typeof uploadChunk>[0],
  maxRetries = 4,
  onRetry?: (attempt: number) => void,
) {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (params.signal?.aborted) throw new Error('aborted');
      return await uploadChunk(params);
    } catch (err: any) {
      lastError = err;
      if (params.signal?.aborted || err?.message === 'aborted' || err?.name === 'CanceledError') {
        throw err;
      }
      const status = err?.response?.status;
      // Don't retry non-recoverable 4xx errors, but DO retry timeouts (408) or rate limits (429)
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        throw err;
      }
      if (attempt < maxRetries) {
        onRetry?.(attempt);
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 6000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

async function completeChunkedUploadWithRetry(
  params: Parameters<typeof completeChunkedUpload>[0],
  maxRetries = 3,
) {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (params.signal?.aborted) throw new Error('aborted');
      return await completeChunkedUpload(params);
    } catch (err: any) {
      lastError = err;
      if (params.signal?.aborted || err?.message === 'aborted' || err?.name === 'CanceledError') {
        throw err;
      }
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        throw err;
      }
      if (attempt < maxRetries) {
        const delay = Math.min(1500 * Math.pow(2, attempt - 1), 8000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
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
      const concurrency = Math.max(
        1,
        Math.min(options.concurrency ?? DEFAULT_CONCURRENCY, totalChunks),
      );
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

      // Per-chunk transferred bytes. Progress is the sum across every chunk, so
      // it advances continuously even while several chunks are in flight.
      const chunkLoaded = new Array<number>(totalChunks).fill(0);
      const completedChunks = new Set<number>();

      const emit = (
        status: ChunkedUploadProgress['status'],
        opts: { retrying?: boolean; retryAttempt?: number } = {},
      ) => {
        const transferred = Math.min(
          file.size,
          chunkLoaded.reduce((sum, n) => sum + n, 0),
        );
        const isDone = status === 'finalizing' || status === 'completed';
        const percent = file.size > 0 ? Math.min(100, Math.round((transferred / file.size) * 100)) : 0;
        const state: ChunkedUploadProgress = {
          fileId,
          bytesUploaded: isDone ? file.size : transferred,
          totalBytes: file.size,
          chunksUploaded: completedChunks.size,
          totalChunks,
          percent: isDone ? 100 : percent,
          status,
          retrying: opts.retrying ?? false,
          retryAttempt: opts.retryAttempt,
        };
        setProgress(state);
        options.onProgress?.(state);
      };

      emit('preparing');

      try {
        let nextIndex = 0;

        const uploadOne = async (index: number): Promise<void> => {
          const start = index * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const blob = file.slice(start, end);

          await uploadChunkWithRetry(
            {
              fileId,
              chunkIndex: index,
              totalChunks,
              filename: file.name,
              mimeType: file.type,
              chunk: blob,
              signal: controller.signal,
              onUploadProgress: (loaded) => {
                chunkLoaded[index] = Math.min(loaded, blob.size);
                emit('uploading');
              },
            },
            4,
            (retryAttempt) => {
              // A retry re-sends the whole chunk: clear its partial contribution
              // so the bar doesn't double-count it.
              chunkLoaded[index] = 0;
              emit('uploading', { retrying: true, retryAttempt });
            },
          );

          chunkLoaded[index] = blob.size;
          completedChunks.add(index);
          emit('uploading');
        };

        // Bounded-concurrency worker pool. Parallel chunks hide per-request
        // round-trip latency (Cloudflare/Traefik), which is what made large
        // videos feel like they were "stuck, with no progress".
        const workers = Array.from({ length: concurrency }, async () => {
          for (;;) {
            if (controller.signal.aborted) throw new Error('aborted');
            const index = nextIndex++;
            if (index >= totalChunks) return;
            await uploadOne(index);
          }
        });
        await Promise.all(workers);

        emit('finalizing');

        const result = await completeChunkedUploadWithRetry({
          fileId,
          category: options.category,
          alt: options.alt,
          altAr: options.altAr,
          caption: options.caption,
          captionAr: options.captionAr,
          signal: controller.signal,
        });

        emit('completed');
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