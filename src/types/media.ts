export interface MediaItem {
  id: string;
  slug: string;
  fileUrl: string;
  filename: string;
  alt: string;
  altAr: string;
  caption: string;
  captionAr: string;
  category: 'image' | 'video' | 'document';
  fileSize: number;
  width: number;
  height: number;
  status: string;
  createdAt?: string;
}
