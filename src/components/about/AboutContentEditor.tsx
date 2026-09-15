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
import { getAboutContent, saveAboutContent, aboutKeys } from '@/lib/services/about';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import { useUpload } from '@/hooks/useMeta';
import type { AboutContent } from '@/types/about';

const SECTION_KEYS = [
  'hero',
  'ourStory',
  'ourMission',
  'ourVision',
  'ourObjective',
  'whatWeOffer',
  'ourImpact',
  'whyChoose',
  'coreValues',
] as const;

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  ourStory: 'Our Story',
  ourMission: 'Our Mission',
  ourVision: 'Our Vision',
  ourObjective: 'Our Objective',
  whatWeOffer: 'What We Offer',
  ourImpact: 'Our Impact',
  whyChoose: 'Why Choose',
  coreValues: 'Core Values',
};

const COLLAPSE_STORAGE_KEY = 'admin_editor_collapsed_about';

function cloneData(d: AboutContent | null): AboutContent {
  return d
    ? JSON.parse(JSON.stringify(d))
    : {
        id: '', title: '', titleAr: '', description: '', descriptionAr: '',
        browseSession: '', browseSessionAr: '', contactSupport: '', contactSupportAr: '',
        heroImage: '', heroImageAlt: '',
        ourStory: '', ourStoryAr: '', ourStoryText: '', ourStoryTextAr: '',
        ourMission: '', ourMissionAr: '', ourMissionText: '', ourMissionTextAr: '',
        ourVision: '', ourVisionAr: '', ourVisionText: '', ourVisionTextAr: '',
        ourObjective: '', ourObjectiveAr: '', ourObjectiveText: '', ourObjectiveTextAr: '',
        objectives: [],
        whatWeOffer: '', whatWeOfferAr: '', whatWeOfferText: '', whatWeOfferTextAr: '',
        offerings: [],
        ourImpact: '', ourImpactAr: '', ourImpactText: '', ourImpactTextAr: '',
        impact: [],
        whyChoose: '', whyChooseAr: '', whyChooseText: '', whyChooseTextAr: '',
        whyValues: [],
        coreValues: '', coreValuesAr: '', coreValuesText: '', coreValuesTextAr: '',
        coreValueList: [],
        published: false,
      };
}

const SCALAR_PAIRS: { ar: keyof AboutContent; en: keyof AboutContent }[] = [
  { ar: 'titleAr', en: 'title' },
  { ar: 'descriptionAr', en: 'description' },
  { ar: 'browseSessionAr', en: 'browseSession' },
  { ar: 'contactSupportAr', en: 'contactSupport' },
  { ar: 'ourStoryAr', en: 'ourStory' },
  { ar: 'ourStoryTextAr', en: 'ourStoryText' },
  { ar: 'ourMissionAr', en: 'ourMission' },
  { ar: 'ourMissionTextAr', en: 'ourMissionText' },
  { ar: 'ourVisionAr', en: 'ourVision' },
  { ar: 'ourVisionTextAr', en: 'ourVisionText' },
  { ar: 'ourObjectiveAr', en: 'ourObjective' },
  { ar: 'ourObjectiveTextAr', en: 'ourObjectiveText' },
  { ar: 'whatWeOfferAr', en: 'whatWeOffer' },
  { ar: 'whatWeOfferTextAr', en: 'whatWeOfferText' },
  { ar: 'ourImpactAr', en: 'ourImpact' },
  { ar: 'ourImpactTextAr', en: 'ourImpactText' },
  { ar: 'whyChooseAr', en: 'whyChoose' },
  { ar: 'whyChooseTextAr', en: 'whyChooseText' },
  { ar: 'coreValuesAr', en: 'coreValues' },
  { ar: 'coreValuesTextAr', en: 'coreValuesText' },
];

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readMachineFlags(record: AboutContent | null): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  SCALAR_PAIRS.forEach(({ ar }) => {
    flags[ar] = getIsMachineFlag(record, ar);
  });
  return flags;
}

/** Fields the backend left blank despite an English source — retry candidates. */
function readFailedFields(record: AboutContent | null): Set<string> {
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

export default function AboutContentEditor() {
  const queryClient = useQueryClient();
  const upload = useUpload();

  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: aboutKeys.content(),
    queryFn: getAboutContent,
  });

  const [formData, setFormData] = useState<AboutContent>(() => cloneData(data ?? null));
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed);
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());

  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    SECTION_KEYS.forEach((k) => { map[k] = true; });
    return map;
  });

  useEffect(() => {
    if (data) {
      setFormData(cloneData(data));
      setMachineFlags(readMachineFlags(data));
      setFailedFields(new Set());
      if (data.sectionVisibility) {
        setVisibility((prev) => ({ ...prev, ...data.sectionVisibility }));
      }
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

  const toggleVisibility = useCallback((key: string) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setField = useCallback((patch: Partial<AboutContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    const updated = await getAboutContent();
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

  const updateArrayField = <K extends 'offerings' | 'impact'>(
    key: K,
    index: number,
    patch: Partial<AboutContent[K][number]>,
  ) => {
    setFormData((prev) => {
      const list = [...((prev[key] as unknown[]) || [])];
      const current = (list[index] as Record<string, unknown>) || {};
      list[index] = { ...current, ...patch };
      return { ...prev, [key]: list };
    });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<AboutContent>) => saveAboutContent(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(aboutKeys.content(), updated);
      setFormData(cloneData(updated));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3000);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSave = () => {
    setError('');
    saveMutation.mutate({ ...formData, sectionVisibility: { ...visibility, hero: true } });
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
    <TranslationProvider model="about" id={data?.id} onTranslated={reloadTranslations}>
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
      <div className="flex items-start gap-3 p-4 rounded-[12px] border border-secondary/30 bg-surface/50">
        <input
          type="checkbox"
          checked={formData.published}
          onChange={(e) => setField({ published: e.target.checked })}
          className="w-5 h-5 accent-primary mt-0.5"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">
            Published — shows the complete public About page and all of its content. Turning this
            off hides the whole page, not only the navigation link.
          </span>
          <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
            {formData.published
              ? 'Currently published: the complete About page is live to the public.'
              : 'Currently unpublished: the entire About page is hidden from the public.'}
          </span>
        </div>
      </div>

      <TranslationToolbar states={translationStates} title={formData.title || undefined} />

      {/* Hero Section */}
      <CollapsibleSection
        title={SECTION_LABELS.hero}
        hint="Title, description & hero image"
        isOpen={!collapsed.has('hero')}
        onToggle={() => toggleCollapse('hero')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.title} onChange={(e) => setField({ title: e.target.value })} />
          <ArabicField
            label="Title (AR)"
            englishValue={formData.title}
            value={formData.titleAr}
            onChange={(v) => setField({ titleAr: v })}
            isMachine={machineFlags.titleAr}
            failed={failedFields.has('titleAr')}
          />
          <Textarea label="Description (EN)" rows={3} value={formData.description} onChange={(e) => setField({ description: e.target.value })} />
          <ArabicField
            label="Description (AR)"
            multiline
            rows={3}
            englishValue={formData.description}
            value={formData.descriptionAr}
            onChange={(v) => setField({ descriptionAr: v })}
            isMachine={machineFlags.descriptionAr}
            failed={failedFields.has('descriptionAr')}
          />
          <Input label="Browse Session (EN)" value={formData.browseSession} onChange={(e) => setField({ browseSession: e.target.value })} />
          <ArabicField
            label="Browse Session (AR)"
            englishValue={formData.browseSession}
            value={formData.browseSessionAr}
            onChange={(v) => setField({ browseSessionAr: v })}
            isMachine={machineFlags.browseSessionAr}
            failed={failedFields.has('browseSessionAr')}
          />
          <Input label="Contact Support (EN)" value={formData.contactSupport} onChange={(e) => setField({ contactSupport: e.target.value })} />
          <ArabicField
            label="Contact Support (AR)"
            englishValue={formData.contactSupport}
            value={formData.contactSupportAr}
            onChange={(v) => setField({ contactSupportAr: v })}
            isMachine={machineFlags.contactSupportAr}
            failed={failedFields.has('contactSupportAr')}
          />
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
              Recommended size: 1280 × 600 px. JPG / PNG / WebP, max 5 GB.
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
      </CollapsibleSection>

      {/* Our Story */}
      <CollapsibleSection
        title={SECTION_LABELS.ourStory}
        hint="Our story heading & text"
        visible={visibility.ourStory}
        onToggleVisible={() => toggleVisibility('ourStory')}
        sectionName="Our Story"
        hidePreview="the entire Our Story section"
        isOpen={!collapsed.has('ourStory')}
        onToggle={() => toggleCollapse('ourStory')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourStory} onChange={(e) => setField({ ourStory: e.target.value })} />
          <ArabicField
            label="Heading (AR)"
            englishValue={formData.ourStory}
            value={formData.ourStoryAr}
            onChange={(v) => setField({ ourStoryAr: v })}
            isMachine={machineFlags.ourStoryAr}
            failed={failedFields.has('ourStoryAr')}
          />
          <Textarea label="Text (EN)" rows={3} value={formData.ourStoryText} onChange={(e) => setField({ ourStoryText: e.target.value })} />
          <ArabicField
            label="Text (AR)"
            multiline
            rows={3}
            englishValue={formData.ourStoryText}
            value={formData.ourStoryTextAr}
            onChange={(v) => setField({ ourStoryTextAr: v })}
            isMachine={machineFlags.ourStoryTextAr}
            failed={failedFields.has('ourStoryTextAr')}
          />
        </div>
      </CollapsibleSection>

      {/* Our Mission */}
      <CollapsibleSection
        title={SECTION_LABELS.ourMission}
        hint="Our mission heading & text"
        visible={visibility.ourMission}
        onToggleVisible={() => toggleVisibility('ourMission')}
        sectionName="Our Mission"
        hidePreview="the entire Our Mission section"
        isOpen={!collapsed.has('ourMission')}
        onToggle={() => toggleCollapse('ourMission')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourMission} onChange={(e) => setField({ ourMission: e.target.value })} />
          <ArabicField
            label="Heading (AR)"
            englishValue={formData.ourMission}
            value={formData.ourMissionAr}
            onChange={(v) => setField({ ourMissionAr: v })}
            isMachine={machineFlags.ourMissionAr}
            failed={failedFields.has('ourMissionAr')}
          />
          <Textarea label="Text (EN)" rows={3} value={formData.ourMissionText} onChange={(e) => setField({ ourMissionText: e.target.value })} />
          <ArabicField
            label="Text (AR)"
            multiline
            rows={3}
            englishValue={formData.ourMissionText}
            value={formData.ourMissionTextAr}
            onChange={(v) => setField({ ourMissionTextAr: v })}
            isMachine={machineFlags.ourMissionTextAr}
            failed={failedFields.has('ourMissionTextAr')}
          />
        </div>
      </CollapsibleSection>

      {/* Our Vision */}
      <CollapsibleSection
        title={SECTION_LABELS.ourVision}
        hint="Our vision heading & text"
        visible={visibility.ourVision}
        onToggleVisible={() => toggleVisibility('ourVision')}
        sectionName="Our Vision"
        hidePreview="the entire Our Vision section"
        isOpen={!collapsed.has('ourVision')}
        onToggle={() => toggleCollapse('ourVision')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourVision} onChange={(e) => setField({ ourVision: e.target.value })} />
          <ArabicField
            label="Heading (AR)"
            englishValue={formData.ourVision}
            value={formData.ourVisionAr}
            onChange={(v) => setField({ ourVisionAr: v })}
            isMachine={machineFlags.ourVisionAr}
            failed={failedFields.has('ourVisionAr')}
          />
          <Textarea label="Text (EN)" rows={3} value={formData.ourVisionText} onChange={(e) => setField({ ourVisionText: e.target.value })} />
          <ArabicField
            label="Text (AR)"
            multiline
            rows={3}
            englishValue={formData.ourVisionText}
            value={formData.ourVisionTextAr}
            onChange={(v) => setField({ ourVisionTextAr: v })}
            isMachine={machineFlags.ourVisionTextAr}
            failed={failedFields.has('ourVisionTextAr')}
          />
        </div>
      </CollapsibleSection>

      {/* Our Objective */}
      <CollapsibleSection
        title={SECTION_LABELS.ourObjective}
        hint="Our objective heading, text & objective cards"
        visible={visibility.ourObjective}
        onToggleVisible={() => toggleVisibility('ourObjective')}
        sectionName="Our Objective"
        hidePreview="the entire Our Objective section"
        isOpen={!collapsed.has('ourObjective')}
        onToggle={() => toggleCollapse('ourObjective')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourObjective} onChange={(e) => setField({ ourObjective: e.target.value })} />
          <ArabicField
            label="Heading (AR)"
            englishValue={formData.ourObjective}
            value={formData.ourObjectiveAr}
            onChange={(v) => setField({ ourObjectiveAr: v })}
            isMachine={machineFlags.ourObjectiveAr}
            failed={failedFields.has('ourObjectiveAr')}
          />
          <Textarea label="Text (EN)" rows={3} value={formData.ourObjectiveText} onChange={(e) => setField({ ourObjectiveText: e.target.value })} />
          <ArabicField
            label="Text (AR)"
            multiline
            rows={3}
            englishValue={formData.ourObjectiveText}
            value={formData.ourObjectiveTextAr}
            onChange={(v) => setField({ ourObjectiveTextAr: v })}
            isMachine={machineFlags.ourObjectiveTextAr}
            failed={failedFields.has('ourObjectiveTextAr')}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Objectives (one per row)</h5>
            <Button
              variant="secondary"
              onClick={() => setField({ objectives: [...(formData.objectives || []), ''] })}
              className="!h-8 !px-3 !text-xs"
            >
              <Plus size={14} /> Add Objective
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {(formData.objectives || []).map((obj, i) => (
              <div key={`obj-${i}`} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input label="" value={obj} onChange={(e) => {
                    const list = [...(formData.objectives || [])];
                    list[i] = e.target.value;
                    setField({ objectives: list });
                  }} placeholder={`Objective ${i + 1}`} />
                </div>
                <button
                  type="button"
                  onClick={() => setField({ objectives: (formData.objectives || []).filter((_, idx) => idx !== i) })}
                  className="w-10 h-10 mt-[1px] shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* What We Offer */}
      <CollapsibleSection
        title={SECTION_LABELS.whatWeOffer}
        hint="What we offer heading, text & offering cards"
        visible={visibility.whatWeOffer}
        onToggleVisible={() => toggleVisibility('whatWeOffer')}
        sectionName="What We Offer"
        hidePreview="the entire What We Offer section"
        isOpen={!collapsed.has('whatWeOffer')}
        onToggle={() => toggleCollapse('whatWeOffer')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.whatWeOffer} onChange={(e) => setField({ whatWeOffer: e.target.value })} />
          <ArabicField
            label="Heading (AR)"
            englishValue={formData.whatWeOffer}
            value={formData.whatWeOfferAr}
            onChange={(v) => setField({ whatWeOfferAr: v })}
            isMachine={machineFlags.whatWeOfferAr}
            failed={failedFields.has('whatWeOfferAr')}
          />
          <Textarea label="Text (EN)" rows={3} value={formData.whatWeOfferText} onChange={(e) => setField({ whatWeOfferText: e.target.value })} />
          <ArabicField
            label="Text (AR)"
            multiline
            rows={3}
            englishValue={formData.whatWeOfferText}
            value={formData.whatWeOfferTextAr}
            onChange={(v) => setField({ whatWeOfferTextAr: v })}
            isMachine={machineFlags.whatWeOfferTextAr}
            failed={failedFields.has('whatWeOfferTextAr')}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Offerings</h5>
            <Button
              variant="secondary"
              onClick={() => setField({ offerings: [...(formData.offerings || []), { title: '', titleAr: '', desc: '', descAr: '' }] })}
              className="!h-8 !px-3 !text-xs"
            >
              <Plus size={14} /> Add Offering
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {(formData.offerings || []).map((item, i) => (
              <div key={`off-${i}`} className="relative p-3 rounded-lg border border-secondary/30 bg-surface/50">
                <button
                  onClick={() => setField({ offerings: (formData.offerings || []).filter((_, idx) => idx !== i) })}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                  title="Remove offering"
                >
                  <Trash2 size={14} />
                </button>
                <p className="text-[11px] font-bold text-text-secondary mb-2 font-[family-name:var(--font-manrope)]">Offering {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Title (EN)" value={item.title} onChange={(e) => updateArrayField('offerings', i, { title: e.target.value })} />
                  <ArabicField
                    label="Title (AR)"
                    statusOnly
                    englishValue={item.title}
                    value={item.titleAr}
                    onChange={(v) => updateArrayField('offerings', i, { titleAr: v })}
                  />
                </div>
                <Textarea label="Description (EN)" rows={2} value={item.desc} onChange={(e) => updateArrayField('offerings', i, { desc: e.target.value })} />
                <ArabicField
                  label="Description (AR)"
                  statusOnly
                  multiline
                  rows={2}
                  englishValue={item.desc}
                  value={item.descAr}
                  onChange={(v) => updateArrayField('offerings', i, { descAr: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Our Impact */}
      <CollapsibleSection
        title={SECTION_LABELS.ourImpact}
        hint="Our impact heading, text & stats"
        visible={visibility.ourImpact}
        onToggleVisible={() => toggleVisibility('ourImpact')}
        sectionName="Our Impact"
        hidePreview="the entire Our Impact section"
        isOpen={!collapsed.has('ourImpact')}
        onToggle={() => toggleCollapse('ourImpact')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourImpact} onChange={(e) => setField({ ourImpact: e.target.value })} />
          <ArabicField
            label="Heading (AR)"
            englishValue={formData.ourImpact}
            value={formData.ourImpactAr}
            onChange={(v) => setField({ ourImpactAr: v })}
            isMachine={machineFlags.ourImpactAr}
            failed={failedFields.has('ourImpactAr')}
          />
          <Textarea label="Text (EN)" rows={3} value={formData.ourImpactText} onChange={(e) => setField({ ourImpactText: e.target.value })} />
          <ArabicField
            label="Text (AR)"
            multiline
            rows={3}
            englishValue={formData.ourImpactText}
            value={formData.ourImpactTextAr}
            onChange={(v) => setField({ ourImpactTextAr: v })}
            isMachine={machineFlags.ourImpactTextAr}
            failed={failedFields.has('ourImpactTextAr')}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Impact Stats</h5>
            <Button
              variant="secondary"
              onClick={() => setField({ impact: [...(formData.impact || []), { label: '', labelAr: '', value: '', valueAr: '' }] })}
              className="!h-8 !px-3 !text-xs"
            >
              <Plus size={14} /> Add Stat
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {(formData.impact || []).map((item, i) => (
              <div key={`imp-${i}`} className="relative p-3 rounded-lg border border-secondary/30 bg-surface/50">
                <button
                  onClick={() => setField({ impact: (formData.impact || []).filter((_, idx) => idx !== i) })}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                  title="Remove stat"
                >
                  <Trash2 size={14} />
                </button>
                <p className="text-[11px] font-bold text-text-secondary mb-2 font-[family-name:var(--font-manrope)]">Stat {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Label (EN)" value={item.label} onChange={(e) => updateArrayField('impact', i, { label: e.target.value })} />
                  <ArabicField
                    label="Label (AR)"
                    statusOnly
                    englishValue={item.label}
                    value={item.labelAr}
                    onChange={(v) => updateArrayField('impact', i, { labelAr: v })}
                  />
                  <Input label="Value (EN)" value={item.value} onChange={(e) => updateArrayField('impact', i, { value: e.target.value })} />
                  <ArabicField
                    label="Value (AR)"
                    statusOnly
                    englishValue={item.value}
                    value={item.valueAr}
                    onChange={(v) => updateArrayField('impact', i, { valueAr: v })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Why Choose */}
      <CollapsibleSection
        title={SECTION_LABELS.whyChoose}
        hint="Why choose heading, text & value cards"
        visible={visibility.whyChoose}
        onToggleVisible={() => toggleVisibility('whyChoose')}
        sectionName="Why Choose"
        hidePreview="the entire Why Choose section"
        isOpen={!collapsed.has('whyChoose')}
        onToggle={() => toggleCollapse('whyChoose')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.whyChoose} onChange={(e) => setField({ whyChoose: e.target.value })} />
          <ArabicField
            label="Heading (AR)"
            englishValue={formData.whyChoose}
            value={formData.whyChooseAr}
            onChange={(v) => setField({ whyChooseAr: v })}
            isMachine={machineFlags.whyChooseAr}
            failed={failedFields.has('whyChooseAr')}
          />
          <Textarea label="Text (EN)" rows={3} value={formData.whyChooseText} onChange={(e) => setField({ whyChooseText: e.target.value })} />
          <ArabicField
            label="Text (AR)"
            multiline
            rows={3}
            englishValue={formData.whyChooseText}
            value={formData.whyChooseTextAr}
            onChange={(v) => setField({ whyChooseTextAr: v })}
            isMachine={machineFlags.whyChooseTextAr}
            failed={failedFields.has('whyChooseTextAr')}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Why Values (one per row)</h5>
            <Button
              variant="secondary"
              onClick={() => setField({ whyValues: [...(formData.whyValues || []), ''] })}
              className="!h-8 !px-3 !text-xs"
            >
              <Plus size={14} /> Add Value
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {(formData.whyValues || []).map((v, i) => (
              <div key={`wv-${i}`} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input label="" value={v} onChange={(e) => {
                    const list = [...(formData.whyValues || [])];
                    list[i] = e.target.value;
                    setField({ whyValues: list });
                  }} placeholder={`Value ${i + 1}`} />
                </div>
                <button
                  type="button"
                  onClick={() => setField({ whyValues: (formData.whyValues || []).filter((_, idx) => idx !== i) })}
                  className="w-10 h-10 mt-[1px] shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Core Values */}
      <CollapsibleSection
        title={SECTION_LABELS.coreValues}
        hint="Core values heading, text & value pills"
        visible={visibility.coreValues}
        onToggleVisible={() => toggleVisibility('coreValues')}
        sectionName="Core Values"
        hidePreview="the entire Core Values section"
        isOpen={!collapsed.has('coreValues')}
        onToggle={() => toggleCollapse('coreValues')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.coreValues} onChange={(e) => setField({ coreValues: e.target.value })} />
          <ArabicField
            label="Heading (AR)"
            englishValue={formData.coreValues}
            value={formData.coreValuesAr}
            onChange={(v) => setField({ coreValuesAr: v })}
            isMachine={machineFlags.coreValuesAr}
            failed={failedFields.has('coreValuesAr')}
          />
          <Textarea label="Text (EN)" rows={3} value={formData.coreValuesText} onChange={(e) => setField({ coreValuesText: e.target.value })} />
          <ArabicField
            label="Text (AR)"
            multiline
            rows={3}
            englishValue={formData.coreValuesText}
            value={formData.coreValuesTextAr}
            onChange={(v) => setField({ coreValuesTextAr: v })}
            isMachine={machineFlags.coreValuesTextAr}
            failed={failedFields.has('coreValuesTextAr')}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Core Value List (one per row)</h5>
            <Button
              variant="secondary"
              onClick={() => setField({ coreValueList: [...(formData.coreValueList || []), ''] })}
              className="!h-8 !px-3 !text-xs"
            >
              <Plus size={14} /> Add Value
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {(formData.coreValueList || []).map((v, i) => (
              <div key={`cv-${i}`} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input label="" value={v} onChange={(e) => {
                    const list = [...(formData.coreValueList || [])];
                    list[i] = e.target.value;
                    setField({ coreValueList: list });
                  }} placeholder={`Value ${i + 1}`} />
                </div>
                <button
                  type="button"
                  onClick={() => setField({ coreValueList: (formData.coreValueList || []).filter((_, idx) => idx !== i) })}
                  className="w-10 h-10 mt-[1px] shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
          </div>
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
