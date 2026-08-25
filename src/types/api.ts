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
}