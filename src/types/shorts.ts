export interface ShortResource {
  title?: string;
  url?: string;
  type?: string;
}

export interface Short {
  id: string;
  videoTitle: string;
  videoTitleAr?: string;
  slug?: string;
  category: string;
  organization?: string;
  family?: string;
  language: string;
  maritalStage?: string;
  duration: string;
  publishedAt?: string;
  coverImage?: string;
  videoUrl?: string;
  speaker?: string;
  views?: number;
  description?: string;
  keyTopics?: string[];
  resources?: ShortResource[];
  shareUrl?: string;
  showKeyTopics?: boolean;
  showResources?: boolean;
  showShare?: boolean;
  showSpeaker?: boolean;
  showViews?: boolean;
  showRelated?: boolean;
  status: 'Published' | 'Draft' | 'Pending';
}