export interface Category {
  id: string;
  category: string;
  description: string;
  date: string;
  status: 'Published' | 'Draft' | 'Pending';
  slug?: string;
}