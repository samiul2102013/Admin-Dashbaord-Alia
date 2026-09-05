'use client';

import { useState } from 'react';
import NewsTable from '@/components/news/NewsTable';
import TabBar from '@/components/shared/TabBar';
import PageContentEditor from '@/components/shared/PageContentEditor';
import type { Tab } from '@/components/shared/TabBar';

const TABS: Tab[] = [
  { key: 'management', label: 'News' },
  { key: 'content', label: 'News Content' },
];

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        {activeTab === 'management' ? 'News' : 'News Content'}
      </h3>

      <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'management' && <NewsTable />}
      {activeTab === 'content' && <PageContentEditor presentationKey="news" />}
    </div>
  );
}
