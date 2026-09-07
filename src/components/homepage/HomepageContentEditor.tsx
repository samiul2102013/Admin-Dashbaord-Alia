'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, Plus, Trash2 } from 'lucide-react';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { getHomepageContent, saveHomepageContent, homepageKeys } from '@/lib/services/homepage';
import { useUpload } from '@/hooks/useMeta';
import {
  DEFAULT_SECTION_VISIBILITY,
  SECTION_VISIBILITY_LABELS,
  type HomepageContent,
  type FloatingCard,
  type SectionVisibility,
  type StatItem,
} from '@/types/homepage';

const SECTION_KEYS: (keyof SectionVisibility)[] = [
  'hero',
  'stats',
  'shorts',
  'news',
  'initiatives',
  'consultations',
  'emirates',
  'cta',
];

const COLLAPSE_STORAGE_KEY = 'admin_editor_collapsed_homepage';

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
        sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
      };
}

function loadCollapsed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsed(set: Set<string>) {
  try {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* noop */ }
}

export default function HomepageContentEditor() {
  const queryClient = useQueryClient();
  const upload = useUpload();

  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: homepageKeys.content(),
    queryFn: getHomepageContent,
  });

  const [formData, setFormData] = useState<HomepageContent>(() => cloneData(data ?? null));
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed);

  useEffect(() => {
    if (data) setFormData(cloneData(data));
  }, [data]);

  useEffect(() => {
    saveCollapsed(collapsed);
  }, [collapsed]);

  const toggleCollapse = useCallback((key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    const vis = data?.sectionVisibility || DEFAULT_SECTION_VISIBILITY;
    const map: Record<string, boolean> = {};
    SECTION_KEYS.forEach((k) => { map[k] = vis[k] ?? true; });
    return map;
  });

  useEffect(() => {
    if (data) {
      const vis = data.sectionVisibility || DEFAULT_SECTION_VISIBILITY;
      const map: Record<string, boolean> = {};
      SECTION_KEYS.forEach((k) => { map[k] = vis[k] ?? true; });
      setVisibility(map);
    }
  }, [data]);

  const setField = useCallback((patch: Partial<HomepageContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const setStat = useCallback((index: number, patch: Partial<StatItem>) => {
    setFormData((prev) => {
      const stats = [...(prev.stats || [])];
      while (stats.length <= index) stats.push({ value: '', title: '', titleAr: '', subtitle: '', subtitleAr: '' });
      stats[index] = { ...stats[index], ...patch };
      return { ...prev, stats };
    });
  }, []);

  const addStat = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { value: '', title: '', titleAr: '', subtitle: '', subtitleAr: '' }],
    }));
  }, []);

  const removeStat = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index),
    }));
  }, []);

  const setCard = useCallback((index: number, patch: Partial<FloatingCard>) => {
    setFormData((prev) => {
      const cards = [...(prev.heroFloatingCards || [])];
      while (cards.length <= index) cards.push({ label: '', labelAr: '', sublabel: '', sublabelAr: '' });
      cards[index] = { ...cards[index], ...patch };
      return { ...prev, heroFloatingCards: cards };
    });
  }, []);

  const addCard = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      heroFloatingCards: [...(prev.heroFloatingCards || []), { label: '', labelAr: '', sublabel: '', sublabelAr: '' }],
    }));
  }, []);

  const removeCard = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      heroFloatingCards: (prev.heroFloatingCards || []).filter((_, i) => i !== index),
    }));
  }, []);

  const toggleVisibility = useCallback((key: string) => {
    setVisibility((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setFormData((f) => ({
        ...f,
        sectionVisibility: { ...f.sectionVisibility, [key]: next[key] },
      }));
      return next;
    });
  }, []);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<HomepageContent>) => saveHomepageContent(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(homepageKeys.content(), updated);
      setFormData(cloneData(updated));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3000);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSave = () => {
    setError('');
    saveMutation.mutate({ ...formData, sectionVisibility: { ...formData.sectionVisibility, hero: true } });
  };

  const isPending = saveMutation.isPending;

  const sectionHint = useCallback((key: string) => {
    return visibility[key] ? 'Visible' : 'Hidden';
  }, [visibility]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0 pb-20">
      {fetchError && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">
          {getErrorMessage(fetchError)}
        </p>
      )}
      {error && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">
          {error}
        </p>
      )}

      {/* Published toggle */}
      <div className="flex items-center gap-3 p-4 rounded-[12px] border border-secondary/30 bg-surface/50">
        <input
          type="checkbox"
          checked={formData.published}
          onChange={(e) => setField({ published: e.target.checked })}
          className="w-5 h-5 accent-primary"
        />
        <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">
          Published (visible on the website)
        </span>
      </div>

      {/* Hero Section */}
      <CollapsibleSection
        title="Hero Section"
        hint="Title, description & hero image"
        isOpen={!collapsed.has('hero')}
        onToggle={() => toggleCollapse('hero')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Eyebrow (EN)" value={formData.heroEyebrow} onChange={(e) => setField({ heroEyebrow: e.target.value })} />
          <Input label="Eyebrow (AR)" value={formData.heroEyebrowAr} onChange={(e) => setField({ heroEyebrowAr: e.target.value })} dir="rtl" />
          <Input label="Title (EN)" value={formData.heroTitle} onChange={(e) => setField({ heroTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.heroTitleAr} onChange={(e) => setField({ heroTitleAr: e.target.value })} dir="rtl" />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.heroSubtitle} onChange={(e) => setField({ heroSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.heroSubtitleAr} onChange={(e) => setField({ heroSubtitleAr: e.target.value })} dir="rtl" />
          <Input label="Search Placeholder (EN)" value={formData.heroSearchPlaceholder} onChange={(e) => setField({ heroSearchPlaceholder: e.target.value })} />
          <Input label="Search Placeholder (AR)" value={formData.heroSearchPlaceholderAr} onChange={(e) => setField({ heroSearchPlaceholderAr: e.target.value })} dir="rtl" />
          <Input label="Search Button (EN)" value={formData.heroSearchButton} onChange={(e) => setField({ heroSearchButton: e.target.value })} />
          <Input label="Search Button (AR)" value={formData.heroSearchButtonAr} onChange={(e) => setField({ heroSearchButtonAr: e.target.value })} dir="rtl" />
          <Input label="Primary CTA Label (EN)" value={formData.heroPrimaryCtaLabel} onChange={(e) => setField({ heroPrimaryCtaLabel: e.target.value })} />
          <Input label="Primary CTA Label (AR)" value={formData.heroPrimaryCtaLabelAr} onChange={(e) => setField({ heroPrimaryCtaLabelAr: e.target.value })} dir="rtl" />
          <Input label="Primary CTA Link" value={formData.heroPrimaryCtaLink} onChange={(e) => setField({ heroPrimaryCtaLink: e.target.value })} />
          <div />
          <Input label="Secondary CTA Label (EN)" value={formData.heroSecondaryCtaLabel} onChange={(e) => setField({ heroSecondaryCtaLabel: e.target.value })} />
          <Input label="Secondary CTA Label (AR)" value={formData.heroSecondaryCtaLabelAr} onChange={(e) => setField({ heroSecondaryCtaLabelAr: e.target.value })} dir="rtl" />
          <Input label="Secondary CTA Link" value={formData.heroSecondaryCtaLink} onChange={(e) => setField({ heroSecondaryCtaLink: e.target.value })} />
          <div />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input label="Hero Image Alt" value={formData.heroImageAlt} onChange={(e) => setField({ heroImageAlt: e.target.value })} />
          </div>
          <div />
          <div className="col-span-full">
            <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)] mb-2 block">
              Hero Image
            </label>
            <p className="text-[11px] text-text-secondary mb-2 font-[family-name:var(--font-poppins)]">
              Recommended size: 1280 × 800 px. JPG / PNG / WebP.
            </p>
            <FileUpload
              value={formData.heroImage}
              label="Upload Hero Image"
              isUploading={upload.isPending}
              onUpload={async (file) => {
                try {
                  const res = await upload.mutateAsync(file);
                  setField({ heroImage: res.url });
                } catch (uploadError) {
                  setError(`Image upload failed: ${getErrorMessage(uploadError)}`);
                }
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Floating Cards</h5>
            <Button variant="secondary" onClick={addCard} className="!h-8 !px-3 !text-xs">
              <Plus size={14} /> Add Card
            </Button>
          </div>
          {(formData.heroFloatingCards || []).length === 0 && (
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">No floating cards yet.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.heroFloatingCards || []).map((card, i) => (
              <div key={i} className="relative p-3 rounded-lg border border-secondary/30 bg-surface/50">
                <button
                  onClick={() => removeCard(i)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                  title="Remove card"
                >
                  <Trash2 size={14} />
                </button>
                <p className="text-[11px] font-bold text-text-secondary mb-2 font-[family-name:var(--font-manrope)]">Card {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Label (EN)" value={card.label} onChange={(e) => setCard(i, { label: e.target.value })} />
                  <Input label="Label (AR)" value={card.labelAr} onChange={(e) => setCard(i, { labelAr: e.target.value })} dir="rtl" />
                  <Input label="Sublabel (EN)" value={card.sublabel} onChange={(e) => setCard(i, { sublabel: e.target.value })} />
                  <Input label="Sublabel (AR)" value={card.sublabelAr} onChange={(e) => setCard(i, { sublabelAr: e.target.value })} dir="rtl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Stats Section */}
      <CollapsibleSection
        title="Stats Section"
        hint={sectionHint('stats')}
        isOpen={!collapsed.has('stats')}
        onToggle={() => toggleCollapse('stats')}
      >
        <SectionVisibilityToggle
          label={SECTION_VISIBILITY_LABELS.stats}
          visible={visibility.stats}
          onToggle={() => toggleVisibility('stats')}
        />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Stats</h5>
            <Button variant="secondary" onClick={addStat} className="!h-8 !px-3 !text-xs">
              <Plus size={14} /> Add Stat
            </Button>
          </div>
          {(formData.stats || []).length === 0 && (
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">No stats yet.</p>
          )}
          <div className="flex flex-col gap-4">
            {(formData.stats || []).map((stat, i) => (
              <div key={i} className="relative p-3 rounded-lg border border-secondary/30 bg-surface/50">
                <button
                  onClick={() => removeStat(i)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                  title="Remove stat"
                >
                  <Trash2 size={14} />
                </button>
                <p className="text-[11px] font-bold text-text-secondary mb-2 font-[family-name:var(--font-manrope)]">Stat {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Value" value={stat.value} onChange={(e) => setStat(i, { value: e.target.value })} />
                  <div />
                  <Input label="Title (EN)" value={stat.title} onChange={(e) => setStat(i, { title: e.target.value })} />
                  <Input label="Title (AR)" value={stat.titleAr} onChange={(e) => setStat(i, { titleAr: e.target.value })} dir="rtl" />
                  <Input label="Subtitle (EN)" value={stat.subtitle} onChange={(e) => setStat(i, { subtitle: e.target.value })} />
                  <Input label="Subtitle (AR)" value={stat.subtitleAr} onChange={(e) => setStat(i, { subtitleAr: e.target.value })} dir="rtl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Shorts Section Header */}
      <CollapsibleSection
        title="Shorts Section Header"
        hint={sectionHint('shorts')}
        isOpen={!collapsed.has('shorts')}
        onToggle={() => toggleCollapse('shorts')}
      >
        <SectionVisibilityToggle
          label={SECTION_VISIBILITY_LABELS.shorts}
          visible={visibility.shorts}
          onToggle={() => toggleVisibility('shorts')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.shortsTitle} onChange={(e) => setField({ shortsTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.shortsTitleAr} onChange={(e) => setField({ shortsTitleAr: e.target.value })} dir="rtl" />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.shortsSubtitle} onChange={(e) => setField({ shortsSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.shortsSubtitleAr} onChange={(e) => setField({ shortsSubtitleAr: e.target.value })} dir="rtl" />
          <Input label="CTA Label (EN)" value={formData.shortsCtaLabel} onChange={(e) => setField({ shortsCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.shortsCtaLabelAr} onChange={(e) => setField({ shortsCtaLabelAr: e.target.value })} dir="rtl" />
          <Input label="Empty Text (EN)" value={formData.shortsEmptyText} onChange={(e) => setField({ shortsEmptyText: e.target.value })} />
          <Input label="Empty Text (AR)" value={formData.shortsEmptyTextAr} onChange={(e) => setField({ shortsEmptyTextAr: e.target.value })} dir="rtl" />
        </div>
      </CollapsibleSection>

      {/* News Section Header */}
      <CollapsibleSection
        title="News Section Header"
        hint={sectionHint('news')}
        isOpen={!collapsed.has('news')}
        onToggle={() => toggleCollapse('news')}
      >
        <SectionVisibilityToggle
          label={SECTION_VISIBILITY_LABELS.news}
          visible={visibility.news}
          onToggle={() => toggleVisibility('news')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.newsTitle} onChange={(e) => setField({ newsTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.newsTitleAr} onChange={(e) => setField({ newsTitleAr: e.target.value })} dir="rtl" />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.newsSubtitle} onChange={(e) => setField({ newsSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.newsSubtitleAr} onChange={(e) => setField({ newsSubtitleAr: e.target.value })} dir="rtl" />
          <Input label="CTA Label (EN)" value={formData.newsCtaLabel} onChange={(e) => setField({ newsCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.newsCtaLabelAr} onChange={(e) => setField({ newsCtaLabelAr: e.target.value })} dir="rtl" />
        </div>
      </CollapsibleSection>

      {/* Initiatives Section Header */}
      <CollapsibleSection
        title="Initiatives Section Header"
        hint={sectionHint('initiatives')}
        isOpen={!collapsed.has('initiatives')}
        onToggle={() => toggleCollapse('initiatives')}
      >
        <SectionVisibilityToggle
          label={SECTION_VISIBILITY_LABELS.initiatives}
          visible={visibility.initiatives}
          onToggle={() => toggleVisibility('initiatives')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.initiativesTitle} onChange={(e) => setField({ initiativesTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.initiativesTitleAr} onChange={(e) => setField({ initiativesTitleAr: e.target.value })} dir="rtl" />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.initiativesSubtitle} onChange={(e) => setField({ initiativesSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.initiativesSubtitleAr} onChange={(e) => setField({ initiativesSubtitleAr: e.target.value })} dir="rtl" />
          <Input label="CTA Label (EN)" value={formData.initiativesCtaLabel} onChange={(e) => setField({ initiativesCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.initiativesCtaLabelAr} onChange={(e) => setField({ initiativesCtaLabelAr: e.target.value })} dir="rtl" />
        </div>
      </CollapsibleSection>

      {/* Consultations Section Header */}
      <CollapsibleSection
        title="Consultations Section Header"
        hint={sectionHint('consultations')}
        isOpen={!collapsed.has('consultations')}
        onToggle={() => toggleCollapse('consultations')}
      >
        <SectionVisibilityToggle
          label={SECTION_VISIBILITY_LABELS.consultations}
          visible={visibility.consultations}
          onToggle={() => toggleVisibility('consultations')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.consultationsTitle} onChange={(e) => setField({ consultationsTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.consultationsTitleAr} onChange={(e) => setField({ consultationsTitleAr: e.target.value })} dir="rtl" />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.consultationsSubtitle} onChange={(e) => setField({ consultationsSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.consultationsSubtitleAr} onChange={(e) => setField({ consultationsSubtitleAr: e.target.value })} dir="rtl" />
          <Input label="CTA Label (EN)" value={formData.consultationsCtaLabel} onChange={(e) => setField({ consultationsCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.consultationsCtaLabelAr} onChange={(e) => setField({ consultationsCtaLabelAr: e.target.value })} dir="rtl" />
          <Input label="Free Tab (EN)" value={formData.consultationsFreeTab} onChange={(e) => setField({ consultationsFreeTab: e.target.value })} />
          <Input label="Free Tab (AR)" value={formData.consultationsFreeTabAr} onChange={(e) => setField({ consultationsFreeTabAr: e.target.value })} dir="rtl" />
          <Input label="Paid Tab (EN)" value={formData.consultationsPaidTab} onChange={(e) => setField({ consultationsPaidTab: e.target.value })} />
          <Input label="Paid Tab (AR)" value={formData.consultationsPaidTabAr} onChange={(e) => setField({ consultationsPaidTabAr: e.target.value })} dir="rtl" />
        </div>
      </CollapsibleSection>

      {/* Emirates Section Header */}
      <CollapsibleSection
        title="Emirates Section Header"
        hint={sectionHint('emirates')}
        isOpen={!collapsed.has('emirates')}
        onToggle={() => toggleCollapse('emirates')}
      >
        <SectionVisibilityToggle
          label={SECTION_VISIBILITY_LABELS.emirates}
          visible={visibility.emirates}
          onToggle={() => toggleVisibility('emirates')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.emiratesTitle} onChange={(e) => setField({ emiratesTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.emiratesTitleAr} onChange={(e) => setField({ emiratesTitleAr: e.target.value })} dir="rtl" />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.emiratesSubtitle} onChange={(e) => setField({ emiratesSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.emiratesSubtitleAr} onChange={(e) => setField({ emiratesSubtitleAr: e.target.value })} dir="rtl" />
          <Input label="Capital Region Label (EN)" value={formData.emiratesCapitalLabel} onChange={(e) => setField({ emiratesCapitalLabel: e.target.value })} />
          <Input label="Capital Region Label (AR)" value={formData.emiratesCapitalLabelAr} onChange={(e) => setField({ emiratesCapitalLabelAr: e.target.value })} dir="rtl" />
          <Input label="Main HQ Label (EN)" value={formData.emiratesHeadquartersLabel} onChange={(e) => setField({ emiratesHeadquartersLabel: e.target.value })} />
          <Input label="Main HQ Label (AR)" value={formData.emiratesHeadquartersLabelAr} onChange={(e) => setField({ emiratesHeadquartersLabelAr: e.target.value })} dir="rtl" />
          <Input label="CTA Label (EN)" value={formData.emiratesCtaLabel} onChange={(e) => setField({ emiratesCtaLabel: e.target.value })} />
          <Input label="CTA Label (AR)" value={formData.emiratesCtaLabelAr} onChange={(e) => setField({ emiratesCtaLabelAr: e.target.value })} dir="rtl" />
        </div>
      </CollapsibleSection>

      {/* CTA Section */}
      <CollapsibleSection
        title="CTA Section"
        hint={sectionHint('cta')}
        isOpen={!collapsed.has('cta')}
        onToggle={() => toggleCollapse('cta')}
      >
        <SectionVisibilityToggle
          label={SECTION_VISIBILITY_LABELS.cta}
          visible={visibility.cta}
          onToggle={() => toggleVisibility('cta')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.ctaTitle} onChange={(e) => setField({ ctaTitle: e.target.value })} />
          <Input label="Title (AR)" value={formData.ctaTitleAr} onChange={(e) => setField({ ctaTitleAr: e.target.value })} dir="rtl" />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.ctaSubtitle} onChange={(e) => setField({ ctaSubtitle: e.target.value })} />
          <Textarea label="Subtitle (AR)" rows={2} value={formData.ctaSubtitleAr} onChange={(e) => setField({ ctaSubtitleAr: e.target.value })} dir="rtl" />
          <Input label="Primary Label (EN)" value={formData.ctaPrimaryLabel} onChange={(e) => setField({ ctaPrimaryLabel: e.target.value })} />
          <Input label="Primary Label (AR)" value={formData.ctaPrimaryLabelAr} onChange={(e) => setField({ ctaPrimaryLabelAr: e.target.value })} dir="rtl" />
          <Input label="Primary Link" value={formData.ctaPrimaryLink} onChange={(e) => setField({ ctaPrimaryLink: e.target.value })} />
          <div />
          <Input label="Secondary Label (EN)" value={formData.ctaSecondaryLabel} onChange={(e) => setField({ ctaSecondaryLabel: e.target.value })} />
          <Input label="Secondary Label (AR)" value={formData.ctaSecondaryLabelAr} onChange={(e) => setField({ ctaSecondaryLabelAr: e.target.value })} dir="rtl" />
          <Input label="Secondary Link" value={formData.ctaSecondaryLink} onChange={(e) => setField({ ctaSecondaryLink: e.target.value })} />
          <div />
        </div>
      </CollapsibleSection>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-secondary/30 px-6 py-3 flex items-center justify-end gap-4">
        {savedFlash && (
          <span className="text-sm text-green-600 font-semibold font-[family-name:var(--font-poppins)]">
            Saved ✓
          </span>
        )}
        <Button variant="primary" onClick={handleSave} isLoading={isPending}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function SectionVisibilityToggle({ label, visible, onToggle }: { label: string; visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-secondary/30 bg-surface/50 hover:bg-secondary/10 transition-colors cursor-pointer self-start"
    >
      {visible ? (
        <Eye size={16} className="text-primary" />
      ) : (
        <EyeOff size={16} className="text-text-secondary" />
      )}
      <span className="text-sm font-[family-name:var(--font-poppins)]">
        {label}
      </span>
    </button>
  );
}

interface FileUploadProps {
  value: string;
  label: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
}

function FileUpload({ value, label, isUploading, onUpload }: FileUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={label}
          className="h-28 w-full rounded-[10px] object-cover bg-secondary/20"
        />
      )}
      <label className="w-full h-32 rounded-[10px] border-2 border-dashed border-secondary/40 bg-surface/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
        <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
        <span className="flex items-center gap-2 text-sm text-text-secondary font-[family-name:var(--font-poppins)]">
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin text-primary" />
              Uploading...
            </>
          ) : (
            `+ ${label}`
          )}
        </span>
      </label>
      {value && (
        <p className="text-xs text-primary break-all font-[family-name:var(--font-poppins)]">
          {value.split('/').pop() || value}
        </p>
      )}
    </div>
  );
}
