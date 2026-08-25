'use client';

import StatCard from './StatCard';
import { useDashboardStats } from '@/hooks/useDashboard';
import { FileX2 } from 'lucide-react';

export default function StatsGrid() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex gap-[22px] w-full">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex-1 min-w-[160px] h-[100px] bg-surface rounded-lg border border-border-soft animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 min-w-[160px] h-[100px] bg-surface rounded-lg border border-border-soft flex items-center justify-center gap-2 text-text-secondary">
        <FileX2 size={16} className="opacity-50" />
        <span className="text-xs font-[family-name:var(--font-manrope)]">
          Failed to load stats
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-[22px] w-full">
      {data.map((item) => (
        <StatCard key={item.id} item={item} />
      ))}
    </div>
  );
}