'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { getHomepageContent, saveHomepageContent } from '@/lib/services/homepage';
import type { HomepageContent, FloatingCard, StatItem } from '@/types/homepage';

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

export default function HomepageContentPanel() {
  const [data, setData] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['Hero']));

  useEffect(() => {
    getHomepageContent()
      .then(setData)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const setField = (patch: Partial<HomepageContent>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const setStat = (index: number, patch: Partial<StatItem>) => {
    setData((prev) => {
      if (!prev) return prev;
      const stats = [...(prev.stats || [])];
      while (stats.length <= index) stats.push({ value: '', title: '', titleAr: '', subtitle: '', subtitleAr: '' });
      stats[index] = { ...stats[index], ...patch };
      return { ...prev, stats };
    });
  };

  const setCard = (index: number, patch: Partial<FloatingCard>) => {
    setData((prev) => {
      if (!prev) return prev;
      const cards = [...(prev.heroFloatingCards || [])];
      while (cards.length <= index) cards.push({ label: '', labelAr: '', sublabel: '', sublabelAr: '' });
      cards[index] = { ...cards[index], ...patch };
      return { ...prev, heroFloatingCards: cards };
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const updated = await saveHomepageContent(data);
      setData(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-text-secondary text-sm font-[family-name:var(--font-poppins)]">
          No homepage content found. Click &quot;Initialize&quot; to create the default homepage content.
        </p>
        <Button onClick={async () => {
          setSaving(true);
          try {
            const created = await saveHomepageContent({});
            setData(created);
          } catch (e) {
            setError(getErrorMessage(e));
          } finally {
            setSaving(false);
          }
        }} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Initialize Homepage Content
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      {error && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm font-semibold text-success font-[family-name:var(--font-poppins)]">
            <CheckCircle2 size={16} /> Saved
          </span>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      {/* Hero Section */}
      <SectionBlock title="Hero Section" isOpen={openSections.has('Hero')} onToggle={() => toggleSection('Hero')}>
        <Input label="Eyebrow (EN)" value={data.heroEyebrow} onChange={(e) => setField({ heroEyebrow: e.target.value })} />
        <Input label="Eyebrow (AR)" value={data.heroEyebrowAr} onChange={(e) => setField({ heroEyebrowAr: e.target.value })} />
        <Input label="Title (EN)" value={data.heroTitle} onChange={(e) => setField({ heroTitle: e.target.value })} />
        <Input label="Title (AR)" value={data.heroTitleAr} onChange={(e) => setField({ heroTitleAr: e.target.value })} />
        <Textarea label="Subtitle (EN)" rows={2} value={data.heroSubtitle} onChange={(e) => setField({ heroSubtitle: e.target.value })} />
        <Textarea label="Subtitle (AR)" rows={2} value={data.heroSubtitleAr} onChange={(e) => setField({ heroSubtitleAr: e.target.value })} />
        <Input label="Search Placeholder (EN)" value={data.heroSearchPlaceholder} onChange={(e) => setField({ heroSearchPlaceholder: e.target.value })} />
        <Input label="Search Placeholder (AR)" value={data.heroSearchPlaceholderAr} onChange={(e) => setField({ heroSearchPlaceholderAr: e.target.value })} />
        <Input label="Search Button (EN)" value={data.heroSearchButton} onChange={(e) => setField({ heroSearchButton: e.target.value })} />
        <Input label="Search Button (AR)" value={data.heroSearchButtonAr} onChange={(e) => setField({ heroSearchButtonAr: e.target.value })} />
        <Input label="Primary CTA Label (EN)" value={data.heroPrimaryCtaLabel} onChange={(e) => setField({ heroPrimaryCtaLabel: e.target.value })} />
        <Input label="Primary CTA Label (AR)" value={data.heroPrimaryCtaLabelAr} onChange={(e) => setField({ heroPrimaryCtaLabelAr: e.target.value })} />
        <Input label="Primary CTA Link" value={data.heroPrimaryCtaLink} onChange={(e) => setField({ heroPrimaryCtaLink: e.target.value })} />
        <Input label="Secondary CTA Label (EN)" value={data.heroSecondaryCtaLabel} onChange={(e) => setField({ heroSecondaryCtaLabel: e.target.value })} />
        <Input label="Secondary CTA Label (AR)" value={data.heroSecondaryCtaLabelAr} onChange={(e) => setField({ heroSecondaryCtaLabelAr: e.target.value })} />
        <Input label="Secondary CTA Link" value={data.heroSecondaryCtaLink} onChange={(e) => setField({ heroSecondaryCtaLink: e.target.value })} />
        <Input label="Hero Image URL" value={data.heroImage} onChange={(e) => setField({ heroImage: e.target.value })} />
        <Input label="Hero Image Alt" value={data.heroImageAlt} onChange={(e) => setField({ heroImageAlt: e.target.value })} />

        <div className="col-span-full mt-2">
          <h5 className="text-xs font-bold text-text-secondary uppercase mb-3 font-[family-name:var(--font-manrope)]">Floating Cards</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => {
              const card = data.heroFloatingCards?.[i] || { label: '', labelAr: '', sublabel: '', sublabelAr: '' };
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
          const stat = data.stats?.[i] || { value: '', title: '', titleAr: '', subtitle: '', subtitleAr: '' };
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
        <Input label="Title (EN)" value={data.shortsTitle} onChange={(e) => setField({ shortsTitle: e.target.value })} />
        <Input label="Title (AR)" value={data.shortsTitleAr} onChange={(e) => setField({ shortsTitleAr: e.target.value })} />
        <Textarea label="Subtitle (EN)" rows={2} value={data.shortsSubtitle} onChange={(e) => setField({ shortsSubtitle: e.target.value })} />
        <Textarea label="Subtitle (AR)" rows={2} value={data.shortsSubtitleAr} onChange={(e) => setField({ shortsSubtitleAr: e.target.value })} />
        <Input label="CTA Label (EN)" value={data.shortsCtaLabel} onChange={(e) => setField({ shortsCtaLabel: e.target.value })} />
        <Input label="CTA Label (AR)" value={data.shortsCtaLabelAr} onChange={(e) => setField({ shortsCtaLabelAr: e.target.value })} />
        <Input label="Empty Text (EN)" value={data.shortsEmptyText} onChange={(e) => setField({ shortsEmptyText: e.target.value })} />
        <Input label="Empty Text (AR)" value={data.shortsEmptyTextAr} onChange={(e) => setField({ shortsEmptyTextAr: e.target.value })} />
      </SectionBlock>

      {/* News Header */}
      <SectionBlock title="News Section Header" isOpen={openSections.has('News Header')} onToggle={() => toggleSection('News Header')}>
        <Input label="Title (EN)" value={data.newsTitle} onChange={(e) => setField({ newsTitle: e.target.value })} />
        <Input label="Title (AR)" value={data.newsTitleAr} onChange={(e) => setField({ newsTitleAr: e.target.value })} />
        <Textarea label="Subtitle (EN)" rows={2} value={data.newsSubtitle} onChange={(e) => setField({ newsSubtitle: e.target.value })} />
        <Textarea label="Subtitle (AR)" rows={2} value={data.newsSubtitleAr} onChange={(e) => setField({ newsSubtitleAr: e.target.value })} />
        <Input label="CTA Label (EN)" value={data.newsCtaLabel} onChange={(e) => setField({ newsCtaLabel: e.target.value })} />
        <Input label="CTA Label (AR)" value={data.newsCtaLabelAr} onChange={(e) => setField({ newsCtaLabelAr: e.target.value })} />
      </SectionBlock>

      {/* Initiatives Header */}
      <SectionBlock title="Initiatives Section Header" isOpen={openSections.has('Initiatives Header')} onToggle={() => toggleSection('Initiatives Header')}>
        <Input label="Title (EN)" value={data.initiativesTitle} onChange={(e) => setField({ initiativesTitle: e.target.value })} />
        <Input label="Title (AR)" value={data.initiativesTitleAr} onChange={(e) => setField({ initiativesTitleAr: e.target.value })} />
        <Textarea label="Subtitle (EN)" rows={2} value={data.initiativesSubtitle} onChange={(e) => setField({ initiativesSubtitle: e.target.value })} />
        <Textarea label="Subtitle (AR)" rows={2} value={data.initiativesSubtitleAr} onChange={(e) => setField({ initiativesSubtitleAr: e.target.value })} />
        <Input label="CTA Label (EN)" value={data.initiativesCtaLabel} onChange={(e) => setField({ initiativesCtaLabel: e.target.value })} />
        <Input label="CTA Label (AR)" value={data.initiativesCtaLabelAr} onChange={(e) => setField({ initiativesCtaLabelAr: e.target.value })} />
      </SectionBlock>

      {/* Consultations Header */}
      <SectionBlock title="Consultations Section Header" isOpen={openSections.has('Consultations Header')} onToggle={() => toggleSection('Consultations Header')}>
        <Input label="Title (EN)" value={data.consultationsTitle} onChange={(e) => setField({ consultationsTitle: e.target.value })} />
        <Input label="Title (AR)" value={data.consultationsTitleAr} onChange={(e) => setField({ consultationsTitleAr: e.target.value })} />
        <Textarea label="Subtitle (EN)" rows={2} value={data.consultationsSubtitle} onChange={(e) => setField({ consultationsSubtitle: e.target.value })} />
        <Textarea label="Subtitle (AR)" rows={2} value={data.consultationsSubtitleAr} onChange={(e) => setField({ consultationsSubtitleAr: e.target.value })} />
        <Input label="CTA Label (EN)" value={data.consultationsCtaLabel} onChange={(e) => setField({ consultationsCtaLabel: e.target.value })} />
        <Input label="CTA Label (AR)" value={data.consultationsCtaLabelAr} onChange={(e) => setField({ consultationsCtaLabelAr: e.target.value })} />
        <Input label="Free Tab (EN)" value={data.consultationsFreeTab} onChange={(e) => setField({ consultationsFreeTab: e.target.value })} />
        <Input label="Free Tab (AR)" value={data.consultationsFreeTabAr} onChange={(e) => setField({ consultationsFreeTabAr: e.target.value })} />
        <Input label="Paid Tab (EN)" value={data.consultationsPaidTab} onChange={(e) => setField({ consultationsPaidTab: e.target.value })} />
        <Input label="Paid Tab (AR)" value={data.consultationsPaidTabAr} onChange={(e) => setField({ consultationsPaidTabAr: e.target.value })} />
      </SectionBlock>

      {/* Emirates Header */}
      <SectionBlock title="Emirates Section Header" isOpen={openSections.has('Emirates Header')} onToggle={() => toggleSection('Emirates Header')}>
        <Input label="Title (EN)" value={data.emiratesTitle} onChange={(e) => setField({ emiratesTitle: e.target.value })} />
        <Input label="Title (AR)" value={data.emiratesTitleAr} onChange={(e) => setField({ emiratesTitleAr: e.target.value })} />
        <Textarea label="Subtitle (EN)" rows={2} value={data.emiratesSubtitle} onChange={(e) => setField({ emiratesSubtitle: e.target.value })} />
        <Textarea label="Subtitle (AR)" rows={2} value={data.emiratesSubtitleAr} onChange={(e) => setField({ emiratesSubtitleAr: e.target.value })} />
        <Input label="Capital Region Label (EN)" value={data.emiratesCapitalLabel} onChange={(e) => setField({ emiratesCapitalLabel: e.target.value })} />
        <Input label="Capital Region Label (AR)" value={data.emiratesCapitalLabelAr} onChange={(e) => setField({ emiratesCapitalLabelAr: e.target.value })} />
        <Input label="Main HQ Label (EN)" value={data.emiratesHeadquartersLabel} onChange={(e) => setField({ emiratesHeadquartersLabel: e.target.value })} />
        <Input label="Main HQ Label (AR)" value={data.emiratesHeadquartersLabelAr} onChange={(e) => setField({ emiratesHeadquartersLabelAr: e.target.value })} />
        <Input label="CTA Label (EN)" value={data.emiratesCtaLabel} onChange={(e) => setField({ emiratesCtaLabel: e.target.value })} />
        <Input label="CTA Label (AR)" value={data.emiratesCtaLabelAr} onChange={(e) => setField({ emiratesCtaLabelAr: e.target.value })} />
      </SectionBlock>

      {/* CTA Section */}
      <SectionBlock title="CTA Section" isOpen={openSections.has('CTA Section')} onToggle={() => toggleSection('CTA Section')}>
        <Input label="Title (EN)" value={data.ctaTitle} onChange={(e) => setField({ ctaTitle: e.target.value })} />
        <Input label="Title (AR)" value={data.ctaTitleAr} onChange={(e) => setField({ ctaTitleAr: e.target.value })} />
        <Textarea label="Subtitle (EN)" rows={2} value={data.ctaSubtitle} onChange={(e) => setField({ ctaSubtitle: e.target.value })} />
        <Textarea label="Subtitle (AR)" rows={2} value={data.ctaSubtitleAr} onChange={(e) => setField({ ctaSubtitleAr: e.target.value })} />
        <Input label="Primary Label (EN)" value={data.ctaPrimaryLabel} onChange={(e) => setField({ ctaPrimaryLabel: e.target.value })} />
        <Input label="Primary Label (AR)" value={data.ctaPrimaryLabelAr} onChange={(e) => setField({ ctaPrimaryLabelAr: e.target.value })} />
        <Input label="Primary Link" value={data.ctaPrimaryLink} onChange={(e) => setField({ ctaPrimaryLink: e.target.value })} />
        <Input label="Secondary Label (EN)" value={data.ctaSecondaryLabel} onChange={(e) => setField({ ctaSecondaryLabel: e.target.value })} />
        <Input label="Secondary Label (AR)" value={data.ctaSecondaryLabelAr} onChange={(e) => setField({ ctaSecondaryLabelAr: e.target.value })} />
        <Input label="Secondary Link" value={data.ctaSecondaryLink} onChange={(e) => setField({ ctaSecondaryLink: e.target.value })} />
      </SectionBlock>

      {/* Published Toggle */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-secondary/30 bg-surface/50">
        <input
          type="checkbox"
          checked={data.published}
          onChange={(e) => setField({ published: e.target.checked })}
          className="w-5 h-5 accent-primary"
        />
        <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">Published (visible on the website)</span>
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
