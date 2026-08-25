import type { DashboardContent, MonthlyData, StatItem } from '@/types/dashboard';
import apiClient from '@/lib/api-client';

export async function getDashboardStats(): Promise<StatItem[]> {
  const { data } = await apiClient.get<StatItem[]>('/admin/dashboard/stats');
  return data;
}

export async function getDashboardAnalytics(): Promise<MonthlyData[]> {
  const { data } = await apiClient.get<MonthlyData[]>('/admin/dashboard/analytics');
  return data;
}

export async function getDashboardLatestContent(): Promise<DashboardContent[]> {
  const { data } = await apiClient.get<DashboardContent[]>('/admin/dashboard/latest-content');
  return data;
}