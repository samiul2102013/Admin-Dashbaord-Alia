'use client';

import LineGraph from './LineGraph';
import { useDashboardAnalytics } from '@/hooks/useDashboard';
import { Loader2, FileX2 } from 'lucide-react';

export default function AnalyticalPerformance() {
  const { data, isLoading } = useDashboardAnalytics();

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)]">
            Analytical Performance Map
          </h3>
          <p className="text-text-secondary text-[11px] font-normal leading-[100%] mt-1.5 font-[family-name:var(--font-manrope)]">
            Visualizing registered users & community activity metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] bg-primary rounded" />
            <span className="text-[10px] text-text-secondary font-[family-name:var(--font-manrope)]">
              Monthly Revenue
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] bg-gold rounded" />
            <span className="text-[10px] text-text-secondary font-[family-name:var(--font-manrope)]">
              Monthly Users
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-[320px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 size={26} className="animate-spin text-primary" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center gap-2 text-text-secondary">
            <FileX2 size={20} className="opacity-40" />
            <span className="text-sm font-[family-name:var(--font-manrope)]">
              No analytics data available
            </span>
          </div>
        ) : (
          <LineGraph data={data} />
        )}
      </div>
    </div>
  );
}