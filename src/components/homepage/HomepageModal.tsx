'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
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

export default function HomepageModal({ isOpen, onClose, data }: HomepageModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HomepageContent>(() => cloneData(data));
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['Hero']));
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setFormData(cloneData(data));
      setError('');
      setOpenSections(new Set(['Hero']));
      setMachineFlags(readMachineFlags(data));
      setFailedFields(new Set());
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

  const upload = useUpload();

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

  const toggleVisibility = (key: keyof SectionVisibility) => {
    setFormData((prev) => {
      const vis = prev.sectionVisibility || DEFAULT_SECTION_VISIBILITY;
      return { ...prev, sectionVisibility: { ...vis, [key]: !(vis[key] ?? true) } };
    });
  };

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

  const handleSubmit = () => {
    setError('');
    saveMutation.mutate({ ...formData, sectionVisibility: { ...formData.sectionVisibility, hero: true } });
  };

  const isPending = saveMutation.isPending;
  const vis = formData.sectionVisibility || DEFAULT_SECTION_VISIBILITY;

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
    <TranslationProvider model="homepage" id={formData.id} onTranslated={reloadTranslations}>
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Homepage Content" size="xl" footer={footer}>
      <div className="flex flex-col gap-4">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        <TranslationToolbar states={translationStates} title={formData.heroTitle} />

        {/* Hero Section — the public homepage always renders the hero, so it has no visibility toggle. */}
        <CollapsibleSection
          title="Hero Section"
          hint="Title, description & hero image"
          isOpen={openSections.has('Hero')}
          onToggle={() => toggleSection('Hero')}
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
            <div className="col-span-full">
              <Input label="Hero Image Alt" value={formData.heroImageAlt} onChange={(e) => setField({ heroImageAlt: e.target.value })} />
            </div>

            <div className="col-span-full">
              <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)] mb-2 block">
                Hero Image
              </label>
              <p className="text-[11px] text-text-secondary mb-2 font-[family-name:var(--font-poppins)]">
                Recommended size: 1280 × 800 px (4:5 portrait also works). JPG / PNG / WebP, max 5 GB.
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

            <div className="col-span-full mt-2">
              <h5 className="text-xs font-bold text-text-secondary uppercase mb-3 font-[family-name:var(--font-manrope)]">Floating Cards</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => {
                  const card = formData.heroFloatingCards?.[i] || { label: '', labelAr: '', sublabel: '', sublabelAr: '' };
                  return (
                    <div key={i} className="p-3 rounded-lg border border-secondary/30 bg-surface/50">
                      <p className="text-[11px] font-bold text-text-secondary mb-2 font-[family-name:var(--font-manrope)]">Card {i + 1}</p>
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
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Stats Section */}
        <CollapsibleSection
          title="Stats Section (FeatureGrid)"
          visible={vis.stats}
          onToggleVisible={() => toggleVisibility('stats')}
          sectionName="Stats"
          hidePreview="the homepage statistics band"
          isOpen={openSections.has('Stats')}
          onToggle={() => toggleSection('Stats')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => {
              const stat = formData.stats?.[i] || { value: '', title: '', titleAr: '', subtitle: '', subtitleAr: '' };
              return (
                <div key={i} className="col-span-full p-3 rounded-lg border border-secondary/30 bg-surface/50">
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
              );
            })}
          </div>
        </CollapsibleSection>

        {/* Shorts Header */}
        <CollapsibleSection
          title="Shorts Section Header"
          visible={vis.shorts}
          onToggleVisible={() => toggleVisibility('shorts')}
          sectionName="Shorts"
          hidePreview="the short-videos carousel on the public homepage"
          isOpen={openSections.has('Shorts Header')}
          onToggle={() => toggleSection('Shorts Header')}
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

        {/* News Header */}
        <CollapsibleSection
          title="News Section Header"
          visible={vis.news}
          onToggleVisible={() => toggleVisibility('news')}
          sectionName="Latest News"
          hidePreview="the Latest News grid on the public homepage"
          isOpen={openSections.has('News Header')}
          onToggle={() => toggleSection('News Header')}
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

        {/* Initiatives Header */}
        <CollapsibleSection
          title="Initiatives Section Header"
          visible={vis.initiatives}
          onToggleVisible={() => toggleVisibility('initiatives')}
          sectionName="Initiatives"
          hidePreview="the Initiatives grid on the public homepage"
          isOpen={openSections.has('Initiatives Header')}
          onToggle={() => toggleSection('Initiatives Header')}
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

        {/* Consultations Header */}
        <CollapsibleSection
          title="Consultations Section Header"
          visible={vis.consultations}
          onToggleVisible={() => toggleVisibility('consultations')}
          sectionName="Consultations"
          hidePreview="the Consultations grid on the public homepage"
          isOpen={openSections.has('Consultations Header')}
          onToggle={() => toggleSection('Consultations Header')}
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

        {/* Emirates Header */}
        <CollapsibleSection
          title="Emirates Section Header"
          visible={vis.emirates}
          onToggleVisible={() => toggleVisibility('emirates')}
          sectionName="Emirates"
          hidePreview="the Emirates directory on the public homepage"
          isOpen={openSections.has('Emirates Header')}
          onToggle={() => toggleSection('Emirates Header')}
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
          visible={vis.cta}
          onToggleVisible={() => toggleVisibility('cta')}
          sectionName="Call-To-Action"
          hidePreview="the closing Call-To-Action banner on the public homepage"
          isOpen={openSections.has('CTA Section')}
          onToggle={() => toggleSection('CTA Section')}
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

        {/* Published Toggle */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-secondary/30 bg-surface/50">
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
      </div>
    </Modal>
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
