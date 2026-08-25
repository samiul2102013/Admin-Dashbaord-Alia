'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import {
  LANGUAGE_OPTIONS,
  MARITAL_STAGE_OPTIONS,
  SHORT_CATEGORY_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/constants';
import { useCreateShort, useUpdateShort } from '@/hooks/useShorts';
import { useUpload } from '@/hooks/useMeta';
import { getErrorMessage } from '@/lib/api-client';
import type { Short, ShortResource } from '@/types/shorts';

interface ShortsModalProps {
  isOpen: boolean;
  onClose: () => void;
  short?: Short | null;
}

const emptyResources: ShortResource[] = [{ title: '', url: '', type: '' }];

export default function ShortsModal({ isOpen, onClose, short }: ShortsModalProps) {
  const createShort = useCreateShort();
  const updateShort = useUpdateShort();
  const upload = useUpload();

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
    setError('');
    updateShort.reset();
    createShort.reset();
  }, [short, isOpen]);

  const mutation = short ? updateShort : createShort;
  const isPending = mutation.isPending || upload.isPending;

  async function handleCoverFile(file: File) {
    setError('');
    try {
      const res = await upload.mutateAsync(file);
      setCoverImage(res.url);
    } catch (uploadError) {
      setError(`Cover upload failed: ${getErrorMessage(uploadError)}`);
    }
  }

  async function handleVideoFile(file: File) {
    setError('');
    try {
      const res = await upload.mutateAsync(file);
      setVideoUrl(res.url);
    } catch (uploadError) {
      setError(`Video upload failed: ${getErrorMessage(uploadError)}`);
    }
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

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Video Title" required placeholder="Enter video title" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Video Title (Arabic)" placeholder="عنوان الفيديو" value={videoTitleAr} onChange={(e) => setVideoTitleAr(e.target.value)} />
          </div>
        </div>

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
            <div className="flex flex-col gap-[26px]">
              <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
                Cover Image
              </label>
              <FileUpload
                value={coverImage}
                onUpload={handleCoverFile}
                isUploading={upload.isPending}
                label="Upload Cover Image"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-[26px]">
              <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
                Video Upload
              </label>
              <FileUpload
                value={videoUrl}
                onUpload={handleVideoFile}
                isUploading={upload.isPending}
                label="Upload Video"
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

        <div className="flex flex-col gap-[16px]">
          <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
            Key Topics
          </label>
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
        </div>

        <div className="flex flex-col gap-[16px]">
          <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
            Resources
          </label>
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
        </div>

        <div className="flex flex-col gap-[16px]">
          <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
            Display Options
          </label>
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
        </div>
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
        <input type="file" className="hidden" onChange={handleChange} />
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