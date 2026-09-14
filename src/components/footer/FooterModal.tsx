'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { saveFooterContent, footerKeys } from '@/lib/services/footer';
import type { FooterContent, FooterLink } from '@/types/footer';

interface FooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FooterContent | null;
}

const SECTIONS = [
  'Section Visibility',
  'Brand',
  'Quick Links',
  'Resources',
  'Contacts',
  'Bottom Bar',
] as const;

type SectionKey = (typeof SECTIONS)[number];

const FOOTER_VISIBILITY_KEYS = ['brand', 'quickLinks', 'resources', 'contacts', 'bottomBar'] as const;
const FOOTER_VISIBILITY_LABELS: Record<(typeof FOOTER_VISIBILITY_KEYS)[number], string> = {
  brand: 'Brand Column',
  quickLinks: 'Quick Links Column',
  resources: 'Resources Column',
  contacts: 'Contacts Column',
  bottomBar: 'Bottom Bar',
};

function cloneData(d: FooterContent | null): FooterContent {
  return d
    ? JSON.parse(JSON.stringify(d))
    : {
        id: '', logoUrl: '', brandText: '', brandTextAr: '', governmentLabel: '', governmentLabelAr: '',
        quickLinksHeading: '', quickLinksHeadingAr: '',
        resourceLinksHeading: '', resourceLinksHeadingAr: '',
        contactsHeading: '', contactsHeadingAr: '',
        quickLinks: [], resourceLinks: [],
        phone: '', email: '', address: '', addressAr: '',
        copyrightText: '', copyrightTextAr: '', builtForText: '', builtForTextAr: '',
        published: false,
        sectionVisibility: { brand: true, quickLinks: true, resources: true, contacts: true, bottomBar: true },
      };
}

export default function FooterModal({ isOpen, onClose, data }: FooterModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FooterContent>(() => cloneData(data));
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['Section Visibility', 'Brand']));

  useEffect(() => {
    if (isOpen) {
      setFormData(cloneData(data));
      setError('');
      setOpenSections(new Set(['Section Visibility', 'Brand']));
    }
  }, [isOpen, data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<FooterContent>) => saveFooterContent(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(footerKeys.content(), updated);
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const setField = (patch: Partial<FooterContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const setQuickLinks = (links: FooterLink[]) => setField({ quickLinks: links });
  const setResourceLinks = (links: FooterLink[]) => setField({ resourceLinks: links });

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleSubmit = () => {
    setError('');
    saveMutation.mutate(formData);
  };

  const isPending = saveMutation.isPending;

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={isPending}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
        Save All Changes
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Footer Content" footer={footer}>
      <div className="flex flex-col gap-4">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        <SectionBlock title="Section Visibility" isOpen={openSections.has('Section Visibility')} onToggle={() => toggleSection('Section Visibility')}>
          <p className="col-span-full text-xs text-text-secondary -mt-1 mb-1 font-[family-name:var(--font-poppins)]">
            Toggle each footer column on or off. When off it disappears from the user panel until you turn it back on — same as all other CMS models.
          </p>
          {FOOTER_VISIBILITY_KEYS.map((key) => {
            const vis = (formData.sectionVisibility as Record<string, boolean>) ?? { brand: true, quickLinks: true, resources: true, contacts: true, bottomBar: true };
            const enabled = vis[key] ?? true;
            return (
              <label key={key} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-secondary/30 bg-surface/50">
                <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">{FOOTER_VISIBILITY_LABELS[key]}</span>
                <input type="checkbox" checked={enabled} onChange={(e) => setField({ sectionVisibility: { ...vis, [key]: e.target.checked } } as Partial<FooterContent>)} className="w-5 h-5 accent-primary cursor-pointer" />
              </label>
            );
          })}
        </SectionBlock>

        <SectionBlock title="Brand Column" isOpen={openSections.has('Brand')} onToggle={() => toggleSection('Brand')}>
          <Input label="Logo URL" value={formData.logoUrl} onChange={(e) => setField({ logoUrl: e.target.value })} placeholder="Leave empty to use the default logo" />
          <Textarea label="Brand Text (EN)" rows={4} value={formData.brandText} onChange={(e) => setField({ brandText: e.target.value })} />
          <Textarea label="Brand Text (AR)" rows={4} value={formData.brandTextAr} onChange={(e) => setField({ brandTextAr: e.target.value })} />
          <Input label="Government Label (EN)" value={formData.governmentLabel} onChange={(e) => setField({ governmentLabel: e.target.value })} />
          <Input label="Government Label (AR)" value={formData.governmentLabelAr} onChange={(e) => setField({ governmentLabelAr: e.target.value })} />
        </SectionBlock>

        <SectionBlock title="Quick Links" isOpen={openSections.has('Quick Links')} onToggle={() => toggleSection('Quick Links')}>
          <Input label="Column Heading (EN)" value={formData.quickLinksHeading} onChange={(e) => setField({ quickLinksHeading: e.target.value })} />
          <Input label="Column Heading (AR)" value={formData.quickLinksHeadingAr} onChange={(e) => setField({ quickLinksHeadingAr: e.target.value })} />
          <LinksEditor links={formData.quickLinks || []} onChange={setQuickLinks} />
        </SectionBlock>

        <SectionBlock title="Resource Links" isOpen={openSections.has('Resources')} onToggle={() => toggleSection('Resources')}>
          <Input label="Column Heading (EN)" value={formData.resourceLinksHeading} onChange={(e) => setField({ resourceLinksHeading: e.target.value })} />
          <Input label="Column Heading (AR)" value={formData.resourceLinksHeadingAr} onChange={(e) => setField({ resourceLinksHeadingAr: e.target.value })} />
          <LinksEditor links={formData.resourceLinks || []} onChange={setResourceLinks} />
        </SectionBlock>

        <SectionBlock title="Contacts Column" isOpen={openSections.has('Contacts')} onToggle={() => toggleSection('Contacts')}>
          <Input label="Column Heading (EN)" value={formData.contactsHeading} onChange={(e) => setField({ contactsHeading: e.target.value })} />
          <Input label="Column Heading (AR)" value={formData.contactsHeadingAr} onChange={(e) => setField({ contactsHeadingAr: e.target.value })} />
          <Input label="Phone" value={formData.phone} onChange={(e) => setField({ phone: e.target.value })} />
          <Input label="Email" value={formData.email} onChange={(e) => setField({ email: e.target.value })} />
          <Input label="Address (EN)" value={formData.address} onChange={(e) => setField({ address: e.target.value })} />
          <Input label="Address (AR)" value={formData.addressAr} onChange={(e) => setField({ addressAr: e.target.value })} />
        </SectionBlock>

        <SectionBlock title="Bottom Bar" isOpen={openSections.has('Bottom Bar')} onToggle={() => toggleSection('Bottom Bar')}>
          <Input label="Copyright Text (EN)" value={formData.copyrightText} onChange={(e) => setField({ copyrightText: e.target.value })} />
          <Input label="Copyright Text (AR)" value={formData.copyrightTextAr} onChange={(e) => setField({ copyrightTextAr: e.target.value })} />
          <Input label="Built For Text (EN)" value={formData.builtForText} onChange={(e) => setField({ builtForText: e.target.value })} />
          <Input label="Built For Text (AR)" value={formData.builtForTextAr} onChange={(e) => setField({ builtForTextAr: e.target.value })} />
        </SectionBlock>

        <div className="flex items-center gap-3 p-4 rounded-lg border border-secondary/30 bg-surface/50">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setField({ published: e.target.checked })}
            className="w-5 h-5 accent-primary"
          />
          <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">Published (visible on the website)</span>
        </div>
      </div>
    </Modal>
  );
}

interface LinksEditorProps {
  links: FooterLink[];
  onChange: (links: FooterLink[]) => void;
}

function LinksEditor({ links, onChange }: LinksEditorProps) {
  return (
    <div className="flex flex-col gap-3 col-span-full">
      {links.map((link, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-start">
          <Input
            label="Label (EN)"
            value={link.label}
            onChange={(e) => {
              const next = [...links];
              next[i] = { ...link, label: e.target.value };
              onChange(next);
            }}
          />
          <Input
            label="Label (AR)"
            value={link.labelAr ?? ''}
            onChange={(e) => {
              const next = [...links];
              next[i] = { ...link, labelAr: e.target.value };
              onChange(next);
            }}
          />
          <Input
            label="Link (href)"
            value={link.href}
            onChange={(e) => {
              const next = [...links];
              next[i] = { ...link, href: e.target.value };
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(links.filter((_, idx) => idx !== i))}
            className="mt-[26px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
            aria-label="Remove link"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      ))}
      <div>
        <Button variant="ghost" size="sm" onClick={() => onChange([...links, { label: '', labelAr: '', href: '' }])}>
          <Plus size={16} />
          Add link
        </Button>
      </div>
    </div>
  );
}

function SectionBlock({ title, isOpen, onToggle, children }: { title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-secondary/30 bg-surface/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary/10 transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronDown size={16} className="text-text-secondary" /> : <ChevronRight size={16} className="text-text-secondary" />}
        <span className="text-sm font-bold font-[family-name:var(--font-manrope)]">{title}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}
