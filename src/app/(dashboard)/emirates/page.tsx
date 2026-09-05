'use client';

import { useState } from 'react';
import EmiratesTable from '@/components/emirates/EmiratesTable';
import TabBar from '@/components/shared/TabBar';
import PageContentEditor from '@/components/shared/PageContentEditor';
import type { Tab } from '@/components/shared/TabBar';

const TABS: Tab[] = [
  { key: 'management', label: 'Emirates' },
  { key: 'content', label: 'Emirates Content' },
];

export default function EmiratesPage() {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        {activeTab === 'management' ? 'Emirates' : 'Emirates Content'}
      </h3>

      <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'management' && <EmiratesTable />}
      {activeTab === 'content' && <PageContentEditor presentationKey="emirates" />}
    </div>
  );
}
