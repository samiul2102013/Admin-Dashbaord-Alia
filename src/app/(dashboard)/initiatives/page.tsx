'use client';

import { useState } from 'react';
import InitiativesTable from '@/components/initiatives/InitiativesTable';
import TabBar from '@/components/shared/TabBar';
import PageContentEditor from '@/components/shared/PageContentEditor';
import type { Tab } from '@/components/shared/TabBar';

const TABS: Tab[] = [
  { key: 'management', label: 'Upcoming Initiatives' },
  { key: 'content', label: 'Initiatives Page Content' },
];

export default function InitiativesPage() {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        {activeTab === 'management' ? 'Upcoming Initiatives' : 'Initiatives Page Content'}
      </h3>

      <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'management' && <InitiativesTable />}
      {activeTab === 'content' && <PageContentEditor presentationKey="initiatives" />}
    </div>
  );
}
