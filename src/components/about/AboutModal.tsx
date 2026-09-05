'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { saveAboutContent, aboutKeys } from '@/lib/services/about';
import { useUpload } from '@/hooks/useMeta';
import type { AboutContent } from '@/types/about';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AboutContent | null;
}

const SECTIONS = [
  'Hero',
  'Our Story',
  'Our Mission',
  'Our Vision',
  'Our Objective',
  'What We Offer',
  'Our Impact',
  'Why Choose',
  'Core Values',
] as const;

type SectionKey = (typeof SECTIONS)[number];

interface StringRowProps {
  value: string;
  placeholder?: string;
  onChange: (next: string) => void;
  onRemove: () => void;
}

function StringRow({ value, placeholder, onChange, onRemove }: StringRowProps) {
  return (
    <div className="flex items-start gap-2 col-span-full">
      <div className="flex-1">
        <Input label="" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="w-10 h-10 mt-[1px] shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
      >
        <Trash2 size={16} className="text-danger" />
      </button>
    </div>
  );
}

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

export default function AboutModal({ isOpen, onClose, data }: AboutModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AboutContent>(() => cloneData(data));
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
    mutationFn: (payload: Partial<AboutContent>) => saveAboutContent(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(aboutKeys.content(), updated);
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const upload = useUpload();

  const setField = (patch: Partial<AboutContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit About Content" size="xl" footer={footer}>
      <div className="flex flex-col gap-4">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        <SectionBlock title="Hero Section" isOpen={openSections.has('Hero')} onToggle={() => toggleSection('Hero')}>
          <Input label="Title (EN)" value={formData.title} onChange={(e) => setField({ title: e.target.value })} />
          <Input label="Title (AR)" value={formData.titleAr} onChange={(e) => setField({ titleAr: e.target.value })} />
          <Textarea label="Description (EN)" rows={3} value={formData.description} onChange={(e) => setField({ description: e.target.value })} />
          <Textarea label="Description (AR)" rows={3} value={formData.descriptionAr} onChange={(e) => setField({ descriptionAr: e.target.value })} />
          <Input label="Browse Session (EN)" value={formData.browseSession} onChange={(e) => setField({ browseSession: e.target.value })} />
          <Input label="Browse Session (AR)" value={formData.browseSessionAr} onChange={(e) => setField({ browseSessionAr: e.target.value })} />
          <Input label="Contact Support (EN)" value={formData.contactSupport} onChange={(e) => setField({ contactSupport: e.target.value })} />
          <Input label="Contact Support (AR)" value={formData.contactSupportAr} onChange={(e) => setField({ contactSupportAr: e.target.value })} />

          <div className="col-span-full mt-2">
            <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)] mb-2 block">
              Hero Image
            </label>
            <p className="text-[11px] text-text-secondary mb-2 font-[family-name:var(--font-poppins)]">
              Recommended size: 1280 × 600 px. JPG / PNG / WebP, max 5 GB.
            </p>
            <HeroImageUpload
              value={formData.heroImage || ''}
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
          <div className="col-span-full">
            <Input label="Hero Image Alt Text" value={formData.heroImageAlt || ''} onChange={(e) => setField({ heroImageAlt: e.target.value })} />
          </div>
        </SectionBlock>

        <SectionBlock title="Our Story" isOpen={openSections.has('Our Story')} onToggle={() => toggleSection('Our Story')}>
          <Input label="Heading (EN)" value={formData.ourStory} onChange={(e) => setField({ ourStory: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourStoryAr} onChange={(e) => setField({ ourStoryAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.ourStoryText} onChange={(e) => setField({ ourStoryText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourStoryTextAr} onChange={(e) => setField({ ourStoryTextAr: e.target.value })} />
        </SectionBlock>

        <SectionBlock title="Our Mission" isOpen={openSections.has('Our Mission')} onToggle={() => toggleSection('Our Mission')}>
          <Input label="Heading (EN)" value={formData.ourMission} onChange={(e) => setField({ ourMission: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourMissionAr} onChange={(e) => setField({ ourMissionAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.ourMissionText} onChange={(e) => setField({ ourMissionText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourMissionTextAr} onChange={(e) => setField({ ourMissionTextAr: e.target.value })} />
        </SectionBlock>

        <SectionBlock title="Our Vision" isOpen={openSections.has('Our Vision')} onToggle={() => toggleSection('Our Vision')}>
          <Input label="Heading (EN)" value={formData.ourVision} onChange={(e) => setField({ ourVision: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourVisionAr} onChange={(e) => setField({ ourVisionAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.ourVisionText} onChange={(e) => setField({ ourVisionText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourVisionTextAr} onChange={(e) => setField({ ourVisionTextAr: e.target.value })} />
        </SectionBlock>

        <SectionBlock title="Our Objective" isOpen={openSections.has('Our Objective')} onToggle={() => toggleSection('Our Objective')}>
          <Input label="Heading (EN)" value={formData.ourObjective} onChange={(e) => setField({ ourObjective: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourObjectiveAr} onChange={(e) => setField({ ourObjectiveAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.ourObjectiveText} onChange={(e) => setField({ ourObjectiveText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourObjectiveTextAr} onChange={(e) => setField({ ourObjectiveTextAr: e.target.value })} />
          <div className="col-span-full mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Objectives (one per row)</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setField({ objectives: [...(formData.objectives || []), ''] })}
              >
                <Plus size={16} /> Add Objective
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {(formData.objectives || []).map((obj, i) => (
                <StringRow
                  key={`obj-${i}`}
                  value={obj}
                  placeholder={`Objective ${i + 1}`}
                  onChange={(next) => {
                    const list = [...(formData.objectives || [])];
                    list[i] = next;
                    setField({ objectives: list });
                  }}
                  onRemove={() => setField({ objectives: (formData.objectives || []).filter((_, idx) => idx !== i) })}
                />
              ))}
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title="What We Offer" isOpen={openSections.has('What We Offer')} onToggle={() => toggleSection('What We Offer')}>
          <Input label="Heading (EN)" value={formData.whatWeOffer} onChange={(e) => setField({ whatWeOffer: e.target.value })} />
          <Input label="Heading (AR)" value={formData.whatWeOfferAr} onChange={(e) => setField({ whatWeOfferAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.whatWeOfferText} onChange={(e) => setField({ whatWeOfferText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.whatWeOfferTextAr} onChange={(e) => setField({ whatWeOfferTextAr: e.target.value })} />
          <div className="col-span-full mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Offerings</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setField({ offerings: [...(formData.offerings || []), { title: '', titleAr: '', desc: '', descAr: '' }] })}
              >
                <Plus size={16} /> Add Offering
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {(formData.offerings || []).map((item, i) => (
                <div key={`off-${i}`} className="p-3 rounded-lg border border-secondary/30 bg-surface/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-secondary font-[family-name:var(--font-manrope)]">Offering {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setField({ offerings: (formData.offerings || []).filter((_, idx) => idx !== i) })}
                      className="w-8 h-8 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} className="text-danger" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="Title (EN)" value={item.title} onChange={(e) => updateArrayField('offerings', i, { title: e.target.value })} />
                    <Input label="Title (AR)" value={item.titleAr} onChange={(e) => updateArrayField('offerings', i, { titleAr: e.target.value })} />
                  </div>
                  <Textarea label="Description (EN)" rows={2} value={item.desc} onChange={(e) => updateArrayField('offerings', i, { desc: e.target.value })} />
                  <Textarea label="Description (AR)" rows={2} value={item.descAr} onChange={(e) => updateArrayField('offerings', i, { descAr: e.target.value })} />
                </div>
              ))}
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title="Our Impact" isOpen={openSections.has('Our Impact')} onToggle={() => toggleSection('Our Impact')}>
          <Input label="Heading (EN)" value={formData.ourImpact} onChange={(e) => setField({ ourImpact: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourImpactAr} onChange={(e) => setField({ ourImpactAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.ourImpactText} onChange={(e) => setField({ ourImpactText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourImpactTextAr} onChange={(e) => setField({ ourImpactTextAr: e.target.value })} />
          <div className="col-span-full mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Impact Stats</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setField({ impact: [...(formData.impact || []), { label: '', labelAr: '', value: '', valueAr: '' }] })}
              >
                <Plus size={16} /> Add Stat
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {(formData.impact || []).map((item, i) => (
                <div key={`imp-${i}`} className="p-3 rounded-lg border border-secondary/30 bg-surface/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-secondary font-[family-name:var(--font-manrope)]">Stat {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setField({ impact: (formData.impact || []).filter((_, idx) => idx !== i) })}
                      className="w-8 h-8 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} className="text-danger" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="Label (EN)" value={item.label} onChange={(e) => updateArrayField('impact', i, { label: e.target.value })} />
                    <Input label="Label (AR)" value={item.labelAr} onChange={(e) => updateArrayField('impact', i, { labelAr: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="Value (EN)" value={item.value} onChange={(e) => updateArrayField('impact', i, { value: e.target.value })} />
                    <Input label="Value (AR)" value={item.valueAr} onChange={(e) => updateArrayField('impact', i, { valueAr: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title="Why Choose" isOpen={openSections.has('Why Choose')} onToggle={() => toggleSection('Why Choose')}>
          <Input label="Heading (EN)" value={formData.whyChoose} onChange={(e) => setField({ whyChoose: e.target.value })} />
          <Input label="Heading (AR)" value={formData.whyChooseAr} onChange={(e) => setField({ whyChooseAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.whyChooseText} onChange={(e) => setField({ whyChooseText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.whyChooseTextAr} onChange={(e) => setField({ whyChooseTextAr: e.target.value })} />
          <div className="col-span-full mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Why Values (one per row)</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setField({ whyValues: [...(formData.whyValues || []), ''] })}
              >
                <Plus size={16} /> Add Value
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {(formData.whyValues || []).map((v, i) => (
                <StringRow
                  key={`wv-${i}`}
                  value={v}
                  placeholder={`Value ${i + 1}`}
                  onChange={(next) => {
                    const list = [...(formData.whyValues || [])];
                    list[i] = next;
                    setField({ whyValues: list });
                  }}
                  onRemove={() => setField({ whyValues: (formData.whyValues || []).filter((_, idx) => idx !== i) })}
                />
              ))}
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title="Core Values" isOpen={openSections.has('Core Values')} onToggle={() => toggleSection('Core Values')}>
          <Input label="Heading (EN)" value={formData.coreValues} onChange={(e) => setField({ coreValues: e.target.value })} />
          <Input label="Heading (AR)" value={formData.coreValuesAr} onChange={(e) => setField({ coreValuesAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.coreValuesText} onChange={(e) => setField({ coreValuesText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.coreValuesTextAr} onChange={(e) => setField({ coreValuesTextAr: e.target.value })} />
          <div className="col-span-full mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">Core Value List (one per row)</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setField({ coreValueList: [...(formData.coreValueList || []), ''] })}
              >
                <Plus size={16} /> Add Value
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {(formData.coreValueList || []).map((v, i) => (
                <StringRow
                  key={`cv-${i}`}
                  value={v}
                  placeholder={`Value ${i + 1}`}
                  onChange={(next) => {
                    const list = [...(formData.coreValueList || [])];
                    list[i] = next;
                    setField({ coreValueList: list });
                  }}
                  onRemove={() => setField({ coreValueList: (formData.coreValueList || []).filter((_, idx) => idx !== i) })}
                />
              ))}
            </div>
          </div>
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

interface HeroImageUploadProps {
  value: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
}

function HeroImageUpload({ value, isUploading, onUpload }: HeroImageUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Hero" className="h-32 w-full rounded-[10px] object-cover bg-secondary/20" />
      )}
      <label className="w-full h-32 rounded-[10px] border-2 border-dashed border-secondary/40 bg-surface/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        <span className="flex items-center gap-2 text-sm text-text-secondary font-[family-name:var(--font-poppins)]">
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin text-primary" />
              Uploading...
            </>
          ) : (
            '+ Upload Hero Image'
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
