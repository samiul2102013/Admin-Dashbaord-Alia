import type { ChunkUploadChunkResponse, UploadResponse } from '@/types/api';
import apiClient from '@/lib/api-client';

export interface MetaOption {
  value: string;
  label: string;
}

export interface MetaPayload {
  emirates: MetaOption[];
  categories: string[];
  languages: MetaOption[];
  emblems: MetaOption[];
  sessionTypes: MetaOption[];
  maritalStages: MetaOption[];
  sources: MetaOption[];
  resourceTypes: MetaOption[];
  supportPrograms: MetaOption[];
  bookingStatuses: MetaOption[];
  applicationStatuses: MetaOption[];
  statuses: MetaOption[];
}

export async function getMeta(): Promise<MetaPayload> {
  const { data } = await apiClient.get<MetaPayload>('/admin/meta');
  return data;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<UploadResponse>('/uploads', formData, { timeout: 0 });
  return data;
}

export async function uploadChunk(params: {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  filename: string;
  mimeType?: string;
  chunk: Blob;
  signal?: AbortSignal;
}): Promise<ChunkUploadChunkResponse> {
  const formData = new FormData();
  formData.append('file_id', params.fileId);
  formData.append('chunk_index', String(params.chunkIndex));
  formData.append('total_chunks', String(params.totalChunks));
  formData.append('filename', params.filename);
  if (params.mimeType) formData.append('mime_type', params.mimeType);
  formData.append('chunk', params.chunk, `${params.filename}.part${params.chunkIndex}`);

  const { data } = await apiClient.post<ChunkUploadChunkResponse>('/uploads', formData, {
    timeout: 0,
    signal: params.signal,
  });
  return data;
}

export async function completeChunkedUpload(params: {
  fileId: string;
  category?: 'image' | 'video' | 'document';
  alt?: string;
  altAr?: string;
  caption?: string;
  captionAr?: string;
  signal?: AbortSignal;
}): Promise<UploadResponse> {
  const { data } = await apiClient.post<UploadResponse>(
    '/uploads/complete',
    {
      fileId: params.fileId,
      category: params.category,
      alt: params.alt,
      altAr: params.altAr,
      caption: params.caption,
      captionAr: params.captionAr,
    },
    { timeout: 0, signal: params.signal },
  );
  return data;
}

export async function abortChunkedUpload(fileId: string): Promise<void> {
  await apiClient.post('/uploads/abort', { fileId });
}