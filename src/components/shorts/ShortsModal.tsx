'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import ChunkedUploader from '@/components/shared/ChunkedUploader';
import {
  LANGUAGE_OPTIONS,
  MARITAL_STAGE_OPTIONS,
  SHORT_CATEGORY_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/constants';
import { useCreateShort, useUpdateShort } from '@/hooks/useShorts';
import { getErrorMessage } from '@/lib/api-client';
import type { Short, ShortResource } from '@/types/shorts';

interface ShortsModalProps {
  isOpen: boolean;
  onClose: () => void;
  short?: Short | null;
}

const emptyResources: ShortResource[] = [{ title: '', url: '', type: '' }];

type SectionKey = 'details' | 'keyTopics' | 'resources' | 'display';

// Every section starts collapsed; only the video titles stay visible at the top
// so uploads begin with the shortest possible scroll.
const initialSections: Record<SectionKey, boolean> = {
  details: false,
  keyTopics: false,
  resources: false,
  display: false,
};

export default function ShortsModal({ isOpen, onClose, short }: ShortsModalProps) {
  const createShort = useCreateShort();
  const updateShort = useUpdateShort();

  const [videoTitle, setVideoTitle] = useState('');
  const [videoTitleAr, setVideoTitleAr] = useState('');
  const [category, setCategory] = useState('');
  const [organization, setOrganization] = useState('');
  const [family, setFamily] = useState('');
  const [language, setLanguage] = useState('en');
  const [maritalStage, setMaritalStage] = useState('');
  const [duration, setDuration] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [description, setDescription] = useState('');
  const [keyTopics, setKeyTopics] = useState<string[]>(['']);
  const [resources, setResources] = useState<ShortResource[]>(emptyResources);
  const [shareUrl, setShareUrl] = useState('');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    showKeyTopics: true,
    showResources: true,
    showShare: true,
    showSpeaker: true,
    showViews: true,
    showRelated: true,
  });
  const [status, setStatus] = useState('Draft');
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(initialSections);

  // track if a chunked upload is in progress so the modal "Save" stays disabled
  // (the upload widget is self-driving and updates the URL fields directly).

  useEffect(() => {
    if (short) {
      setVideoTitle(short.videoTitle || '');
      setVideoTitleAr(short.videoTitleAr || '');
      setCategory(short.category || '');
      setOrganization(short.organization || '');
      setFamily(short.family || '');
      setLanguage(short.language || 'en');
      setMaritalStage(short.maritalStage || '');
      setDuration(short.duration || '');
      setPublishedAt(short.publishedAt ? short.publishedAt.slice(0, 16) : '');
      setCoverImage(short.coverImage || '');
      setVideoUrl(short.videoUrl || '');
      setSpeaker(short.speaker || '');
      setDescription(short.description || '');
      setKeyTopics(short.keyTopics?.length ? short.keyTopics : ['']);
      setResources(short.resources?.length ? short.resources : emptyResources);
      setShareUrl(short.shareUrl || '');
      setToggles({
        showKeyTopics: short.showKeyTopics ?? true,
        showResources: short.showResources ?? true,
        showShare: short.showShare ?? true,
        showSpeaker: short.showSpeaker ?? true,
        showViews: short.showViews ?? true,
        showRelated: short.showRelated ?? true,
      });
      setStatus(short.status || 'Draft');
    } else {
      setVideoTitle('');
      setVideoTitleAr('');
      setCategory('');
      setOrganization('');
      setFamily('');
      setLanguage('en');
      setMaritalStage('');
      setDuration('');
      setPublishedAt('');
      setCoverImage('');
      setVideoUrl('');
      setSpeaker('');
      setDescription('');
      setKeyTopics(['']);
      setResources(emptyResources);
      setShareUrl('');
      setToggles({
        showKeyTopics: true,
        showResources: true,
        showShare: true,
        showSpeaker: true,
        showViews: true,
        showRelated: true,
      });
      setStatus('Draft');
    }
    setOpenSections(initialSections);
    setError('');
    updateShort.reset();
    createShort.reset();
  }, [short, isOpen]);

  const mutation = short ? updateShort : createShort;
  const isPending = mutation.isPending;

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit() {
    if (!videoTitle.trim()) {
      setError('Video Title is required.');
      return;
    }
    const payload: Record<string, unknown> = {
      videoTitle: videoTitle.trim(),
      videoTitleAr: videoTitleAr.trim(),
      category,
      organization,
      family,
      language,
      maritalStage,
      duration,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      coverImage,
      videoUrl,
      speaker,
      description,
      keyTopics: keyTopics.map((t) => t.trim()).filter(Boolean),
      resources: resources.filter((r) => r.title || r.url || r.type),
      shareUrl,
      ...Object.fromEntries(TOGGLE_KEYS.map((k) => [k, Boolean(toggles[k])])),
      status,
    };
    if (short) {
      updateShort.mutate(
        { id: short.id, payload: payload as Partial<Short> },
        { onSuccess: () => onClose() },
      );
    } else {
      createShort.mutate(payload as Partial<Short>, { onSuccess: () => onClose() });
    }
  }

  useEffect(() => {
    if (mutation.isError) {
      setError(getErrorMessage(mutation.error));
    }
  }, [mutation.isError, mutation.error]);

  const topicsCount = keyTopics.map((t) => t.trim()).filter(Boolean).length;
  const resourcesCount = resources.filter((r) => r.title || r.url || r.type).length;

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={isPending}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
        {short ? 'Update' : 'Save'}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={short ? 'Edit Video Information' : 'Video Information'} footer={footer}>
      <div className="flex flex-col gap-8">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        {/* Titles stay visible at the top — the required field is always in view */}
        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Video Title" required placeholder="Enter video title" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Video Title (Arabic)" placeholder="عنوان الفيديو" value={videoTitleAr} onChange={(e) => setVideoTitleAr(e.target.value)} />
          </div>
        </div>

        <Section
          title="Video Details"
          hint="Category, uploads, description"
          isOpen={openSections.details}
          onToggle={() => toggleSection('details')}
        >
          <div className="flex gap-8">
            <div className="flex-1">
              <Select label="Category" options={SHORT_CATEGORY_OPTIONS} placeholder="Select category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="Organization" placeholder="e.g. Dubai Marriage Fund" value={organization} onChange={(e) => setOrganization(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Family" placeholder="e.g. Family Support" value={family} onChange={(e) => setFamily(e.target.value)} />
            </div>
            <div className="flex-1">
              <Select label="Language" options={LANGUAGE_OPTIONS} value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Select label="Marital Stage" options={MARITAL_STAGE_OPTIONS} placeholder="Select marital stage" value={maritalStage} onChange={(e) => setMaritalStage(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="Duration" placeholder="e.g. 2:30" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Speaker" placeholder="Speaker name" value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="Published Date" type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <div className="flex flex-col gap-[10px]">
                <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
                  Cover Image
                </label>
                <ChunkedUploader
                  value={coverImage}
                  category="image"
                  label="Upload Cover Image"
                  onChange={setCoverImage}
                  helperText="Recommended 1280 × 720 px. JPG / PNG / WebP. Multi-GB supported."
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-[10px]">
                <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
                  Video Upload
                </label>
                <ChunkedUploader
                  value={videoUrl}
                  category="video"
                  label="Upload Video"
                  onChange={setVideoUrl}
                  helperText="Recommended 1080p MP4. Up to 5 GB; chunked upload with progress."
                />
              </div>
            </div>
          </div>

          <div>
            <Textarea
              label="Description"
              placeholder="Enter video description"
              rows={5}
              className="h-[149px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Share URL" placeholder="https://..." value={shareUrl} onChange={(e) => setShareUrl(e.target.value)} />
            </div>
            <div className="flex-1">
              <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
          </div>
        </Section>

        <Section
          title="Key Topics Covered"
          hint={topicsCount ? `${topicsCount} ${topicsCount === 1 ? 'topic' : 'topics'}` : undefined}
          isOpen={openSections.keyTopics}
          onToggle={() => toggleSection('keyTopics')}
        >
          <div className="flex flex-col gap-3">
            {keyTopics.map((topic, i) => (
              <div key={i} className="flex items-center gap-3">
                <Input
                  value={topic}
                  onChange={(e) => {
                    const next = [...keyTopics];
                    next[i] = e.target.value;
                    setKeyTopics(next);
                  }}
                  placeholder={`Topic ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setKeyTopics(keyTopics.filter((_, idx) => idx !== i))}
                  className="w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <div>
              <Button variant="ghost" size="sm" onClick={() => setKeyTopics([...keyTopics, ''])}>
                <Plus size={16} />
                Add Topic
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="Resources & References"
          hint={resourcesCount ? `${resourcesCount} ${resourcesCount === 1 ? 'item' : 'items'}` : undefined}
          isOpen={openSections.resources}
          onToggle={() => toggleSection('resources')}
        >
          <div className="flex flex-col gap-3">
            {resources.map((resource, i) => (
              <div key={i} className="flex items-center gap-3">
                <Input
                  placeholder="Title"
                  value={resource.title || ''}
                  onChange={(e) => setResources(updateResource(i, 'title', e.target.value))}
                />
                <Input
                  placeholder="URL"
                  value={resource.url || ''}
                  onChange={(e) => setResources(updateResource(i, 'url', e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => setResources(resources.filter((_, idx) => idx !== i))}
                  className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-danger hover:bg-[#FDECEA] transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div>
              <Button variant="ghost" size="sm" onClick={() => setResources([...resources, { title: '', url: '', type: '' }])}>
                <Plus size={16} />
                Add Resource
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="Display Options"
          isOpen={openSections.display}
          onToggle={() => toggleSection('display')}
        >
          <div className="grid grid-cols-2 gap-4">
            {TOGGLE_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(toggles[key])}
                  onChange={(e) => setToggles({ ...toggles, [key]: e.target.checked })}
                  className="w-4 h-4 accent-[#781E36]"
                />
                <span className="text-sm font-medium text-text-primary font-[family-name:var(--font-poppins)]">
                  {TOGGLE_LABELS[key]}
                </span>
              </label>
            ))}
          </div>
        </Section>
      </div>
    </Modal>
  );
}

const TOGGLE_KEYS = [
  'showKeyTopics',
  'showResources',
  'showShare',
  'showSpeaker',
  'showViews',
  'showRelated',
] as const;

const TOGGLE_LABELS: Record<(typeof TOGGLE_KEYS)[number], string> = {
  showKeyTopics: 'Show Key Topics',
  showResources: 'Show Resources',
  showShare: 'Show Share',
  showSpeaker: 'Show Speaker',
  showViews: 'Show Views',
  showRelated: 'Show Related',
};

function updateResource(index: number, field: keyof ShortResource, value: string) {
  return (prev: ShortResource[]) => {
    const next = prev.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    return next;
  };
}

/* ── Collapsible section wrapper (same pattern as ContactModal/PageContentEditor) ── */

interface SectionProps {
  title: string;
  hint?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, hint, isOpen, onToggle, children }: SectionProps) {
  return (
    <div className="rounded-[12px] border border-secondary/30 bg-surface/50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary/10 transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronDown size={16} className="shrink-0 text-text-secondary" /> : <ChevronRight size={16} className="shrink-0 text-text-secondary" />}
        <span className="text-sm font-bold text-black font-[family-name:var(--font-poppins)]">{title}</span>
        {hint && (
          <span className="ml-auto text-xs text-text-secondary font-[family-name:var(--font-poppins)] shrink-0">
            {hint}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-6">
          {children}
        </div>
      )}
    </div>
  );
}
