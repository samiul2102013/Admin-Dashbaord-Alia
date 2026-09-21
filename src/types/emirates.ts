export interface Emirates {
  id: string;
  emiratesName: string;
  description: string;
  dateTime: string;
  status: 'Published' | 'Draft' | 'Pending';
  slug?: string;
  emiratesNameAr?: string;
  title?: string;
  titleAr?: string;
  descriptionAr?: string;
  centerCountAr?: string;
  contactPhone?: string;
  serviceCenters?: number;
  centerCount?: string;
  image?: string;
  websiteUrl?: string;
  browseInitiativesUrl?: string;
  showStatus?: boolean;
}