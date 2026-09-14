'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import Button from '@/components/shared/Button';
import Select from '@/components/shared/Select';
import { getErrorMessage } from '@/lib/api-client';
import { getFooterContent, footerKeys } from '@/lib/services/footer';
import FooterModal from './FooterModal';
import type { Column } from '@/components/shared/DataTable';
import type { FooterContent } from '@/types/footer';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Published', label: 'Published' },
  { value: 'Draft', label: 'Draft' },
];

const SECTION_OPTIONS = [
  { value: '', label: 'All sections' },
  { value: 'brand', label: 'Brand' },
  { value: 'quickLinks', label: 'Quick Links' },
  { value: 'resources', label: 'Resources' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'bottomBar', label: 'Bottom Bar' },
];

const columns: Column<FooterContent>[] = [
  {
    header: 'Logo',
    accessor: (row) =>
      row.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.logoUrl} alt="Logo" className="h-8 w-12 object-contain bg-secondary/20 rounded" />
      ) : (
        <span className="text-[11px] text-text-secondary">Default</span>
      ),
    className: 'w-[80px]',
  },
  {
    header: 'Brand Text (EN) / (AR)',
    accessor: (row) => (
      <div className="flex flex-col gap-1 max-w-[240px]">
        <span className="font-semibold text-navy truncate">{row.brandText || '—'}</span>
        <span className="text-[11px] text-text-secondary truncate" dir="rtl">{row.brandTextAr || '—'}</span>
        <span className="text-[11px] text-text-secondary truncate">{row.governmentLabel} {row.governmentLabelAr ? ` / ${row.governmentLabelAr}` : ''}</span>
      </div>
    ),
    className: 'min-w-[240px]',
  },
  {
    header: 'Quick Links',
    accessor: (row) => (
      <div className="flex flex-col gap-1 max-w-[220px]">
        <span className="text-xs font-bold text-navy truncate">{row.quickLinksHeading || 'Quick Links'} {row.quickLinksHeadingAr ? ` / ${row.quickLinksHeadingAr}` : ''}</span>
        {(row.quickLinks || []).slice(0, 5).map((l, i) => (
          <span key={i} className="text-[11px] truncate">{l.label}{l.labelAr ? ` / ${l.labelAr}` : ''} → {l.href}</span>
        ))}
        {(row.quickLinks?.length ?? 0) > 5 && <span className="text-[11px] text-text-secondary">+{row.quickLinks!.length - 5} more</span>}
        {(!row.quickLinks || row.quickLinks.length === 0) && <span className="text-[11px] text-text-secondary">No links</span>}
      </div>
    ),
    className: 'min-w-[220px]',
  },
  {
    header: 'Resources',
    accessor: (row) => (
      <div className="flex flex-col gap-1 max-w-[220px]">
        <span className="text-xs font-bold text-navy truncate">{row.resourceLinksHeading || 'Resources'} {row.resourceLinksHeadingAr ? ` / ${row.resourceLinksHeadingAr}` : ''}</span>
        {(row.resourceLinks || []).slice(0, 5).map((l, i) => (
          <span key={i} className="text-[11px] truncate">{l.label}{l.labelAr ? ` / ${l.labelAr}` : ''} → {l.href}</span>
        ))}
        {(row.resourceLinks?.length ?? 0) > 5 && <span className="text-[11px] text-text-secondary">+{row.resourceLinks!.length - 5} more</span>}
        {(!row.resourceLinks || row.resourceLinks.length === 0) && <span className="text-[11px] text-text-secondary">No links</span>}
      </div>
    ),
    className: 'min-w-[220px]',
  },
  {
    header: 'Contacts',
    accessor: (row) => (
      <div className="flex flex-col gap-1 max-w-[200px]">
        <span className="text-xs font-bold text-navy truncate">{row.contactsHeading || 'Contacts'} {row.contactsHeadingAr ? ` / ${row.contactsHeadingAr}` : ''}</span>
        <span className="text-[11px] truncate">📞 {row.phone || '—'}</span>
        <span className="text-[11px] truncate">✉️ {row.email || '—'}</span>
        <span className="text-[11px] truncate">{row.address || '—'} {row.addressAr ? ` / ${row.addressAr}` : ''}</span>
      </div>
    ),
    className: 'min-w-[200px]',
  },
  {
    header: 'Bottom Bar',
    accessor: (row) => (
      <div className="flex flex-col gap-1 max-w-[180px]">
        <span className="text-[11px] truncate">{row.copyrightText || '—'} {row.copyrightTextAr ? ` / ${row.copyrightTextAr}` : ''}</span>
        <span className="text-[11px] truncate">{row.builtForText || '—'} {row.builtForTextAr ? ` / ${row.builtForTextAr}` : ''}</span>
      </div>
    ),
    className: 'min-w-[180px]',
  },
  {
    header: 'Visibility',
    accessor: (row) => {
      const vis = row.sectionVisibility ?? { brand: true, quickLinks: true, resources: true, contacts: true, bottomBar: true };
      const hidden = Object.entries(vis).filter(([, v]) => v === false).map(([k]) => k).join(', ');
      return hidden ? `Hidden: ${hidden}` : 'All visible';
    },
    className: 'max-w-[160px] truncate text-[11px]',
  },
  {
    header: 'Published',
    accessor: (row) => (
      <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${row.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {row.published ? 'Published' : 'Draft'}
      </span>
    ),
  },
];

export default function FooterContentPanel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [section, setSection] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: footerKeys.content(),
    queryFn: getFooterContent,
  });

  // Client-side filtering like all other admin tables — covers EVERY user-panel footer field
  const tableData = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    const targetPublished = status ? status === 'Published' : null;
    const haystackAll = [
      data.brandText, data.brandTextAr, data.governmentLabel, data.governmentLabelAr,
      data.quickLinksHeading, data.quickLinksHeadingAr, data.resourceLinksHeading, data.resourceLinksHeadingAr,
      data.contactsHeading, data.contactsHeadingAr,
      ...(data.quickLinks?.map((l) => `${l.label} ${l.labelAr ?? ''} ${l.href}`) ?? []),
      ...(data.resourceLinks?.map((l) => `${l.label} ${l.labelAr ?? ''} ${l.href}`) ?? []),
      data.phone, data.email, data.address, data.addressAr,
      data.copyrightText, data.copyrightTextAr, data.builtForText, data.builtForTextAr,
      data.logoUrl,
    ].join(' ').toLowerCase();

    // Section-specific haystack when a section filter is active
    const haystack = (() => {
      if (!section) return haystackAll;
      if (section === 'brand') return [data.brandText, data.brandTextAr, data.governmentLabel, data.governmentLabelAr, data.logoUrl].join(' ').toLowerCase();
      if (section === 'quickLinks') return [data.quickLinksHeading, data.quickLinksHeadingAr, ...(data.quickLinks?.map((l) => `${l.label} ${l.labelAr ?? ''} ${l.href}`) ?? [])].join(' ').toLowerCase();
      if (section === 'resources') return [data.resourceLinksHeading, data.resourceLinksHeadingAr, ...(data.resourceLinks?.map((l) => `${l.label} ${l.labelAr ?? ''} ${l.href}`) ?? [])].join(' ').toLowerCase();
      if (section === 'contacts') return [data.contactsHeading, data.contactsHeadingAr, data.phone, data.email, data.address, data.addressAr].join(' ').toLowerCase();
      if (section === 'bottomBar') return [data.copyrightText, data.copyrightTextAr, data.builtForText, data.builtForTextAr].join(' ').toLowerCase();
      return haystackAll;
    })();

    if (q && !haystack.includes(q)) return [];
    if (targetPublished !== null && data.published !== targetPublished) return [];
    return [data];
  }, [data, search, status, section]);

  const filteredCount = tableData.length;
  const totalCount = data ? 1 : 0;

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-text-secondary text-sm font-[family-name:var(--font-poppins)]">
          {data
            ? 'Edit every footer field that appears on the website — all user-panel data is editable here, same as other CMS models.'
            : 'No footer content yet. Create it to get started.'}
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
              Create Footer Content
            </>
          )}
        </Button>
      </div>

      {/* Filter bar — same pattern as other CMS tables: search + status + section. Every user-panel footer field is filterable. */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            placeholder="Search footer — brand, quick links, resources, contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-[10px] border border-secondary/40 bg-surface text-sm outline-none focus:border-primary transition-colors font-[family-name:var(--font-poppins)]"
          />
        </div>
        <div className="w-44">
          <Select placeholder="All statuses" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
        <div className="w-44">
          <Select placeholder="All sections" options={SECTION_OPTIONS} value={section} onChange={(e) => setSection(e.target.value)} />
        </div>
        {search || status || section ? (
          <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
            {filteredCount} / {totalCount} matched
          </span>
        ) : null}
        {(search || status || section) && filteredCount === 0 && totalCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus(''); setSection(''); }}>
            Clear filters
          </Button>
        )}
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
        {!isLoading && data && tableData.length === 0 && (
          <p className="text-center text-sm text-text-secondary py-6 font-[family-name:var(--font-poppins)]">
            No footer content matches your filters. Clear search or status to see the footer.
          </p>
        )}
      </div>

      <FooterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} data={data ?? null} />
    </div>
  );
}
