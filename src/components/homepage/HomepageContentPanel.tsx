'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Loader2 } from 'lucide-react';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { getHomepageContent, homepageKeys } from '@/lib/services/homepage';
import HomepageModal from './HomepageModal';

export default function HomepageContentPanel() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: homepageKeys.content(),
    queryFn: getHomepageContent,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">
        {getErrorMessage(error)}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm font-[family-name:var(--font-poppins)]">
            {data
              ? 'Homepage content is synced with the database. Click edit to make changes.'
              : 'No homepage content found. Click the button below to create the default homepage content.'}
          </p>
          <Button onClick={() => setModalOpen(true)}>
            <Pencil size={16} />
            {data ? 'Edit Homepage Content' : 'Create Homepage Content'}
          </Button>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Hero Title" value={data.heroTitle} />
            <SummaryCard title="Stats" value={`${data.stats?.length ?? 0} items`} />
            <SummaryCard title="News Title" value={data.newsTitle} />
            <SummaryCard title="Initiatives Title" value={data.initiativesTitle} />
            <SummaryCard title="Consultations Title" value={data.consultationsTitle} />
            <SummaryCard title="Emirates Title" value={data.emiratesTitle} />
            <SummaryCard title="CTA Title" value={data.ctaTitle} />
            <SummaryCard title="Status" value={data.published ? 'Published' : 'Draft'} />
          </div>
        )}
      </div>

      <HomepageModal isOpen={modalOpen} onClose={() => setModalOpen(false)} data={data ?? null} />
    </>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 rounded-lg border border-secondary/30 bg-surface/50">
      <p className="text-[11px] font-bold text-text-secondary uppercase mb-1 font-[family-name:var(--font-manrope)]">{title}</p>
      <p className="text-sm font-semibold text-navy truncate font-[family-name:var(--font-poppins)]">{value || '—'}</p>
    </div>
  );
}
