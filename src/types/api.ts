export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export interface AuthUser {
  id: string | number;
  name: string;
  username: string;
  email: string;
  contact_number: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
  id?: string;
  category?: 'image' | 'video' | 'document';
}

export interface ChunkUploadChunkResponse {
  success: boolean;
  fileId: string;
  chunkIndex: number;
  received: number[];
  total: number;
  bytesReceived: number;
  complete: boolean;
}

export interface ChunkedUploadOptions {
  chunkSizeBytes?: number;
  category?: 'image' | 'video' | 'document';
  alt?: string;
  altAr?: string;
  caption?: string;
  captionAr?: string;
  onProgress?: (state: ChunkedUploadProgress) => void;
  signal?: AbortSignal;
}

export interface ChunkedUploadProgress {
  fileId: string | null;
  bytesUploaded: number;
  totalBytes: number;
  chunksUploaded: number;
  totalChunks: number;
  percent: number;
  status: 'idle' | 'preparing' | 'uploading' | 'finalizing' | 'completed' | 'error' | 'aborted';
  errorMessage?: string;
}