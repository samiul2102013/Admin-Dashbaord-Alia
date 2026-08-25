export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  icon: string;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  users: number;
}

export interface DashboardContent {
  id: string;
  title: string;
  contentType: string;
  module: string;
  dateTime: string;
  status: 'Published' | 'Draft' | 'Pending';
}