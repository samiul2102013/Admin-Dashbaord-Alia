import type { Consultation } from '@/types/consultations';

export const consultationsList: Consultation[] = [
  { id: '1', sessionTitle: 'Pre-Marriage Financial Planning', sessionType: 'Financial', emirates: 'Dubai', date: '2026-08-15', status: 'Published' },
  { id: '2', sessionTitle: 'Effective Communication in Marriage', sessionType: 'Counseling', emirates: 'All Emirates', date: '2026-08-20', status: 'Published' },
  { id: '3', sessionTitle: 'جلسة استشارية للتواصل الأسري', sessionType: 'Counseling', emirates: 'Sharjah', date: '2026-08-25', status: 'Published' },
  { id: '4', sessionTitle: 'Legal Rights & Responsibilities', sessionType: 'Legal', emirates: 'Abu Dhabi', date: '2026-09-01', status: 'Draft' },
  { id: '5', sessionTitle: 'Conflict Resolution Workshop', sessionType: 'Workshop', emirates: 'All Emirates', date: '2026-09-10', status: 'Published' },
  { id: '6', sessionTitle: 'Mental Health & Wellness Check', sessionType: 'Health', emirates: 'Ajman', date: '2026-09-15', status: 'Pending' },
  { id: '7', sessionTitle: 'Parenting Readiness Session', sessionType: 'Counseling', emirates: 'All Emirates', date: '2026-09-22', status: 'Published' },
  { id: '8', sessionTitle: 'Housing & Subsidy Guidance', sessionType: 'Legal', emirates: 'Ras Al Khaimah', date: '2026-10-05', status: 'Draft' },
  { id: '9', sessionTitle: 'Cultural Adjustment Support', sessionType: 'Counseling', emirates: 'All Emirates', date: '2026-10-12', status: 'Published' },
  { id: '10', sessionTitle: 'استشارات ما قبل الزواج', sessionType: 'Counseling', emirates: 'Fujairah', date: '2026-10-20', status: 'Published' },
  { id: '11', sessionTitle: 'Budgeting for Newlyweds', sessionType: 'Financial', emirates: 'All Emirates', date: '2026-10-28', status: 'Pending' },
  { id: '12', sessionTitle: 'Family Health & Nutrition', sessionType: 'Health', emirates: 'Dubai', date: '2026-11-05', status: 'Draft' },
  { id: '13', sessionTitle: 'Extended Family Relationship Management', sessionType: 'Counseling', emirates: 'All Emirates', date: '2026-11-15', status: 'Published' },
];

export const sessionTypes = ['Counseling', 'Financial', 'Legal', 'Health', 'Workshop'];
