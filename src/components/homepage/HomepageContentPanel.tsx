'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { getHomepageContent, homepageKeys } from '@/lib/services/homepage';
import HomepageModal from './HomepageModal';
import type { Column } from '@/components/shared/DataTable';
import type { HomepageContent } from '@/types/homepage';

const columns: Column<HomepageContent>[] = [
  { header: 'Hero Title', accessor: 'heroTitle', className: 'font-semibold text-navy max-w-[280px] truncate' },
  { header: 'Hero Subtitle', accessor: 'heroSubtitle', className: 'max-w-[240px] truncate' },
  { header: 'News Title', accessor: 'newsTitle', className: 'max-w-[200px] truncate' },
  { header: 'CTA Title', accessor: 'ctaTitle', className: 'max-w-[200px] truncate' },
  {
    header: 'Published',
    accessor: (row) => (
      <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${row.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {row.published ? 'Published' : 'Draft'}
      </span>
    ),
  },
];

export default function HomepageContentPanel() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: homepageKeys.content(),
    queryFn: getHomepageContent,
  });

  const tableData = data ? [data] : [];

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-text-secondary text-sm font-[family-name:var(--font-poppins)]">
          {data
            ? 'Edit the homepage content that appears on the website.'
            : 'No homepage content yet. Create it to get started.'}
        </p>
        <Button onClick={() => setModalOpen(true)}>
          {data ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Content
            </>
          ) : (
            <>
              <Plus size={18} />
              Create Homepage Content
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">
          {getErrorMessage(error)}
        </p>
      )}

      <div className="flex-1 overflow-auto">
        <DataTable
          columns={columns}
          data={tableData}
          isLoading={isLoading}
          onEdit={() => setModalOpen(true)}
        />
      </div>

      <HomepageModal isOpen={modalOpen} onClose={() => setModalOpen(false)} data={data ?? null} />
    </div>
  );
}
