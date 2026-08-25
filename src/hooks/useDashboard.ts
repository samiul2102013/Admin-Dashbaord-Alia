'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDashboardAnalytics,
  getDashboardLatestContent,
  getDashboardStats,
} from '@/lib/services/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => getDashboardStats(),
  });
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => getDashboardAnalytics(),
  });
}

export function useDashboardLatestContent() {
  return useQuery({
    queryKey: ['dashboard', 'latest-content'],
    queryFn: () => getDashboardLatestContent(),
  });
}