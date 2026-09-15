'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { getErrorMessage } from '@/lib/api-client';
import { getHomepageContent, saveHomepageContent, homepageKeys } from '@/lib/services/homepage';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import { useUpload } from '@/hooks/useMeta';
import {
  DEFAULT_SECTION_VISIBILITY,
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

const SCALAR_PAIRS: { ar: keyof HomepageContent; en: keyof HomepageContent; multiline?: boolean }[] = [
  { ar: 'heroEyebrowAr', en: 'heroEyebrow' },
  { ar: 'heroTitleAr', en: 'heroTitle' },
  { ar: 'heroSubtitleAr', en: 'heroSubtitle', multiline: true },
  { ar: 'heroSearchPlaceholderAr', en: 'heroSearchPlaceholder' },
  { ar: 'heroSearchButtonAr', en: 'heroSearchButton' },
  { ar: 'heroPrimaryCtaLabelAr', en: 'heroPrimaryCtaLabel' },
  { ar: 'heroSecondaryCtaLabelAr', en: 'heroSecondaryCtaLabel' },
  { ar: 'shortsTitleAr', en: 'shortsTitle' },
  { ar: 'shortsSubtitleAr', en: 'shortsSubtitle', multiline: true },
  { ar: 'shortsCtaLabelAr', en: 'shortsCtaLabel' },
  { ar: 'shortsEmptyTextAr', en: 'shortsEmptyText' },
  { ar: 'newsTitleAr', en: 'newsTitle' },
  { ar: 'newsSubtitleAr', en: 'newsSubtitle', multiline: true },
  { ar: 'newsCtaLabelAr', en: 'newsCtaLabel' },
  { ar: 'initiativesTitleAr', en: 'initiativesTitle' },
  { ar: 'initiativesSubtitleAr', en: 'initiativesSubtitle', multiline: true },
  { ar: 'initiativesCtaLabelAr', en: 'initiativesCtaLabel' },
  { ar: 'consultationsTitleAr', en: 'consultationsTitle' },
  { ar: 'consultationsSubtitleAr', en: 'consultationsSubtitle', multiline: true },
  { ar: 'consultationsCtaLabelAr', en: 'consultationsCtaLabel' },
  { ar: 'consultationsFreeTabAr', en: 'consultationsFreeTab' },
  { ar: 'consultationsPaidTabAr', en: 'consultationsPaidTab' },
  { ar: 'emiratesTitleAr', en: 'emiratesTitle' },
  { ar: 'emiratesSubtitleAr', en: 'emiratesSubtitle', multiline: true },
  { ar: 'emiratesCapitalLabelAr', en: 'emiratesCapitalLabel' },
  { ar: 'emiratesHeadquartersLabelAr', en: 'emiratesHeadquartersLabel' },
  { ar: 'emiratesCtaLabelAr', en: 'emiratesCtaLabel' },
  { ar: 'ctaTitleAr', en: 'ctaTitle' },
  { ar: 'ctaSubtitleAr', en: 'ctaSubtitle', multiline: true },
  { ar: 'ctaPrimaryLabelAr', en: 'ctaPrimaryLabel' },
  { ar: 'ctaSecondaryLabelAr', en: 'ctaSecondaryLabel' },
];

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readMachineFlags(record: HomepageContent | null): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  SCALAR_PAIRS.forEach(({ ar }) => {
    flags[ar] = getIsMachineFlag(record, ar);
  });
  return flags;
}

/** Fields the backend left blank despite an English source — retry candidates. */
function readFailedFields(record: HomepageContent | null): Set<string> {
  const failed = new Set<string>();
  if (!record) return failed;
  SCALAR_PAIRS.forEach(({ ar, en }) => {
    if (asString(record[en]).trim() && !asString(record[ar]).trim()) failed.add(ar);
  });
  return failed;
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
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data) {
      setFormData(cloneData(data));
      setMachineFlags(readMachineFlags(data));
      setFailedFields(new Set());
    }
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

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    const updated = await getHomepageContent();
    if (!updated) return;
    setFormData(cloneData(updated));
    setMachineFlags(readMachineFlags(updated));
    setFailedFields(readFailedFields(updated));
  }, []);

  const translationStates: TranslationState[] = SCALAR_PAIRS.map(({ ar, en }) =>
    getTranslationState(
      asString(formData[en]),
      asString(formData[ar]),
      machineFlags[ar],
      failedFields.has(ar),
    ),
  );

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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TranslationProvider model="homepage" id={formData.id} onTranslated={reloadTranslations}>
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

      <TranslationToolbar states={translationStates} title={formData.heroTitle} />

      {/* Published toggle */}
      <div className="flex items-start gap-3 p-4 rounded-[12px] border border-secondary/30 bg-surface/50">
        <input
          type="checkbox"
          checked={formData.published}
          onChange={(e) => setField({ published: e.target.checked })}
          className="w-5 h-5 accent-primary mt-0.5"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">
            Published — shows the complete public Homepage and all of its content. Turning this
            off hides the whole page, not only the navigation link.
          </span>
          <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
            {formData.published
              ? 'Currently published: the complete Homepage is live to the public.'
              : 'Currently unpublished: the entire Homepage is hidden from the public.'}
          </span>
        </div>
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
          <ArabicField
            label="Eyebrow (AR)"
            englishValue={formData.heroEyebrow}
            value={formData.heroEyebrowAr}
            onChange={(v) => setField({ heroEyebrowAr: v })}
            isMachine={machineFlags.heroEyebrowAr}
            failed={failedFields.has('heroEyebrowAr')}
          />
          <Input label="Title (EN)" value={formData.heroTitle} onChange={(e) => setField({ heroTitle: e.target.value })} />
          <ArabicField
            label="Title (AR)"
            englishValue={formData.heroTitle}
            value={formData.heroTitleAr}
            onChange={(v) => setField({ heroTitleAr: v })}
            isMachine={machineFlags.heroTitleAr}
            failed={failedFields.has('heroTitleAr')}
          />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.heroSubtitle} onChange={(e) => setField({ heroSubtitle: e.target.value })} />
          <ArabicField
            label="Subtitle (AR)"
            multiline
            rows={2}
            englishValue={formData.heroSubtitle}
            value={formData.heroSubtitleAr}
            onChange={(v) => setField({ heroSubtitleAr: v })}
            isMachine={machineFlags.heroSubtitleAr}
            failed={failedFields.has('heroSubtitleAr')}
          />
          <Input label="Search Placeholder (EN)" value={formData.heroSearchPlaceholder} onChange={(e) => setField({ heroSearchPlaceholder: e.target.value })} />
          <ArabicField
            label="Search Placeholder (AR)"
            englishValue={formData.heroSearchPlaceholder}
            value={formData.heroSearchPlaceholderAr}
            onChange={(v) => setField({ heroSearchPlaceholderAr: v })}
            isMachine={machineFlags.heroSearchPlaceholderAr}
            failed={failedFields.has('heroSearchPlaceholderAr')}
          />
          <Input label="Search Button (EN)" value={formData.heroSearchButton} onChange={(e) => setField({ heroSearchButton: e.target.value })} />
          <ArabicField
            label="Search Button (AR)"
            englishValue={formData.heroSearchButton}
            value={formData.heroSearchButtonAr}
            onChange={(v) => setField({ heroSearchButtonAr: v })}
            isMachine={machineFlags.heroSearchButtonAr}
            failed={failedFields.has('heroSearchButtonAr')}
          />
          <Input label="Primary CTA Label (EN)" value={formData.heroPrimaryCtaLabel} onChange={(e) => setField({ heroPrimaryCtaLabel: e.target.value })} />
          <ArabicField
            label="Primary CTA Label (AR)"
            englishValue={formData.heroPrimaryCtaLabel}
            value={formData.heroPrimaryCtaLabelAr}
            onChange={(v) => setField({ heroPrimaryCtaLabelAr: v })}
            isMachine={machineFlags.heroPrimaryCtaLabelAr}
            failed={failedFields.has('heroPrimaryCtaLabelAr')}
          />
          <Input label="Primary CTA Link" value={formData.heroPrimaryCtaLink} onChange={(e) => setField({ heroPrimaryCtaLink: e.target.value })} />
          <div />
          <Input label="Secondary CTA Label (EN)" value={formData.heroSecondaryCtaLabel} onChange={(e) => setField({ heroSecondaryCtaLabel: e.target.value })} />
          <ArabicField
            label="Secondary CTA Label (AR)"
            englishValue={formData.heroSecondaryCtaLabel}
            value={formData.heroSecondaryCtaLabelAr}
            onChange={(v) => setField({ heroSecondaryCtaLabelAr: v })}
            isMachine={machineFlags.heroSecondaryCtaLabelAr}
            failed={failedFields.has('heroSecondaryCtaLabelAr')}
          />
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
                  <ArabicField
                    label="Label (AR)"
                    statusOnly
                    englishValue={card.label}
                    value={card.labelAr}
                    onChange={(v) => setCard(i, { labelAr: v })}
                  />
                  <Input label="Sublabel (EN)" value={card.sublabel} onChange={(e) => setCard(i, { sublabel: e.target.value })} />
                  <ArabicField
                    label="Sublabel (AR)"
                    statusOnly
                    englishValue={card.sublabel}
                    value={card.sublabelAr}
                    onChange={(v) => setCard(i, { sublabelAr: v })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Stats Section */}
      <CollapsibleSection
        title="Stats Section"
        hint="Stats shown on the homepage"
        visible={visibility.stats}
        onToggleVisible={() => toggleVisibility('stats')}
        sectionName="Stats"
        hidePreview="the homepage statistics band"
        isOpen={!collapsed.has('stats')}
        onToggle={() => toggleCollapse('stats')}
      >
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
                  <ArabicField
                    label="Title (AR)"
                    statusOnly
                    englishValue={stat.title}
                    value={stat.titleAr}
                    onChange={(v) => setStat(i, { titleAr: v })}
                  />
                  <Input label="Subtitle (EN)" value={stat.subtitle} onChange={(e) => setStat(i, { subtitle: e.target.value })} />
                  <ArabicField
                    label="Subtitle (AR)"
                    statusOnly
                    englishValue={stat.subtitle}
                    value={stat.subtitleAr}
                    onChange={(v) => setStat(i, { subtitleAr: v })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Shorts Section Header */}
      <CollapsibleSection
        title="Shorts Section Header"
        hint="Shorts section heading & CTA"
        visible={visibility.shorts}
        onToggleVisible={() => toggleVisibility('shorts')}
        sectionName="Shorts"
        hidePreview="the short-videos carousel on the public homepage"
        isOpen={!collapsed.has('shorts')}
        onToggle={() => toggleCollapse('shorts')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.shortsTitle} onChange={(e) => setField({ shortsTitle: e.target.value })} />
          <ArabicField
            label="Title (AR)"
            englishValue={formData.shortsTitle}
            value={formData.shortsTitleAr}
            onChange={(v) => setField({ shortsTitleAr: v })}
            isMachine={machineFlags.shortsTitleAr}
            failed={failedFields.has('shortsTitleAr')}
          />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.shortsSubtitle} onChange={(e) => setField({ shortsSubtitle: e.target.value })} />
          <ArabicField
            label="Subtitle (AR)"
            multiline
            rows={2}
            englishValue={formData.shortsSubtitle}
            value={formData.shortsSubtitleAr}
            onChange={(v) => setField({ shortsSubtitleAr: v })}
            isMachine={machineFlags.shortsSubtitleAr}
            failed={failedFields.has('shortsSubtitleAr')}
          />
          <Input label="CTA Label (EN)" value={formData.shortsCtaLabel} onChange={(e) => setField({ shortsCtaLabel: e.target.value })} />
          <ArabicField
            label="CTA Label (AR)"
            englishValue={formData.shortsCtaLabel}
            value={formData.shortsCtaLabelAr}
            onChange={(v) => setField({ shortsCtaLabelAr: v })}
            isMachine={machineFlags.shortsCtaLabelAr}
            failed={failedFields.has('shortsCtaLabelAr')}
          />
          <Input label="Empty Text (EN)" value={formData.shortsEmptyText} onChange={(e) => setField({ shortsEmptyText: e.target.value })} />
          <ArabicField
            label="Empty Text (AR)"
            englishValue={formData.shortsEmptyText}
            value={formData.shortsEmptyTextAr}
            onChange={(v) => setField({ shortsEmptyTextAr: v })}
            isMachine={machineFlags.shortsEmptyTextAr}
            failed={failedFields.has('shortsEmptyTextAr')}
          />
        </div>
      </CollapsibleSection>

      {/* News Section Header */}
      <CollapsibleSection
        title="News Section Header"
        hint="News section heading & CTA"
        visible={visibility.news}
        onToggleVisible={() => toggleVisibility('news')}
        sectionName="Latest News"
        hidePreview="the Latest News grid on the public homepage"
        isOpen={!collapsed.has('news')}
        onToggle={() => toggleCollapse('news')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.newsTitle} onChange={(e) => setField({ newsTitle: e.target.value })} />
          <ArabicField
            label="Title (AR)"
            englishValue={formData.newsTitle}
            value={formData.newsTitleAr}
            onChange={(v) => setField({ newsTitleAr: v })}
            isMachine={machineFlags.newsTitleAr}
            failed={failedFields.has('newsTitleAr')}
          />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.newsSubtitle} onChange={(e) => setField({ newsSubtitle: e.target.value })} />
          <ArabicField
            label="Subtitle (AR)"
            multiline
            rows={2}
            englishValue={formData.newsSubtitle}
            value={formData.newsSubtitleAr}
            onChange={(v) => setField({ newsSubtitleAr: v })}
            isMachine={machineFlags.newsSubtitleAr}
            failed={failedFields.has('newsSubtitleAr')}
          />
          <Input label="CTA Label (EN)" value={formData.newsCtaLabel} onChange={(e) => setField({ newsCtaLabel: e.target.value })} />
          <ArabicField
            label="CTA Label (AR)"
            englishValue={formData.newsCtaLabel}
            value={formData.newsCtaLabelAr}
            onChange={(v) => setField({ newsCtaLabelAr: v })}
            isMachine={machineFlags.newsCtaLabelAr}
            failed={failedFields.has('newsCtaLabelAr')}
          />
        </div>
      </CollapsibleSection>

      {/* Initiatives Section Header */}
      <CollapsibleSection
        title="Initiatives Section Header"
        hint="Initiatives section heading & CTA"
        visible={visibility.initiatives}
        onToggleVisible={() => toggleVisibility('initiatives')}
        sectionName="Initiatives"
        hidePreview="the Initiatives grid on the public homepage"
        isOpen={!collapsed.has('initiatives')}
        onToggle={() => toggleCollapse('initiatives')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.initiativesTitle} onChange={(e) => setField({ initiativesTitle: e.target.value })} />
          <ArabicField
            label="Title (AR)"
            englishValue={formData.initiativesTitle}
            value={formData.initiativesTitleAr}
            onChange={(v) => setField({ initiativesTitleAr: v })}
            isMachine={machineFlags.initiativesTitleAr}
            failed={failedFields.has('initiativesTitleAr')}
          />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.initiativesSubtitle} onChange={(e) => setField({ initiativesSubtitle: e.target.value })} />
          <ArabicField
            label="Subtitle (AR)"
            multiline
            rows={2}
            englishValue={formData.initiativesSubtitle}
            value={formData.initiativesSubtitleAr}
            onChange={(v) => setField({ initiativesSubtitleAr: v })}
            isMachine={machineFlags.initiativesSubtitleAr}
            failed={failedFields.has('initiativesSubtitleAr')}
          />
          <Input label="CTA Label (EN)" value={formData.initiativesCtaLabel} onChange={(e) => setField({ initiativesCtaLabel: e.target.value })} />
          <ArabicField
            label="CTA Label (AR)"
            englishValue={formData.initiativesCtaLabel}
            value={formData.initiativesCtaLabelAr}
            onChange={(v) => setField({ initiativesCtaLabelAr: v })}
            isMachine={machineFlags.initiativesCtaLabelAr}
            failed={failedFields.has('initiativesCtaLabelAr')}
          />
        </div>
      </CollapsibleSection>

      {/* Consultations Section Header */}
      <CollapsibleSection
        title="Consultations Section Header"
        hint="Consultations section heading & CTA"
        visible={visibility.consultations}
        onToggleVisible={() => toggleVisibility('consultations')}
        sectionName="Consultations"
        hidePreview="the Consultations grid on the public homepage"
        isOpen={!collapsed.has('consultations')}
        onToggle={() => toggleCollapse('consultations')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.consultationsTitle} onChange={(e) => setField({ consultationsTitle: e.target.value })} />
          <ArabicField
            label="Title (AR)"
            englishValue={formData.consultationsTitle}
            value={formData.consultationsTitleAr}
            onChange={(v) => setField({ consultationsTitleAr: v })}
            isMachine={machineFlags.consultationsTitleAr}
            failed={failedFields.has('consultationsTitleAr')}
          />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.consultationsSubtitle} onChange={(e) => setField({ consultationsSubtitle: e.target.value })} />
          <ArabicField
            label="Subtitle (AR)"
            multiline
            rows={2}
            englishValue={formData.consultationsSubtitle}
            value={formData.consultationsSubtitleAr}
            onChange={(v) => setField({ consultationsSubtitleAr: v })}
            isMachine={machineFlags.consultationsSubtitleAr}
            failed={failedFields.has('consultationsSubtitleAr')}
          />
          <Input label="CTA Label (EN)" value={formData.consultationsCtaLabel} onChange={(e) => setField({ consultationsCtaLabel: e.target.value })} />
          <ArabicField
            label="CTA Label (AR)"
            englishValue={formData.consultationsCtaLabel}
            value={formData.consultationsCtaLabelAr}
            onChange={(v) => setField({ consultationsCtaLabelAr: v })}
            isMachine={machineFlags.consultationsCtaLabelAr}
            failed={failedFields.has('consultationsCtaLabelAr')}
          />
          <Input label="Free Tab (EN)" value={formData.consultationsFreeTab} onChange={(e) => setField({ consultationsFreeTab: e.target.value })} />
          <ArabicField
            label="Free Tab (AR)"
            englishValue={formData.consultationsFreeTab}
            value={formData.consultationsFreeTabAr}
            onChange={(v) => setField({ consultationsFreeTabAr: v })}
            isMachine={machineFlags.consultationsFreeTabAr}
            failed={failedFields.has('consultationsFreeTabAr')}
          />
          <Input label="Paid Tab (EN)" value={formData.consultationsPaidTab} onChange={(e) => setField({ consultationsPaidTab: e.target.value })} />
          <ArabicField
            label="Paid Tab (AR)"
            englishValue={formData.consultationsPaidTab}
            value={formData.consultationsPaidTabAr}
            onChange={(v) => setField({ consultationsPaidTabAr: v })}
            isMachine={machineFlags.consultationsPaidTabAr}
            failed={failedFields.has('consultationsPaidTabAr')}
          />
        </div>
      </CollapsibleSection>

      {/* Emirates Section Header */}
      <CollapsibleSection
        title="Emirates Section Header"
        hint="Emirates section heading & CTA"
        visible={visibility.emirates}
        onToggleVisible={() => toggleVisibility('emirates')}
        sectionName="Emirates"
        hidePreview="the Emirates directory on the public homepage"
        isOpen={!collapsed.has('emirates')}
        onToggle={() => toggleCollapse('emirates')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.emiratesTitle} onChange={(e) => setField({ emiratesTitle: e.target.value })} />
          <ArabicField
            label="Title (AR)"
            englishValue={formData.emiratesTitle}
            value={formData.emiratesTitleAr}
            onChange={(v) => setField({ emiratesTitleAr: v })}
            isMachine={machineFlags.emiratesTitleAr}
            failed={failedFields.has('emiratesTitleAr')}
          />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.emiratesSubtitle} onChange={(e) => setField({ emiratesSubtitle: e.target.value })} />
          <ArabicField
            label="Subtitle (AR)"
            multiline
            rows={2}
            englishValue={formData.emiratesSubtitle}
            value={formData.emiratesSubtitleAr}
            onChange={(v) => setField({ emiratesSubtitleAr: v })}
            isMachine={machineFlags.emiratesSubtitleAr}
            failed={failedFields.has('emiratesSubtitleAr')}
          />
          <Input label="Capital Region Label (EN)" value={formData.emiratesCapitalLabel} onChange={(e) => setField({ emiratesCapitalLabel: e.target.value })} />
          <ArabicField
            label="Capital Region Label (AR)"
            englishValue={formData.emiratesCapitalLabel}
            value={formData.emiratesCapitalLabelAr}
            onChange={(v) => setField({ emiratesCapitalLabelAr: v })}
            isMachine={machineFlags.emiratesCapitalLabelAr}
            failed={failedFields.has('emiratesCapitalLabelAr')}
          />
          <Input label="Main HQ Label (EN)" value={formData.emiratesHeadquartersLabel} onChange={(e) => setField({ emiratesHeadquartersLabel: e.target.value })} />
          <ArabicField
            label="Main HQ Label (AR)"
            englishValue={formData.emiratesHeadquartersLabel}
            value={formData.emiratesHeadquartersLabelAr}
            onChange={(v) => setField({ emiratesHeadquartersLabelAr: v })}
            isMachine={machineFlags.emiratesHeadquartersLabelAr}
            failed={failedFields.has('emiratesHeadquartersLabelAr')}
          />
          <Input label="CTA Label (EN)" value={formData.emiratesCtaLabel} onChange={(e) => setField({ emiratesCtaLabel: e.target.value })} />
          <ArabicField
            label="CTA Label (AR)"
            englishValue={formData.emiratesCtaLabel}
            value={formData.emiratesCtaLabelAr}
            onChange={(v) => setField({ emiratesCtaLabelAr: v })}
            isMachine={machineFlags.emiratesCtaLabelAr}
            failed={failedFields.has('emiratesCtaLabelAr')}
          />
        </div>
      </CollapsibleSection>

      {/* CTA Section */}
      <CollapsibleSection
        title="CTA Section"
        hint="CTA banner at the bottom"
        visible={visibility.cta}
        onToggleVisible={() => toggleVisibility('cta')}
        sectionName="Call-To-Action"
        hidePreview="the closing Call-To-Action banner on the public homepage"
        isOpen={!collapsed.has('cta')}
        onToggle={() => toggleCollapse('cta')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.ctaTitle} onChange={(e) => setField({ ctaTitle: e.target.value })} />
          <ArabicField
            label="Title (AR)"
            englishValue={formData.ctaTitle}
            value={formData.ctaTitleAr}
            onChange={(v) => setField({ ctaTitleAr: v })}
            isMachine={machineFlags.ctaTitleAr}
            failed={failedFields.has('ctaTitleAr')}
          />
          <Textarea label="Subtitle (EN)" rows={2} value={formData.ctaSubtitle} onChange={(e) => setField({ ctaSubtitle: e.target.value })} />
          <ArabicField
            label="Subtitle (AR)"
            multiline
            rows={2}
            englishValue={formData.ctaSubtitle}
            value={formData.ctaSubtitleAr}
            onChange={(v) => setField({ ctaSubtitleAr: v })}
            isMachine={machineFlags.ctaSubtitleAr}
            failed={failedFields.has('ctaSubtitleAr')}
          />
          <Input label="Primary Label (EN)" value={formData.ctaPrimaryLabel} onChange={(e) => setField({ ctaPrimaryLabel: e.target.value })} />
          <ArabicField
            label="Primary Label (AR)"
            englishValue={formData.ctaPrimaryLabel}
            value={formData.ctaPrimaryLabelAr}
            onChange={(v) => setField({ ctaPrimaryLabelAr: v })}
            isMachine={machineFlags.ctaPrimaryLabelAr}
            failed={failedFields.has('ctaPrimaryLabelAr')}
          />
          <Input label="Primary Link" value={formData.ctaPrimaryLink} onChange={(e) => setField({ ctaPrimaryLink: e.target.value })} />
          <div />
          <Input label="Secondary Label (EN)" value={formData.ctaSecondaryLabel} onChange={(e) => setField({ ctaSecondaryLabel: e.target.value })} />
          <ArabicField
            label="Secondary Label (AR)"
            englishValue={formData.ctaSecondaryLabel}
            value={formData.ctaSecondaryLabelAr}
            onChange={(v) => setField({ ctaSecondaryLabelAr: v })}
            isMachine={machineFlags.ctaSecondaryLabelAr}
            failed={failedFields.has('ctaSecondaryLabelAr')}
          />
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
    </TranslationProvider>
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
