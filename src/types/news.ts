export interface NewsArticle {
  id: string;
  articleTitle: string;
  category: string;
  language: string;
  publishedDate: string;
  updatedDate: string;
  status: 'Published' | 'Draft' | 'Pending';
  slug?: string;
  articleTitleAr?: string;
  source?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  editorialTeam?: string;
  organization?: string;
  moc?: string;
  city?: string;
  emirate?: string;
  resources?: unknown[];
  shareUrl?: string;
  showArticleInfo?: boolean;
  showRelatedResources?: boolean;
  showShare?: boolean;
  showRelatedStories?: boolean;
}