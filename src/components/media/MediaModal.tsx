'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import ChunkedUploader from '@/components/shared/ChunkedUploader';
import { getErrorMessage } from '@/lib/api-client';
import { mediaKeys, createMediaItem, updateMediaItem } from '@/lib/services/media';
import type { MediaItem } from '@/types/media';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem | null;
}

const CATEGORY_OPTIONS = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Document', value: 'document' },
];

const STATUS_OPTIONS = [
  { label: 'Published', value: 'Published' },
  { label: 'Draft', value: 'Draft' },
];

function getDefaultData(): Partial<MediaItem> {
  return {
    fileUrl: '',
    filename: '',
    alt: '',
    altAr: '',
    caption: '',
    captionAr: '',
    category: 'image',
    fileSize: 0,
    width: 0,
    height: 0,
    status: 'Published',
  };
}

export default function MediaModal({ isOpen, onClose, item }: MediaModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<MediaItem>>(getDefaultData());
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(item ? { ...item } : getDefaultData());
      setError('');
    }
  }, [isOpen, item]);

  const createMutation = useMutation({
    mutationFn: createMediaItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<MediaItem>) => updateMediaItem(item!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const setField = (patch: Partial<MediaItem>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = () => {
    setError('');
    if (!formData.fileUrl?.trim()) {
      setError('File URL is required.');
      return;
    }
    if (!formData.filename?.trim()) {
      setError('Filename is required.');
      return;
    }
    if (item) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={isPending}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
        {item ? 'Update Media' : 'Add Media'}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Media Item' : 'Add New Media'} footer={footer}>
      <div className="flex flex-col gap-4">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        <div>
          <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">
            Upload File
          </label>
          <p className="text-[11px] text-text-secondary mb-2 font-[family-name:var(--font-poppins)]">
            Upload via the chunked uploader, or paste a URL below. Images up to 5 GB.
          </p>
          <ChunkedUploader
            value={formData.fileUrl || ''}
            category={(formData.category as 'image' | 'video' | 'document') || 'image'}
            label="Upload File"
            onChange={(url) => setField({ fileUrl: url })}
          />
        </div>
        <Input label="File URL" value={formData.fileUrl || ''} onChange={(e) => setField({ fileUrl: e.target.value })} placeholder="https://..." />
        <Input label="Filename" value={formData.filename || ''} onChange={(e) => setField({ filename: e.target.value })} />
        <Input label="Alt Text (EN)" value={formData.alt || ''} onChange={(e) => setField({ alt: e.target.value })} />
        <Input label="Alt Text (AR)" value={formData.altAr || ''} onChange={(e) => setField({ altAr: e.target.value })} />
        <Textarea label="Caption (EN)" rows={2} value={formData.caption || ''} onChange={(e) => setField({ caption: e.target.value })} />
        <Textarea label="Caption (AR)" rows={2} value={formData.captionAr || ''} onChange={(e) => setField({ captionAr: e.target.value })} />
        <Select label="Category" options={CATEGORY_OPTIONS} value={formData.category || 'image'} onChange={(e) => setField({ category: e.target.value as MediaItem['category'] })} />
        <Input label="File Size (bytes)" type="number" value={String(formData.fileSize || 0)} onChange={(e) => setField({ fileSize: Number(e.target.value) })} />
        <Input label="Width (px)" type="number" value={String(formData.width || 0)} onChange={(e) => setField({ width: Number(e.target.value) })} />
        <Input label="Height (px)" type="number" value={String(formData.height || 0)} onChange={(e) => setField({ height: Number(e.target.value) })} />
        <Select label="Status" options={STATUS_OPTIONS} value={formData.status || 'Published'} onChange={(e) => setField({ status: e.target.value })} />

        {formData.fileUrl && (
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Preview</label>
            {formData.category === 'image' ? (
              <img src={formData.fileUrl} alt={formData.alt} className="h-32 w-full rounded-[10px] object-cover bg-secondary/20" />
            ) : (
              <p className="text-sm text-text-secondary break-all">{formData.fileUrl}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
