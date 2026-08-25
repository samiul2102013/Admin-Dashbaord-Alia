'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import { EMIRATES_OPTIONS, STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { useCreateEmirate, useUpdateEmirate } from '@/hooks/useEmirates';
import { useUpload } from '@/hooks/useMeta';
import type { Emirates } from '@/types/emirates';

interface EmiratesModalProps {
  isOpen: boolean;
  onClose: () => void;
  emirates?: Emirates | null;
}

function FileUpload({
  value,
  label,
  isUploading,
  onUpload,
}: {
  value: string;
  label: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
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

export default function EmiratesModal({ isOpen, onClose, emirates }: EmiratesModalProps) {
  const createEmirate = useCreateEmirate();
  const updateEmirate = useUpdateEmirate();
  const upload = useUpload();

  const [emiratesName, setEmiratesName] = useState('');
  const [emiratesNameAr, setEmiratesNameAr] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [serviceCenters, setServiceCenters] = useState('');
  const [centerCount, setCenterCount] = useState('');
  const [image, setImage] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [showStatus, setShowStatus] = useState(true);
  const [status, setStatus] = useState('Draft');
  const [error, setError] = useState('');

  useEffect(() => {
    if (emirates) {
      setEmiratesName(emirates.emiratesName || '');
      setEmiratesNameAr(emirates.emiratesNameAr || '');
      setTitle(emirates.title || '');
      setDescription(emirates.description || '');
      setDateTime(emirates.dateTime || '');
      setContactPhone(emirates.contactPhone || '');
      setServiceCenters(
        emirates.serviceCenters != null ? String(emirates.serviceCenters) : '',
      );
      setCenterCount(emirates.centerCount || '');
      setImage(emirates.image || '');
      setWebsiteUrl(emirates.websiteUrl || '');
      setShowStatus(emirates.showStatus ?? true);
      setStatus(emirates.status || 'Draft');
    } else {
      setEmiratesName('');
      setEmiratesNameAr('');
      setTitle('');
      setDescription('');
      setDateTime('');
      setContactPhone('');
      setServiceCenters('');
      setCenterCount('');
      setImage('');
      setWebsiteUrl('');
      setShowStatus(true);
      setStatus('Draft');
    }

    setError('');
    createEmirate.reset();
    updateEmirate.reset();
  }, [emirates, isOpen]);

  const mutation = emirates ? updateEmirate : createEmirate;
  const isPending = mutation.isPending || upload.isPending;

  async function handleImageFile(file: File) {
    setError('');
    try {
      const res = await upload.mutateAsync(file);
      setImage(res.url);
    } catch (uploadError) {
      setError(`Image upload failed: ${getErrorMessage(uploadError)}`);
    }
  }

  function handleSubmit() {
    if (!emiratesName.trim()) {
      setError('Emirates name is required.');
      return;
    }

    const payload: Partial<Emirates> = {
      emiratesName: emiratesName.trim(),
      emiratesNameAr: emiratesNameAr.trim(),
      title: title.trim() || emiratesName.trim(),
      description: description.trim(),
      dateTime: dateTime || undefined,
      contactPhone: contactPhone.trim(),
      serviceCenters: serviceCenters ? Number(serviceCenters) : 0,
      centerCount: centerCount.trim(),
      image,
      websiteUrl: websiteUrl.trim(),
      showStatus,
      status: status as Emirates['status'],
    };

    if (emirates) {
      updateEmirate.mutate(
        { id: emirates.id, payload },
        { onSuccess: () => onClose() },
      );
    } else {
      createEmirate.mutate(payload, { onSuccess: () => onClose() });
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
        {emirates ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={emirates ? 'Edit Emirates Record' : 'Add Emirates Record'}
      footer={footer}
    >
      <div className="flex flex-col gap-8">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

        <div className="flex gap-8">
          <div className="flex-1">
            <Select
              label="Emirates Name"
              required
              options={EMIRATES_OPTIONS}
              placeholder="Select emirate"
              value={emiratesName}
              onChange={(e) => setEmiratesName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Emirates Name (Arabic)"
              placeholder="اسم الإمارة"
              value={emiratesNameAr}
              onChange={(e) => setEmiratesNameAr(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input
              label="Title"
              placeholder="Display title (defaults to emirate name)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Date & Time"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Textarea
            label="Description"
            placeholder="Enter description of services and initiatives"
            rows={5}
            className="h-[149px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input
              label="Contact Phone"
              placeholder="e.g. +971 2 123 4567"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Service Centers"
              placeholder="e.g. 5"
              type="number"
              value={serviceCenters}
              onChange={(e) => setServiceCenters(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input
              label="Center Count"
              placeholder="e.g. 12 Support Centers"
              value={centerCount}
              onChange={(e) => setCenterCount(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Website URL"
              placeholder="https://..."
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <FileUpload
              value={image}
              label="Upload Emirate Image"
              isUploading={upload.isPending}
              onUpload={handleImageFile}
            />
          </div>
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between rounded-[10px] border border-secondary/40 px-4 py-3">
              <div>
                <p className="text-sm font-semibold font-[family-name:var(--font-poppins)] text-text-primary">
                  Show Status
                </p>
                <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
                  Display status badge on the public emirate page.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={showStatus}
                  onChange={(e) => setShowStatus(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-secondary/30 transition-colors peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </label>
            </div>

            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}