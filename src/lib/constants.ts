export const SITE_NAME = 'Marage Admin';
export const SITE_URL = '/';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

export const ITEMS_PER_PAGE = 10;

export const STATUS_OPTIONS = [
  { value: 'Published', label: 'Published' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending', label: 'Pending' },
];

export const EMIRATES_OPTIONS = [
  { value: 'abudhabi', label: 'Abu Dhabi' },
  { value: 'dubai', label: 'Dubai' },
  { value: 'sharjah', label: 'Sharjah' },
  { value: 'ajman', label: 'Ajman' },
  { value: 'rasalkhaimah', label: 'Ras Al Khaimah' },
  { value: 'fujairah', label: 'Fujairah' },
  { value: 'ummAlquwain', label: 'Umm Al-Quwain' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'both', label: 'Both' },
];

export const SESSION_TYPE_OPTIONS = [
  { value: 'counseling', label: 'Counseling' },
  { value: 'financial', label: 'Financial' },
  { value: 'legal', label: 'Legal' },
  { value: 'health', label: 'Health' },
  { value: 'workshop', label: 'Workshop' },
];

export const NEWS_SOURCE_OPTIONS = [
  { value: 'government', label: 'Government' },
  { value: 'ngo', label: 'NGO' },
  { value: 'private', label: 'Private' },
];

export const MARITAL_STAGE_OPTIONS = [
  { value: 'premarital', label: 'Premarital' },
  { value: 'marital', label: 'Marital' },
  { value: 'postMarital', label: 'Post-marital' },
];

export const SHORT_CATEGORY_OPTIONS = [
  { value: 'Initiative', label: 'Initiative' },
  { value: 'Education', label: 'Education' },
  { value: 'Culture', label: 'Culture' },
  { value: 'Service', label: 'Service' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Health', label: 'Health' },
];

export const NEWS_CATEGORY_OPTIONS = [
  { value: 'marriage', label: 'Marriage' },
  { value: 'family', label: 'Family' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'community', label: 'Community' },
  { value: 'policy', label: 'Policy' },
  { value: 'education', label: 'Education' },
  { value: 'service', label: 'Service' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'culture', label: 'Culture' },
];

export const BOOKING_STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending_payment', label: 'Pending Payment' },
];

export const APP_STATUS_OPTIONS = [
  { value: 'received', label: 'Received' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];