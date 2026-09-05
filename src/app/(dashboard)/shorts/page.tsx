'use client';

import { useState } from 'react';
import ShortsTable from '@/components/shorts/ShortsTable';
import TabBar from '@/components/shared/TabBar';
import PageContentEditor from '@/components/shared/PageContentEditor';
import type { Tab } from '@/components/shared/TabBar';

const TABS: Tab[] = [
  { key: 'management', label: 'Shorts' },
  { key: 'content', label: 'Shorts Content' },
];

export default function ShortsPage() {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        {activeTab === 'management' ? 'Shorts' : 'Shorts Content'}
      </h3>

      <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'management' && <ShortsTable />}
      {activeTab === 'content' && <PageContentEditor presentationKey="shorts" />}
    </div>
  );
}
