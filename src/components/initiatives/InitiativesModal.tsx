'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import ChunkedUploader from '@/components/shared/ChunkedUploader';
import { EMIRATES_OPTIONS, STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { useCreateInitiative, useUpdateInitiative } from '@/hooks/useInitiatives';
import { useCategories } from '@/hooks/useCategories';
import type { Initiative } from '@/types/initiatives';

interface InitiativesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiative?: Initiative | null;
}

type SupportOfferedKey =
  | 'financial_support'
  | 'housing_support'
  | 'educational_support'
  | 'marriage_training_program'
  | 'pre_marital_preparation';

const SUPPORT_OPTIONS: Array<{ key: SupportOfferedKey; label: string }> = [
  { key: 'financial_support', label: 'Financial Support' },
  { key: 'housing_support', label: 'Housing Support' },
  { key: 'educational_support', label: 'Educational Support' },
  { key: 'marriage_training_program', label: 'Marriage Training Program' },
  { key: 'pre_marital_preparation', label: 'Pre-Marital Preparation' },
];

function emptySupportOffered(): Record<SupportOfferedKey, boolean> {
  return {
    financial_support: false,
    housing_support: false,
    educational_support: false,
    marriage_training_program: false,
    pre_marital_preparation: false,
  };
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(values?: string[]) {
  return values?.join('\n') ?? '';
}

function parseSupportOffered(value?: Record<string, boolean>) {
  return {
    ...emptySupportOffered(),
    ...(value ?? {}),
  };
}

function FileUpload({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold text-text-secondary uppercase font-[family-name:var(--font-manrope)]">
        {label}
      </label>
      <ChunkedUploader value={value} category="image" label={label} onChange={onChange} helperText="Recommended 1280 × 720 px." />
    </div>
  );
}

export default function InitiativesModal({ isOpen, onClose, initiative }: InitiativesModalProps) {
  const createInitiative = useCreateInitiative();
  const updateInitiative = useUpdateInitiative();
  const { data: categoriesData } = useCategories();

  const categoryOptions =
    categoriesData?.data
      ?.filter((c) => c.status === 'Published' || c.status === 'Draft')
      .map((c) => ({ value: c.category, label: c.category })) ?? [];

  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [category, setCategory] = useState('');
  const [emirates, setEmirates] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [badge, setBadge] = useState('');
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [objectives, setObjectives] = useState('');
  const [basicInformation, setBasicInformation] = useState('');
  const [benefits, setBenefits] = useState('');
  const [contact, setContact] = useState('');
  const [supportOffered, setSupportOffered] = useState(emptySupportOffered());
  const [showAbout, setShowAbout] = useState(true);
  const [showSupportOffered, setShowSupportOffered] = useState(true);
  const [showBenefits, setShowBenefits] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isListed, setIsListed] = useState(true);
  const [status, setStatus] = useState('Draft');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initiative) {
      setTitle(initiative.title || '');
      setTitleAr(initiative.titleAr || '');
      setSubtitle(initiative.subtitle || '');
      setSubtitleAr(initiative.subtitleAr || '');
      setCategory(initiative.category || '');
      setEmirates(initiative.emirates || '');
      setStartDate(initiative.startDate || '');
      setEndDate(initiative.endDate || '');
      setCoverImage(initiative.coverImage || '');
      setBadge(initiative.badge || '');
      setOfficialWebsiteUrl(initiative.officialWebsiteUrl || '');
      setShareUrl(initiative.shareUrl || '');
      setDescription(initiative.description || '');
      setPurpose(initiative.purpose || '');
      setObjectives(joinLines(initiative.objectives));
      setBasicInformation(joinLines(initiative.basicInformation));
      setBenefits(joinLines(initiative.benefits));
      setContact(joinLines(initiative.contact));
      setSupportOffered(parseSupportOffered(initiative.supportOffered));
      setShowAbout(initiative.showAbout ?? true);
      setShowSupportOffered(initiative.showSupportOffered ?? true);
      setShowBenefits(initiative.showBenefits ?? true);
      setShowApplicationForm(initiative.showApplicationForm ?? true);
      setIsFeatured(Boolean(initiative.isFeatured));
      setIsListed(initiative.isListed ?? true);
      setStatus(initiative.status || 'Draft');
    } else {
      setTitle('');
      setTitleAr('');
      setSubtitle('');
      setSubtitleAr('');
      setCategory('');
      setEmirates('');
      setStartDate('');
      setEndDate('');
      setCoverImage('');
      setBadge('');
      setOfficialWebsiteUrl('');
      setShareUrl('');
      setDescription('');
      setPurpose('');
      setObjectives('');
      setBasicInformation('');
      setBenefits('');
      setContact('');
      setSupportOffered(emptySupportOffered());
      setShowAbout(true);
      setShowSupportOffered(true);
      setShowBenefits(true);
      setShowApplicationForm(true);
      setIsFeatured(false);
      setIsListed(true);
      setStatus('Draft');
    }

    setError('');
    createInitiative.reset();
    updateInitiative.reset();
  }, [initiative, isOpen]);

  const mutation = initiative ? updateInitiative : createInitiative;
  const isPending = mutation.isPending;

  function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!category.trim()) {
      setError('Category is required.');
      return;
    }

    if (!emirates.trim()) {
      setError('Emirates is required.');
      return;
    }

    const payload: Partial<Initiative> = {
      title: title.trim(),
      titleAr: titleAr.trim(),
      subtitle: subtitle.trim(),
      subtitleAr: subtitleAr.trim(),
      category: category.trim(),
      emirates: emirates.trim(),
      startDate,
      endDate,
      coverImage,
      badge: badge.trim(),
      officialWebsiteUrl: officialWebsiteUrl.trim(),
      shareUrl: shareUrl.trim(),
      description: description.trim(),
      purpose: purpose.trim(),
      objectives: splitLines(objectives),
      basicInformation: splitLines(basicInformation),
      benefits: splitLines(benefits),
      contact: splitLines(contact),
      supportOffered,
      showAbout,
      showSupportOffered,
      showBenefits,
      showApplicationForm,
      isFeatured,
      isListed,
      status: status as Initiative['status'],
    };

    if (initiative) {
      updateInitiative.mutate(
        { id: initiative.id, payload },
        { onSuccess: () => onClose() },
      );
    } else {
      createInitiative.mutate(payload, { onSuccess: () => onClose() });
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
        {initiative ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initiative ? 'Edit Initiative' : 'Add Initiative'}
      footer={footer}
    >
      <div className="flex flex-col gap-8">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

        <div className="flex gap-8">
          <div className="flex-1">
            <Input
              label="Title"
              required
              placeholder="Enter initiative title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Title (Arabic)"
              placeholder="عنوان المبادرة"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input
              label="Subtitle"
              placeholder="Enter subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Subtitle (Arabic)"
              placeholder="العنوان الفرعي"
              value={subtitleAr}
              onChange={(e) => setSubtitleAr(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Select
              label="Category"
              required
              options={categoryOptions}
              placeholder="Select category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Emirates"
              options={EMIRATES_OPTIONS}
              placeholder="Select emirate"
              value={emirates}
              onChange={(e) => setEmirates(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input
              label="Start Date"
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="End Date"
              required
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input
              label="Badge"
              placeholder="Featured badge label"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input
              label="Official Website URL"
              placeholder="https://..."
              value={officialWebsiteUrl}
              onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Share URL"
              placeholder="https://..."
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <FileUpload
              value={coverImage}
              label="Upload Cover Image"
              onChange={setCoverImage}
            />
          </div>
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between rounded-[10px] border border-secondary/40 px-4 py-3">
              <div>
                <p className="text-sm font-semibold font-[family-name:var(--font-poppins)] text-text-primary">
                  Featured initiative
                </p>
                <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
                  Show this initiative as the highlighted card on the website.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-secondary/30 transition-colors peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </label>
            </div>

            <div className="flex items-center justify-between rounded-[10px] border border-secondary/40 px-4 py-3">
              <div>
                <p className="text-sm font-semibold font-[family-name:var(--font-poppins)] text-text-primary">
                  Show on Initiatives listing
                </p>
                <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
                  When off, this initiative only appears under its emirate.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isListed}
                  onChange={(e) => setIsListed(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-secondary/30 transition-colors peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 rounded-[10px] border border-secondary/30 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAbout}
                  onChange={(e) => setShowAbout(e.target.checked)}
                  className="h-4 w-4 accent-[#781E36]"
                />
                <span className="text-sm font-medium font-[family-name:var(--font-poppins)]">Show About</span>
              </label>
              <label className="flex items-center gap-3 rounded-[10px] border border-secondary/30 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSupportOffered}
                  onChange={(e) => setShowSupportOffered(e.target.checked)}
                  className="h-4 w-4 accent-[#781E36]"
                />
                <span className="text-sm font-medium font-[family-name:var(--font-poppins)]">Show Support</span>
              </label>
              <label className="flex items-center gap-3 rounded-[10px] border border-secondary/30 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBenefits}
                  onChange={(e) => setShowBenefits(e.target.checked)}
                  className="h-4 w-4 accent-[#781E36]"
                />
                <span className="text-sm font-medium font-[family-name:var(--font-poppins)]">Show Benefits</span>
              </label>
              <label className="flex items-center gap-3 rounded-[10px] border border-secondary/30 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showApplicationForm}
                  onChange={(e) => setShowApplicationForm(e.target.checked)}
                  className="h-4 w-4 accent-[#781E36]"
                />
                <span className="text-sm font-medium font-[family-name:var(--font-poppins)]">Show Application Form</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <Textarea
            label="Description"
            placeholder="Enter initiative description"
            rows={5}
            className="h-[149px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Textarea
            label="Purpose"
            placeholder="Enter initiative purpose"
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        <div>
          <Textarea
            label="Objectives"
            placeholder="One objective per line"
            rows={4}
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
          />
        </div>

        <div>
          <Textarea
            label="Basic Information"
            placeholder="One item per line"
            rows={4}
            value={basicInformation}
            onChange={(e) => setBasicInformation(e.target.value)}
          />
        </div>

        <div>
          <Textarea
            label="Benefits"
            placeholder="One benefit per line"
            rows={4}
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
          />
        </div>

        <div>
          <Textarea
            label="Contact"
            placeholder="One contact item per line"
            rows={4}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
            Support Offered
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORT_OPTIONS.map((option) => (
              <label key={option.key} className="flex items-center gap-3 rounded-[10px] border border-secondary/30 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(supportOffered[option.key])}
                  onChange={(e) =>
                    setSupportOffered({
                      ...supportOffered,
                      [option.key]: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#781E36]"
                />
                <span className="text-sm font-medium font-[family-name:var(--font-poppins)]">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
