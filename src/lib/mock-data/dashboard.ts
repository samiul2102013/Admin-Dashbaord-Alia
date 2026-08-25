import type { StatItem, MonthlyData, DashboardContent } from '@/types/dashboard';

export const statCards: StatItem[] = [
  { id: '1', label: 'Total Short Videos', value: '1,248', icon: 'Video' },
  { id: '2', label: 'Total Initiatives', value: '36', icon: 'Target' },
  { id: '3', label: 'Total News Articles', value: '512', icon: 'FileText' },
  { id: '4', label: 'Active Consultations', value: '89', icon: 'MessageCircle' },
  { id: '5', label: 'Total Emirates', value: '7', icon: 'MapPin' },
  { id: '6', label: 'Registered Users', value: '24.5K', icon: 'Users' },
];

export const monthlyData: MonthlyData[] = [
  { month: 'Jan', revenue: 18500, users: 1200 },
  { month: 'Feb', revenue: 22300, users: 1500 },
  { month: 'Mar', revenue: 19800, users: 1350 },
  { month: 'Apr', revenue: 27600, users: 1800 },
  { month: 'May', revenue: 31200, users: 2100 },
  { month: 'Jun', revenue: 28900, users: 1950 },
  { month: 'Jul', revenue: 35400, users: 2400 },
  { month: 'Aug', revenue: 33800, users: 2250 },
  { month: 'Sep', revenue: 40100, users: 2800 },
  { month: 'Oct', revenue: 38700, users: 2600 },
  { month: 'Nov', revenue: 42300, users: 3100 },
  { month: 'Dec', revenue: 45600, users: 3500 },
];

export const latestContent: DashboardContent[] = [
  {
    id: '1',
    title: 'Marriage Support Fund',
    contentType: 'Initiative',
    module: 'Government Initiative',
    dateTime: '2026-07-28 14:30',
    status: 'Published',
  },
  {
    id: '2',
    title: 'Family Counseling Workshop',
    contentType: 'Event',
    module: 'Community Program',
    dateTime: '2026-07-27 10:00',
    status: 'Published',
  },
  {
    id: '3',
    title: 'New Housing Subsidy Guidelines',
    contentType: 'News',
    module: 'Policy Update',
    dateTime: '2026-07-26 09:15',
    status: 'Draft',
  },
  {
    id: '4',
    title: 'Emirati Wedding Traditions',
    contentType: 'Video',
    module: 'Cultural Content',
    dateTime: '2026-07-25 16:45',
    status: 'Published',
  },
  {
    id: '5',
    title: 'Consultation Booking System',
    contentType: 'Initiative',
    module: 'Digital Service',
    dateTime: '2026-07-24 11:20',
    status: 'Pending',
  },
];
