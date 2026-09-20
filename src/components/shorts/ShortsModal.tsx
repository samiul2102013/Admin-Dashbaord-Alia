'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Info,
  LayoutGrid,
  Link2,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import ChunkedUploader from '@/components/shared/ChunkedUploader';
import VisibilityGroups, {
  countHidden,
  visibilityKeys,
  type VisibilityGroup,
} from '@/components/shared/VisibilityGroups';
import StatusField from '@/components/shared/StatusField';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { getShort } from '@/lib/services/shorts';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import {
  LANGUAGE_OPTIONS,
  MARITAL_STAGE_OPTIONS,
  SHORT_CATEGORY_OPTIONS,
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
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const isUploadingMedia = isUploadingCover || isUploadingVideo;
  const [speaker, setSpeaker] = useState('');
  const [speakerAr, setSpeakerAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [keyTopics, setKeyTopics] = useState<string[]>(['']);
  const [resources, setResources] = useState<ShortResource[]>(emptyResources);
  const [shareUrl, setShareUrl] = useState('');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    showKeyTopics: true,
    showResources: true,
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
      setSpeakerAr(short.speakerAr || '');
      setDescription(short.description || '');
      setDescriptionAr(short.descriptionAr || '');
      setMachineFlags({
        videoTitleAr: getIsMachineFlag(short, 'videoTitleAr'),
        speakerAr: getIsMachineFlag(short, 'speakerAr'),
        descriptionAr: getIsMachineFlag(short, 'descriptionAr'),
      });
      setFailedFields(new Set());
      setKeyTopics(short.keyTopics?.length ? short.keyTopics : ['']);
      setResources(short.resources?.length ? short.resources : emptyResources);
      setShareUrl(short.shareUrl || '');
      setToggles({
        showKeyTopics: short.showKeyTopics ?? true,
        showResources: short.showResources ?? true,
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
      setSpeakerAr('');
      setDescription('');
      setDescriptionAr('');
      setMachineFlags({});
      setFailedFields(new Set());
      setKeyTopics(['']);
      setResources(emptyResources);
      setShareUrl('');
      setToggles({
        showKeyTopics: true,
        showResources: true,
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
      speakerAr,
      description,
      descriptionAr,
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

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    if (!short) return;
    const fresh = await getShort(short.id);
    setVideoTitleAr(fresh.videoTitleAr || '');
    setSpeakerAr(fresh.speakerAr || '');
    setDescriptionAr(fresh.descriptionAr || '');
    setMachineFlags({
      videoTitleAr: getIsMachineFlag(fresh, 'videoTitleAr'),
      speakerAr: getIsMachineFlag(fresh, 'speakerAr'),
      descriptionAr: getIsMachineFlag(fresh, 'descriptionAr'),
    });
    const failed = new Set<string>();
    if ((fresh.videoTitle || '').trim() && !(fresh.videoTitleAr || '').trim()) failed.add('videoTitleAr');
    if ((fresh.speaker || '').trim() && !(fresh.speakerAr || '').trim()) failed.add('speakerAr');
    if ((fresh.description || '').trim() && !(fresh.descriptionAr || '').trim()) failed.add('descriptionAr');
    setFailedFields(failed);
  }, [short]);

  const translationStates: TranslationState[] = [
    getTranslationState(videoTitle, videoTitleAr, machineFlags.videoTitleAr, failedFields.has('videoTitleAr')),
    getTranslationState(description, descriptionAr, machineFlags.descriptionAr, failedFields.has('descriptionAr')),
    getTranslationState(speaker, speakerAr, machineFlags.speakerAr, failedFields.has('speakerAr')),
  ];

  const topicsCount = keyTopics.map((t) => t.trim()).filter(Boolean).length;
  const resourcesCount = resources.filter((r) => r.title || r.url || r.type).length;
  const hiddenCount = countHidden(VISIBILITY_GROUPS, toggles);

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={isPending || isUploadingMedia}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={isPending || isUploadingMedia} disabled={isUploadingMedia}>
        {isUploadingMedia ? 'Uploading media…' : short ? 'Update' : 'Save'}
      </Button>
    </div>
  );

  return (
    <TranslationProvider model="short" id={short?.id} onTranslated={reloadTranslations}>
    <Modal isOpen={isOpen} onClose={onClose} title={short ? 'Edit Video Information' : 'Video Information'} footer={footer}>
      <div className="flex flex-col gap-8">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        <TranslationToolbar states={translationStates} title={videoTitle || undefined} />

        {/* Titles stay visible at the top — the required field is always in view */}
        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Video Title" required placeholder="Enter video title" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
          </div>
          <div className="flex-1">
            <ArabicField
              label="Video Title (Arabic)"
              placeholder="عنوان الفيديو"
              englishValue={videoTitle}
              value={videoTitleAr}
              onChange={setVideoTitleAr}
              isMachine={machineFlags.videoTitleAr}
              failed={failedFields.has('videoTitleAr')}
            />
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
                  onBusyChange={setIsUploadingCover}
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
                  onBusyChange={setIsUploadingVideo}
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

          <div>
            <ArabicField
              label="Description (Arabic)"
              placeholder="وصف الفيديو"
              multiline
              rows={5}
              englishValue={description}
              value={descriptionAr}
              onChange={setDescriptionAr}
              isMachine={machineFlags.descriptionAr}
              failed={failedFields.has('descriptionAr')}
            />
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <ArabicField
                label="Speaker (Arabic)"
                placeholder="اسم المتحدث"
                englishValue={speaker}
                value={speakerAr}
                onChange={setSpeakerAr}
                isMachine={machineFlags.speakerAr}
                failed={failedFields.has('speakerAr')}
              />
            </div>
            <div className="flex-1" />
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Share URL" placeholder="https://..." value={shareUrl} onChange={(e) => setShareUrl(e.target.value)} />
            </div>
            <div className="flex-1">
              <StatusField value={status} onChange={setStatus} />
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
          hint={hiddenCount > 0 ? `${hiddenCount} of ${TOGGLE_KEYS.length} sections hidden` : 'All sections visible'}
          isOpen={openSections.display}
          onToggle={() => toggleSection('display')}
        >
          <VisibilityGroups
            groups={VISIBILITY_GROUPS}
            toggles={toggles}
            onChange={(key, checked) => setToggles({ ...toggles, [key]: checked })}
            intro="Each group below controls one section of the public video page, listed in the order it appears on the page. Hiding a section removes it for visitors — the video and its content are not affected."
          />
        </Section>
      </div>
    </Modal>
    </TranslationProvider>
  );
}

// Groups mirror the layout of the public video page (Shorts → video detail),
// top to bottom, so admins can map each switch to what they saw as a visitor.
const VISIBILITY_GROUPS: VisibilityGroup[] = [
  {
    title: 'Video Info Bar',
    description: 'the row of facts under the video player',
    icon: Info,
    items: [
      { key: 'showViews', label: 'View Count', description: 'Shows the total number of views next to the video.' },
      { key: 'showSpeaker', label: 'Speaker Name', description: 'Shows the speaker name in the info bar (set in Video Details).' },
    ],
  },
  {
    title: 'About & Key Topics',
    description: 'the description block below the video',
    icon: Tag,
    items: [
      { key: 'showKeyTopics', label: 'Key Topics', description: 'Shows the topic chips from "Key Topics Covered" under the description.' },
    ],
  },
  {
    title: 'Resources & References',
    description: 'the links card on the video page',
    icon: Link2,
    items: [
      { key: 'showResources', label: 'Resources List', description: 'Shows the "Resources & References" card with its external links.' },
    ],
  },
  {
    title: 'Related Videos',
    description: 'the grid of other shorts',
    icon: LayoutGrid,
    items: [
      { key: 'showRelated', label: 'Related Shorts', description: 'Shows the related shorts grid at the bottom of the page.' },
    ],
  },
];

// Derived so the save payload always covers every toggle exactly once.
const TOGGLE_KEYS: string[] = visibilityKeys(VISIBILITY_GROUPS);

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
