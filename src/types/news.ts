export interface NewsResource {
  title?: string;
  titleAr?: string;
  url?: string;
  type?: string;
}

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
  contentAr?: string;
  coverImage?: string;
  author?: string;
  authorAr?: string;
  editorialTeam?: string;
  organization?: string;
  organizationAr?: string;
  moc?: string;
  city?: string;
  cityAr?: string;
  emirate?: string;
  resources?: NewsResource[];
  shareUrl?: string;
  showArticleInfo?: boolean;
  showRelatedResources?: boolean;
  showShare?: boolean;
  showRelatedStories?: boolean;
}