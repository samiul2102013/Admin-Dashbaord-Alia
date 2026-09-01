'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { saveAboutContent, aboutKeys } from '@/lib/services/about';
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

function cloneData(d: AboutContent | null): AboutContent {
  return d
    ? JSON.parse(JSON.stringify(d))
    : {
        id: '', title: '', titleAr: '', description: '', descriptionAr: '',
        browseSession: '', browseSessionAr: '', contactSupport: '', contactSupportAr: '',
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

  const setField = (patch: Partial<AboutContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit About Content" footer={footer}>
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
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Objectives (comma-separated)</label>
            <Input label="" value={(formData.objectives || []).join(', ')} onChange={(e) => setField({ objectives: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
        </SectionBlock>

        <SectionBlock title="What We Offer" isOpen={openSections.has('What We Offer')} onToggle={() => toggleSection('What We Offer')}>
          <Input label="Heading (EN)" value={formData.whatWeOffer} onChange={(e) => setField({ whatWeOffer: e.target.value })} />
          <Input label="Heading (AR)" value={formData.whatWeOfferAr} onChange={(e) => setField({ whatWeOfferAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.whatWeOfferText} onChange={(e) => setField({ whatWeOfferText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.whatWeOfferTextAr} onChange={(e) => setField({ whatWeOfferTextAr: e.target.value })} />
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Offerings (JSON array)</label>
            <Textarea rows={4} label="" value={JSON.stringify(formData.offerings || [], null, 2)} onChange={(e) => { try { setField({ offerings: JSON.parse(e.target.value) }); } catch {} }} />
          </div>
        </SectionBlock>

        <SectionBlock title="Our Impact" isOpen={openSections.has('Our Impact')} onToggle={() => toggleSection('Our Impact')}>
          <Input label="Heading (EN)" value={formData.ourImpact} onChange={(e) => setField({ ourImpact: e.target.value })} />
          <Input label="Heading (AR)" value={formData.ourImpactAr} onChange={(e) => setField({ ourImpactAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.ourImpactText} onChange={(e) => setField({ ourImpactText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.ourImpactTextAr} onChange={(e) => setField({ ourImpactTextAr: e.target.value })} />
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Impact Stats (JSON array)</label>
            <Textarea rows={4} label="" value={JSON.stringify(formData.impact || [], null, 2)} onChange={(e) => { try { setField({ impact: JSON.parse(e.target.value) }); } catch {} }} />
          </div>
        </SectionBlock>

        <SectionBlock title="Why Choose" isOpen={openSections.has('Why Choose')} onToggle={() => toggleSection('Why Choose')}>
          <Input label="Heading (EN)" value={formData.whyChoose} onChange={(e) => setField({ whyChoose: e.target.value })} />
          <Input label="Heading (AR)" value={formData.whyChooseAr} onChange={(e) => setField({ whyChooseAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.whyChooseText} onChange={(e) => setField({ whyChooseText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.whyChooseTextAr} onChange={(e) => setField({ whyChooseTextAr: e.target.value })} />
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Values (comma-separated)</label>
            <Input label="" value={(formData.whyValues || []).join(', ')} onChange={(e) => setField({ whyValues: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
        </SectionBlock>

        <SectionBlock title="Core Values" isOpen={openSections.has('Core Values')} onToggle={() => toggleSection('Core Values')}>
          <Input label="Heading (EN)" value={formData.coreValues} onChange={(e) => setField({ coreValues: e.target.value })} />
          <Input label="Heading (AR)" value={formData.coreValuesAr} onChange={(e) => setField({ coreValuesAr: e.target.value })} />
          <Textarea label="Text (EN)" rows={3} value={formData.coreValuesText} onChange={(e) => setField({ coreValuesText: e.target.value })} />
          <Textarea label="Text (AR)" rows={3} value={formData.coreValuesTextAr} onChange={(e) => setField({ coreValuesTextAr: e.target.value })} />
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Core Values (comma-separated)</label>
            <Input label="" value={(formData.coreValueList || []).join(', ')} onChange={(e) => setField({ coreValueList: e.target.value.split(',').map((s: string) => s.trim()) })} />
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
