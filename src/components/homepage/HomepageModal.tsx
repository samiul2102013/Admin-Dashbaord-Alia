'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { saveHomepageContent, homepageKeys } from '@/lib/services/homepage';
import type { HomepageContent, FloatingCard, StatItem } from '@/types/homepage';

interface HomepageModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HomepageContent | null;
}

const SECTIONS = [
  'Hero',
  'Stats',
  'Shorts Header',
  'News Header',
  'Initiatives Header',
  'Consultations Header',
  'Emirates Header',
  'CTA Section',
] as const;

type SectionKey = (typeof SECTIONS)[number];

function cloneData(d: HomepageContent | null): HomepageContent {
  return d
    ? JSON.parse(JSON.stringify(d))
    : {
        id: '',
        heroEyebrow: '', heroEyebrowAr: '', heroTitle: '', heroTitleAr: '',
        heroSubtitle: '', heroSubtitleAr: '', heroSearchPlaceholder: '', heroSearchPlaceholderAr: '',
        heroSearchButton: '', heroSearchButtonAr: '', heroPrimaryCtaLabel: '', heroPrimaryCtaLabelAr: '',
        heroPrimaryCtaLink: '', heroSecondaryCtaLabel: '', heroSecondaryCtaLabelAr: '', heroSecondaryCtaLink: '',
        heroImage: '', heroImageAlt: '', heroFloatingCards: [],
        stats: [],
        shortsTitle: '', shortsTitleAr: '', shortsSubtitle: '', shortsSubtitleAr: '',
        shortsCtaLabel: '', shortsCtaLabelAr: '', shortsEmptyText: '', shortsEmptyTextAr: '',
        newsTitle: '', newsTitleAr: '', newsSubtitle: '', newsSubtitleAr: '',
        newsCtaLabel: '', newsCtaLabelAr: '',
        initiativesTitle: '', initiativesTitleAr: '', initiativesSubtitle: '', initiativesSubtitleAr: '',
        initiativesCtaLabel: '', initiativesCtaLabelAr: '',
        consultationsTitle: '', consultationsTitleAr: '', consultationsSubtitle: '', consultationsSubtitleAr: '',
        consultationsCtaLabel: '', consultationsCtaLabelAr: '',
        consultationsFreeTab: '', consultationsFreeTabAr: '', consultationsPaidTab: '', consultationsPaidTabAr: '',
        emiratesTitle: '', emiratesTitleAr: '', emiratesSubtitle: '', emiratesSubtitleAr: '',
        emiratesCapitalLabel: '', emiratesCapitalLabelAr: '',
        emiratesHeadquartersLabel: '', emiratesHeadquartersLabelAr: '',
        emiratesCtaLabel: '', emiratesCtaLabelAr: '',
        ctaTitle: '', ctaTitleAr: '', ctaSubtitle: '', ctaSubtitleAr: '',
        ctaPrimaryLabel: '', ctaPrimaryLabelAr: '', ctaPrimaryLink: '',
        ctaSecondaryLabel: '', ctaSecondaryLabelAr: '', ctaSecondaryLink: '',
        published: false,
      };
}

export default function HomepageModal({ isOpen, onClose, data }: HomepageModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HomepageContent>(() => cloneData(data));
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['Hero']));

  useEffect(() => {
    if (isOpen) {
      setFormData(cloneData(data));
      setError('');
      setOpenSections(new Set(['Hero']));
    }
  }, [isOpen, data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<HomepageContent>) => saveHomepageContent(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(homepageKeys.content(), updated);
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const setField = (patch: Partial<HomepageContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const setStat = (index: number, patch: Partial<StatItem>) => {
    setFormData((prev) => {
      const stats = [...(prev.stats || [])];
      while (stats.length <= index) stats.push({ value: '', title: '', titleAr: '', subtitle: '', subtitleAr: '' });
      stats[index] = { ...stats[index], ...patch };
      return { ...prev, stats };
    });
  };

  const setCard = (index: number, patch: Partial<FloatingCard>) => {
    setFormData((prev) => {
      const cards = [...(prev.heroFloatingCards || [])];
      while (cards.length <= index) cards.push({ label: '', labelAr: '', sublabel: '', sublabelAr: '' });
      cards[index] = { ...cards[index], ...patch };
      return { ...prev, heroFloatingCards: cards };
    });
  };

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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Homepage Content" footer={footer}>
      <div className="flex flex-col gap-4">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        {/* Hero Section */}
        <SectionBlock title="Hero Section" isOpen={openSections.has('Hero')} onToggle={() => toggleSection('Hero')}>
          <Input label="Eyebrow (EN)" value={formData.heroEyebrow} onChange={(e) => setField({ heroEyebrow: e.target.value })} />
          <Input label="Eyebrow (AR)" value={formData.heroEyebrowAr} onChange={(e) => setField({ heroEyebrowAr: e.target.value })} />
          <Input label="Title (EN)" value={formData.heroTitle} onChange={(e) => setField({ heroTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.heroTitleAr} onChange={(e) => setField({ heroTitleAr: e.target.value })} />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.heroSubtitle} onChange={(e) => setField({ heroSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.heroSubtitleAr} onChange={(e) => setField({ heroSubtitleAr: e.target.value })} />
          <Input label="Search Placeholder (EN)" value={formData.heroSearchPlaceholder} onChange={(e) => setField({ heroSearchPlaceholder: e.target.value })} />
          <Input label="Search Placeholder (AR)" value={formData.heroSearchPlaceholderAr} onChange={(e) => setField({ heroSearchPlaceholderAr: e.target.value })} />
          <Input label="Search Button (EN)" value={formData.heroSearchButton} onChange={(e) => setField({ heroSearchButton: e.target.value })} />
          <Input label="Search Button (AR)" value={formData.heroSearchButtonAr} onChange={(e) => setField({ heroSearchButtonAr: e.target.value })} />
          <Input label="Primary CTA Label (EN)" value={formData.heroPrimaryCtaLabel} onChange={(e) => setField({ heroPrimaryCtaLabel: e.target.value })} />
          <Input label="Primary CTA Label (AR)" value={formData.heroPrimaryCtaLabelAr} onChange={(e) => setField({ heroPrimaryCtaLabelAr: e.target.value })} />
          <Input label="Primary CTA Link" value={formData.heroPrimaryCtaLink} onChange={(e) => setField({ heroPrimaryCtaLink: e.target.value })} />
          <Input label="Secondary CTA Label (EN)" value={formData.heroSecondaryCtaLabel} onChange={(e) => setField({ heroSecondaryCtaLabel: e.target.value })} />
          <Input label="Secondary CTA Label (AR)" value={formData.heroSecondaryCtaLabelAr} onChange={(e) => setField({ heroSecondaryCtaLabelAr: e.target.value })} />
          <Input label="Secondary CTA Link" value={formData.heroSecondaryCtaLink} onChange={(e) => setField({ heroSecondaryCtaLink: e.target.value })} />
          <Input label="Hero Image URL" value={formData.heroImage} onChange={(e) => setField({ heroImage: e.target.value })} />
          <Input label="Hero Image Alt" value={formData.heroImageAlt} onChange={(e) => setField({ heroImageAlt: e.target.value })} />

          <div className="col-span-full mt-2">
            <h5 className="text-xs font-bold text-text-secondary uppercase mb-3 font-[family-name:var(--font-manrope)]">Floating Cards</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => {
                const card = formData.heroFloatingCards?.[i] || { label: '', labelAr: '', sublabel: '', sublabelAr: '' };
                return (
                  <div key={i} className="p-3 rounded-lg border border-secondary/30 bg-surface/50">
                    <p className="text-[11px] font-bold text-text-secondary mb-2 font-[family-name:var(--font-manrope)]">Card {i + 1}</p>
                    <Input label="Label (EN)" value={card.label} onChange={(e) => setCard(i, { label: e.target.value })} />
                    <Input label="Label (AR)" value={card.labelAr} onChange={(e) => setCard(i, { labelAr: e.target.value })} />
                    <Input label="Sublabel (EN)" value={card.sublabel} onChange={(e) => setCard(i, { sublabel: e.target.value })} />
                    <Input label="Sublabel (AR)" value={card.sublabelAr} onChange={(e) => setCard(i, { sublabelAr: e.target.value })} />
                  </div>
                );
              })}
            </div>
          </div>
        </SectionBlock>

        {/* Stats Section */}
        <SectionBlock title="Stats Section (FeatureGrid)" isOpen={openSections.has('Stats')} onToggle={() => toggleSection('Stats')}>
          {[0, 1, 2, 3].map((i) => {
            const stat = formData.stats?.[i] || { value: '', title: '', titleAr: '', subtitle: '', subtitleAr: '' };
            return (
              <div key={i} className="col-span-full p-3 rounded-lg border border-secondary/30 bg-surface/50">
                <p className="text-[11px] font-bold text-text-secondary mb-2 font-[family-name:var(--font-manrope)]">Stat {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Value" value={stat.value} onChange={(e) => setStat(i, { value: e.target.value })} />
                  <Input label="Title (EN)" value={stat.title} onChange={(e) => setStat(i, { title: e.target.value })} />
                  <Input label="Title (AR)" value={stat.titleAr} onChange={(e) => setStat(i, { titleAr: e.target.value })} />
                  <Input label="Subtitle (EN)" value={stat.subtitle} onChange={(e) => setStat(i, { subtitle: e.target.value })} />
                  <Input label="Subtitle (AR)" value={stat.subtitleAr} onChange={(e) => setStat(i, { subtitleAr: e.target.value })} />
                </div>
              </div>
            );
          })}
        </SectionBlock>

        {/* Shorts Header */}
        <SectionBlock title="Shorts Section Header" isOpen={openSections.has('Shorts Header')} onToggle={() => toggleSection('Shorts Header')}>
          <Input label="Title (EN)" value={formData.shortsTitle} onChange={(e) => setField({ shortsTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.shortsTitleAr} onChange={(e) => setField({ shortsTitleAr: e.target.value })} />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.shortsSubtitle} onChange={(e) => setField({ shortsSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.shortsSubtitleAr} onChange={(e) => setField({ shortsSubtitleAr: e.target.value })} />
          <Input label="CTA Label (EN)" value={formData.shortsCtaLabel} onChange={(e) => setField({ shortsCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.shortsCtaLabelAr} onChange={(e) => setField({ shortsCtaLabelAr: e.target.value })} />
          <Input label="Empty Text (EN)" value={formData.shortsEmptyText} onChange={(e) => setField({ shortsEmptyText: e.target.value })} />
          <Input label="Empty Text (AR)" value={formData.shortsEmptyTextAr} onChange={(e) => setField({ shortsEmptyTextAr: e.target.value })} />
        </SectionBlock>

        {/* News Header */}
        <SectionBlock title="News Section Header" isOpen={openSections.has('News Header')} onToggle={() => toggleSection('News Header')}>
          <Input label="Title (EN)" value={formData.newsTitle} onChange={(e) => setField({ newsTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.newsTitleAr} onChange={(e) => setField({ newsTitleAr: e.target.value })} />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.newsSubtitle} onChange={(e) => setField({ newsSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.newsSubtitleAr} onChange={(e) => setField({ newsSubtitleAr: e.target.value })} />
          <Input label="CTA Label (EN)" value={formData.newsCtaLabel} onChange={(e) => setField({ newsCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.newsCtaLabelAr} onChange={(e) => setField({ newsCtaLabelAr: e.target.value })} />
        </SectionBlock>

        {/* Initiatives Header */}
        <SectionBlock title="Initiatives Section Header" isOpen={openSections.has('Initiatives Header')} onToggle={() => toggleSection('Initiatives Header')}>
          <Input label="Title (EN)" value={formData.initiativesTitle} onChange={(e) => setField({ initiativesTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.initiativesTitleAr} onChange={(e) => setField({ initiativesTitleAr: e.target.value })} />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.initiativesSubtitle} onChange={(e) => setField({ initiativesSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.initiativesSubtitleAr} onChange={(e) => setField({ initiativesSubtitleAr: e.target.value })} />
          <Input label="CTA Label (EN)" value={formData.initiativesCtaLabel} onChange={(e) => setField({ initiativesCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.initiativesCtaLabelAr} onChange={(e) => setField({ initiativesCtaLabelAr: e.target.value })} />
        </SectionBlock>

        {/* Consultations Header */}
        <SectionBlock title="Consultations Section Header" isOpen={openSections.has('Consultations Header')} onToggle={() => toggleSection('Consultations Header')}>
          <Input label="Title (EN)" value={formData.consultationsTitle} onChange={(e) => setField({ consultationsTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.consultationsTitleAr} onChange={(e) => setField({ consultationsTitleAr: e.target.value })} />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.consultationsSubtitle} onChange={(e) => setField({ consultationsSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.consultationsSubtitleAr} onChange={(e) => setField({ consultationsSubtitleAr: e.target.value })} />
          <Input label="CTA Label (EN)" value={formData.consultationsCtaLabel} onChange={(e) => setField({ consultationsCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.consultationsCtaLabelAr} onChange={(e) => setField({ consultationsCtaLabelAr: e.target.value })} />
          <Input label="Free Tab (EN)" value={formData.consultationsFreeTab} onChange={(e) => setField({ consultationsFreeTab: e.target.value })} />
          <Input label="Free Tab (AR)" value={formData.consultationsFreeTabAr} onChange={(e) => setField({ consultationsFreeTabAr: e.target.value })} />
          <Input label="Paid Tab (EN)" value={formData.consultationsPaidTab} onChange={(e) => setField({ consultationsPaidTab: e.target.value })} />
          <Input label="Paid Tab (AR)" value={formData.consultationsPaidTabAr} onChange={(e) => setField({ consultationsPaidTabAr: e.target.value })} />
        </SectionBlock>

        {/* Emirates Header */}
        <SectionBlock title="Emirates Section Header" isOpen={openSections.has('Emirates Header')} onToggle={() => toggleSection('Emirates Header')}>
          <Input label="Title (EN)" value={formData.emiratesTitle} onChange={(e) => setField({ emiratesTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.emiratesTitleAr} onChange={(e) => setField({ emiratesTitleAr: e.target.value })} />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.emiratesSubtitle} onChange={(e) => setField({ emiratesSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.emiratesSubtitleAr} onChange={(e) => setField({ emiratesSubtitleAr: e.target.value })} />
          <Input label="Capital Region Label (EN)" value={formData.emiratesCapitalLabel} onChange={(e) => setField({ emiratesCapitalLabel: e.target.value })} />
          <Input label="Capital Region Label (AR)" value={formData.emiratesCapitalLabelAr} onChange={(e) => setField({ emiratesCapitalLabelAr: e.target.value })} />
          <Input label="Main HQ Label (EN)" value={formData.emiratesHeadquartersLabel} onChange={(e) => setField({ emiratesHeadquartersLabel: e.target.value })} />
          <Input label="Main HQ Label (AR)" value={formData.emiratesHeadquartersLabelAr} onChange={(e) => setField({ emiratesHeadquartersLabelAr: e.target.value })} />
          <Input label="CTA Label (EN)" value={formData.emiratesCtaLabel} onChange={(e) => setField({ emiratesCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.emiratesCtaLabelAr} onChange={(e) => setField({ emiratesCtaLabelAr: e.target.value })} />
        </SectionBlock>

        {/* CTA Section */}
        <SectionBlock title="CTA Section" isOpen={openSections.has('CTA Section')} onToggle={() => toggleSection('CTA Section')}>
          <Input label="Title (EN)" value={formData.ctaTitle} onChange={(e) => setField({ ctaTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.ctaTitleAr} onChange={(e) => setField({ ctaTitleAr: e.target.value })} />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.ctaSubtitle} onChange={(e) => setField({ ctaSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.ctaSubtitleAr} onChange={(e) => setField({ ctaSubtitleAr: e.target.value })} />
          <Input label="Primary Label (EN)" value={formData.ctaPrimaryLabel} onChange={(e) => setField({ ctaPrimaryLabel: e.target.value })} />
          <Input label="Primary Label (AR)" value={formData.ctaPrimaryLabelAr} onChange={(e) => setField({ ctaPrimaryLabelAr: e.target.value })} />
          <Input label="Primary Link" value={formData.ctaPrimaryLink} onChange={(e) => setField({ ctaPrimaryLink: e.target.value })} />
          <Input label="Secondary Label (EN)" value={formData.ctaSecondaryLabel} onChange={(e) => setField({ ctaSecondaryLabel: e.target.value })} />
          <Input label="Secondary Label (AR)" value={formData.ctaSecondaryLabelAr} onChange={(e) => setField({ ctaSecondaryLabelAr: e.target.value })} />
          <Input label="Secondary Link" value={formData.ctaSecondaryLink} onChange={(e) => setField({ ctaSecondaryLink: e.target.value })} />
        </SectionBlock>

        {/* Published Toggle */}
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
