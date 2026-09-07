'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, Plus, Trash2 } from 'lucide-react';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { getAboutContent, saveAboutContent, aboutKeys } from '@/lib/services/about';
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

  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    SECTION_KEYS.forEach((k) => { map[k] = true; });
    return map;
  });

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

  const toggleVisibility = useCallback((key: string) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setField = useCallback((patch: Partial<AboutContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

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
    saveMutation.mutate(formData);
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
        title={SECTION_LABELS.hero}
        hint={sectionHint('hero')}
        isOpen={!collapsed.has('hero')}
        onToggle={() => toggleCollapse('hero')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.hero}
          visible={visibility.hero}
          onToggle={() => toggleVisibility('hero')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title (EN)" value={formData.title} onChange={(e) => setField({ title: e.target.value })} />
          <Input label="Title (AR)" value={formData.titleAr} onChange={(e) => setField({ titleAr: e.target.value })} dir="rtl" />
          <Textarea label="Description (EN)" rows={3} value={formData.description} onChange={(e) => setField({ description: e.target.value })} />
          <Textarea label="Description (AR)" rows={3} value={formData.descriptionAr} onChange={(e) => setField({ descriptionAr: e.target.value })} dir="rtl" />
          <Input label="Browse Session (EN)" value={formData.browseSession} onChange={(e) => setField({ browseSession: e.target.value })} />
          <Input label="Browse Session (AR)" value={formData.browseSessionAr} onChange={(e) => setField({ browseSessionAr: e.target.value })} dir="rtl" />
          <Input label="Contact Support (EN)" value={formData.contactSupport} onChange={(e) => setField({ contactSupport: e.target.value })} />
          <Input label="Contact Support (AR)" value={formData.contactSupportAr} onChange={(e) => setField({ contactSupportAr: e.target.value })} dir="rtl" />
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
        hint={sectionHint('ourStory')}
        isOpen={!collapsed.has('ourStory')}
        onToggle={() => toggleCollapse('ourStory')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.ourStory}
          visible={visibility.ourStory}
          onToggle={() => toggleVisibility('ourStory')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourStory} onChange={(e) => setField({ ourStory: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourStoryAr} onChange={(e) => setField({ ourStoryAr: e.target.value })} dir="rtl" />
          <Textarea label="Text (EN)" rows={3} value={formData.ourStoryText} onChange={(e) => setField({ ourStoryText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourStoryTextAr} onChange={(e) => setField({ ourStoryTextAr: e.target.value })} dir="rtl" />
        </div>
      </CollapsibleSection>

      {/* Our Mission */}
      <CollapsibleSection
        title={SECTION_LABELS.ourMission}
        hint={sectionHint('ourMission')}
        isOpen={!collapsed.has('ourMission')}
        onToggle={() => toggleCollapse('ourMission')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.ourMission}
          visible={visibility.ourMission}
          onToggle={() => toggleVisibility('ourMission')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourMission} onChange={(e) => setField({ ourMission: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourMissionAr} onChange={(e) => setField({ ourMissionAr: e.target.value })} dir="rtl" />
          <Textarea label="Text (EN)" rows={3} value={formData.ourMissionText} onChange={(e) => setField({ ourMissionText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourMissionTextAr} onChange={(e) => setField({ ourMissionTextAr: e.target.value })} dir="rtl" />
        </div>
      </CollapsibleSection>

      {/* Our Vision */}
      <CollapsibleSection
        title={SECTION_LABELS.ourVision}
        hint={sectionHint('ourVision')}
        isOpen={!collapsed.has('ourVision')}
        onToggle={() => toggleCollapse('ourVision')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.ourVision}
          visible={visibility.ourVision}
          onToggle={() => toggleVisibility('ourVision')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourVision} onChange={(e) => setField({ ourVision: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourVisionAr} onChange={(e) => setField({ ourVisionAr: e.target.value })} dir="rtl" />
          <Textarea label="Text (EN)" rows={3} value={formData.ourVisionText} onChange={(e) => setField({ ourVisionText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourVisionTextAr} onChange={(e) => setField({ ourVisionTextAr: e.target.value })} dir="rtl" />
        </div>
      </CollapsibleSection>

      {/* Our Objective */}
      <CollapsibleSection
        title={SECTION_LABELS.ourObjective}
        hint={sectionHint('ourObjective')}
        isOpen={!collapsed.has('ourObjective')}
        onToggle={() => toggleCollapse('ourObjective')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.ourObjective}
          visible={visibility.ourObjective}
          onToggle={() => toggleVisibility('ourObjective')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourObjective} onChange={(e) => setField({ ourObjective: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourObjectiveAr} onChange={(e) => setField({ ourObjectiveAr: e.target.value })} dir="rtl" />
          <Textarea label="Text (EN)" rows={3} value={formData.ourObjectiveText} onChange={(e) => setField({ ourObjectiveText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourObjectiveTextAr} onChange={(e) => setField({ ourObjectiveTextAr: e.target.value })} dir="rtl" />
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
        hint={sectionHint('whatWeOffer')}
        isOpen={!collapsed.has('whatWeOffer')}
        onToggle={() => toggleCollapse('whatWeOffer')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.whatWeOffer}
          visible={visibility.whatWeOffer}
          onToggle={() => toggleVisibility('whatWeOffer')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.whatWeOffer} onChange={(e) => setField({ whatWeOffer: e.target.value })} />
          <Input label="Heading (AR)" value={formData.whatWeOfferAr} onChange={(e) => setField({ whatWeOfferAr: e.target.value })} dir="rtl" />
          <Textarea label="Text (EN)" rows={3} value={formData.whatWeOfferText} onChange={(e) => setField({ whatWeOfferText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.whatWeOfferTextAr} onChange={(e) => setField({ whatWeOfferTextAr: e.target.value })} dir="rtl" />
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
                  <Input label="Title (AR)" value={item.titleAr} onChange={(e) => updateArrayField('offerings', i, { titleAr: e.target.value })} dir="rtl" />
                </div>
                <Textarea label="Description (EN)" rows={2} value={item.desc} onChange={(e) => updateArrayField('offerings', i, { desc: e.target.value })} />
                <Textarea label="Description (AR)" rows={2} value={item.descAr} onChange={(e) => updateArrayField('offerings', i, { descAr: e.target.value })} dir="rtl" />
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Our Impact */}
      <CollapsibleSection
        title={SECTION_LABELS.ourImpact}
        hint={sectionHint('ourImpact')}
        isOpen={!collapsed.has('ourImpact')}
        onToggle={() => toggleCollapse('ourImpact')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.ourImpact}
          visible={visibility.ourImpact}
          onToggle={() => toggleVisibility('ourImpact')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.ourImpact} onChange={(e) => setField({ ourImpact: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourImpactAr} onChange={(e) => setField({ ourImpactAr: e.target.value })} dir="rtl" />
          <Textarea label="Text (EN)" rows={3} value={formData.ourImpactText} onChange={(e) => setField({ ourImpactText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourImpactTextAr} onChange={(e) => setField({ ourImpactTextAr: e.target.value })} dir="rtl" />
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
                  <Input label="Label (AR)" value={item.labelAr} onChange={(e) => updateArrayField('impact', i, { labelAr: e.target.value })} dir="rtl" />
                  <Input label="Value (EN)" value={item.value} onChange={(e) => updateArrayField('impact', i, { value: e.target.value })} />
                  <Input label="Value (AR)" value={item.valueAr} onChange={(e) => updateArrayField('impact', i, { valueAr: e.target.value })} dir="rtl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Why Choose */}
      <CollapsibleSection
        title={SECTION_LABELS.whyChoose}
        hint={sectionHint('whyChoose')}
        isOpen={!collapsed.has('whyChoose')}
        onToggle={() => toggleCollapse('whyChoose')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.whyChoose}
          visible={visibility.whyChoose}
          onToggle={() => toggleVisibility('whyChoose')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.whyChoose} onChange={(e) => setField({ whyChoose: e.target.value })} />
          <Input label="Heading (AR)" value={formData.whyChooseAr} onChange={(e) => setField({ whyChooseAr: e.target.value })} dir="rtl" />
          <Textarea label="Text (EN)" rows={3} value={formData.whyChooseText} onChange={(e) => setField({ whyChooseText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.whyChooseTextAr} onChange={(e) => setField({ whyChooseTextAr: e.target.value })} dir="rtl" />
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
        hint={sectionHint('coreValues')}
        isOpen={!collapsed.has('coreValues')}
        onToggle={() => toggleCollapse('coreValues')}
      >
        <SectionVisibilityToggle
          label={SECTION_LABELS.coreValues}
          visible={visibility.coreValues}
          onToggle={() => toggleVisibility('coreValues')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Heading (EN)" value={formData.coreValues} onChange={(e) => setField({ coreValues: e.target.value })} />
          <Input label="Heading (AR)" value={formData.coreValuesAr} onChange={(e) => setField({ coreValuesAr: e.target.value })} dir="rtl" />
          <Textarea label="Text (EN)" rows={3} value={formData.coreValuesText} onChange={(e) => setField({ coreValuesText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.coreValuesTextAr} onChange={(e) => setField({ coreValuesTextAr: e.target.value })} dir="rtl" />
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
