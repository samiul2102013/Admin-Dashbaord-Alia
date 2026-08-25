'use client';

import { useDashboardLatestContent } from '@/hooks/useDashboard';
import { FileX2, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

export default function LatestContentTable() {
  const { data, isLoading } = useDashboardLatestContent();

  return (
    <div className="w-full bg-table-bg rounded-lg overflow-hidden">
      <div className="px-6 pt-5 pb-3">
        <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)]">
          Latest Content
        </h3>
        <p className="text-text-secondary text-[11px] font-normal leading-[100%] mt-1.5 font-[family-name:var(--font-manrope)]">
          Quickly monitor and manage the most recently published, updated, or modified content.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary">
              <th className="text-left px-4 py-3 text-table-header-text text-[13px] font-medium uppercase tracking-wide font-[family-name:var(--font-poppins)]">
                Title
              </th>
              <th className="text-left px-4 py-3 text-table-header-text text-[13px] font-medium uppercase tracking-wide font-[family-name:var(--font-poppins)]">
                Content Type
              </th>
              <th className="text-left px-4 py-3 text-table-header-text text-[13px] font-medium uppercase tracking-wide font-[family-name:var(--font-poppins)]">
                Module
              </th>
              <th className="text-left px-4 py-3 text-table-header-text text-[13px] font-medium uppercase tracking-wide font-[family-name:var(--font-poppins)]">
                Date & Time
              </th>
              <th className="text-left px-4 py-3 text-table-header-text text-[13px] font-medium uppercase tracking-wide font-[family-name:var(--font-poppins)]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Loader2 size={22} className="animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-text-secondary">
                    <FileX2 size={28} className="opacity-40" />
                    <span className="text-sm font-[family-name:var(--font-poppins)]">
                      No content available
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border-soft/50 last:border-b-0 hover:bg-black/[0.02] transition-colors"
                >
                  <td className="px-4 py-3.5 text-[12px] font-semibold text-black font-[family-name:var(--font-poppins)]">
                    {row.title}
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-text-secondary font-[family-name:var(--font-poppins)]">
                    {row.contentType}
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-text-secondary font-[family-name:var(--font-poppins)]">
                    {row.module}
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-text-secondary font-[family-name:var(--font-poppins)]">
                    {new Date(row.dateTime).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}