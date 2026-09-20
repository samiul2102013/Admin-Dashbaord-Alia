'use client';

import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import ChunkedUploader from '@/components/shared/ChunkedUploader';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import StatusField from '@/components/shared/StatusField';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { EMIRATES_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { getInitiative } from '@/lib/services/initiatives';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
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

type InitiativeSectionKey = 'classification' | 'media' | 'about' | 'benefits' | 'display';

const initialSections: Record<InitiativeSectionKey, boolean> = {
  classification: false,
  media: false,
  about: true,
  benefits: true,
  display: false,
};

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
  const [badgeAr, setBadgeAr] = useState('');
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [purpose, setPurpose] = useState('');
  const [purposeAr, setPurposeAr] = useState('');
  const [objectives, setObjectives] = useState('');
  const [objectivesAr, setObjectivesAr] = useState('');
  const [basicInformation, setBasicInformation] = useState('');
  const [basicInformationAr, setBasicInformationAr] = useState('');
  const [benefits, setBenefits] = useState('');
  const [benefitsAr, setBenefitsAr] = useState('');
  const [contact, setContact] = useState('');
  const [contactAr, setContactAr] = useState('');
  const [supportOffered, setSupportOffered] = useState(emptySupportOffered());
  const [showAbout, setShowAbout] = useState(true);
  const [showSupportOffered, setShowSupportOffered] = useState(true);
  const [showBenefits, setShowBenefits] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isListed, setIsListed] = useState(true);
  const [status, setStatus] = useState('Draft');
  const [error, setError] = useState('');
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Record<InitiativeSectionKey, boolean>>(initialSections);

  function toggleSection(key: InitiativeSectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

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
      setBadgeAr(initiative.badgeAr || '');
      setOfficialWebsiteUrl(initiative.officialWebsiteUrl || '');
      setShareUrl(initiative.shareUrl || '');
      setDescription(initiative.description || '');
      setDescriptionAr(initiative.descriptionAr || '');
      setPurpose(initiative.purpose || '');
      setPurposeAr(initiative.purposeAr || '');
      setObjectives(joinLines(initiative.objectives));
      setObjectivesAr(joinLines((initiative as any).objectivesAr));
      setBasicInformation(joinLines(initiative.basicInformation));
      setBasicInformationAr(joinLines((initiative as any).basicInformationAr));
      setBenefits(joinLines(initiative.benefits));
      setBenefitsAr(joinLines((initiative as any).benefitsAr));
      setContact(joinLines(initiative.contact));
      setContactAr(joinLines((initiative as any).contactAr));
      setSupportOffered(parseSupportOffered(initiative.supportOffered));
      setShowAbout(initiative.showAbout ?? true);
      setShowSupportOffered(initiative.showSupportOffered ?? true);
      setShowBenefits(initiative.showBenefits ?? true);
      setShowApplicationForm(initiative.showApplicationForm ?? true);
      setIsFeatured(Boolean(initiative.isFeatured));
      setIsListed(initiative.isListed ?? true);
      setStatus(initiative.status || 'Draft');
      setMachineFlags({
        titleAr: getIsMachineFlag(initiative, 'titleAr'),
        subtitleAr: getIsMachineFlag(initiative, 'subtitleAr'),
        descriptionAr: getIsMachineFlag(initiative, 'descriptionAr'),
        purposeAr: getIsMachineFlag(initiative, 'purposeAr'),
        badgeAr: getIsMachineFlag(initiative, 'badgeAr'),
        objectivesAr: getIsMachineFlag(initiative, 'objectivesAr'),
        benefitsAr: getIsMachineFlag(initiative, 'benefitsAr'),
      });
      setFailedFields(new Set());
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
      setBadgeAr('');
      setOfficialWebsiteUrl('');
      setShareUrl('');
      setDescription('');
      setDescriptionAr('');
      setPurpose('');
      setPurposeAr('');
      setObjectives('');
      setObjectivesAr('');
      setBasicInformation('');
      setBasicInformationAr('');
      setBenefits('');
      setBenefitsAr('');
      setContact('');
      setContactAr('');
      setSupportOffered(emptySupportOffered());
      setShowAbout(true);
      setShowSupportOffered(true);
      setShowBenefits(true);
      setShowApplicationForm(true);
      setIsFeatured(false);
      setIsListed(true);
      setStatus('Draft');
      setMachineFlags({});
      setFailedFields(new Set());
    }

    setError('');
    setOpenSections(initialSections);
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
      badgeAr: badgeAr.trim(),
      officialWebsiteUrl: officialWebsiteUrl.trim(),
      shareUrl: shareUrl.trim(),
      description: description.trim(),
      descriptionAr: descriptionAr.trim(),
      purpose: purpose.trim(),
      purposeAr: purposeAr.trim(),
      objectives: splitLines(objectives),
      objectivesAr: splitLines(objectivesAr),
      basicInformation: splitLines(basicInformation),
      benefits: splitLines(benefits),
      benefitsAr: splitLines(benefitsAr),
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

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    if (!initiative) return;
    const fresh = await getInitiative(initiative.id);
    setTitleAr(fresh.titleAr || '');
    setSubtitleAr(fresh.subtitleAr || '');
    setDescriptionAr(fresh.descriptionAr || '');
    setPurposeAr(fresh.purposeAr || '');
    setBadgeAr(fresh.badgeAr || '');
    setObjectivesAr(joinLines((fresh as any).objectivesAr));
    setBenefitsAr(joinLines((fresh as any).benefitsAr));
    setMachineFlags({
      titleAr: getIsMachineFlag(fresh, 'titleAr'),
      subtitleAr: getIsMachineFlag(fresh, 'subtitleAr'),
      descriptionAr: getIsMachineFlag(fresh, 'descriptionAr'),
      purposeAr: getIsMachineFlag(fresh, 'purposeAr'),
      badgeAr: getIsMachineFlag(fresh, 'badgeAr'),
      objectivesAr: getIsMachineFlag(fresh, 'objectivesAr'),
      benefitsAr: getIsMachineFlag(fresh, 'benefitsAr'),
    });
    const failed = new Set<string>();
    if ((fresh.title || '').trim() && !(fresh.titleAr || '').trim()) failed.add('titleAr');
    if ((fresh.subtitle || '').trim() && !(fresh.subtitleAr || '').trim()) failed.add('subtitleAr');
    if ((fresh.description || '').trim() && !(fresh.descriptionAr || '').trim()) failed.add('descriptionAr');
    if ((fresh.purpose || '').trim() && !(fresh.purposeAr || '').trim()) failed.add('purposeAr');
    if ((fresh.badge || '').trim() && !(fresh.badgeAr || '').trim()) failed.add('badgeAr');
    if ((fresh.objectives || []).length && !((fresh as any).objectivesAr || []).length) failed.add('objectivesAr');
    if ((fresh.benefits || []).length && !((fresh as any).benefitsAr || []).length) failed.add('benefitsAr');
    setFailedFields(failed);
  }, [initiative]);

  const translationStates: TranslationState[] = [
    getTranslationState(title, titleAr, machineFlags.titleAr, failedFields.has('titleAr')),
    getTranslationState(subtitle, subtitleAr, machineFlags.subtitleAr, failedFields.has('subtitleAr')),
    getTranslationState(description, descriptionAr, machineFlags.descriptionAr, failedFields.has('descriptionAr')),
    getTranslationState(purpose, purposeAr, machineFlags.purposeAr, failedFields.has('purposeAr')),
    getTranslationState(badge, badgeAr, machineFlags.badgeAr, failedFields.has('badgeAr')),
    getTranslationState(objectives, objectivesAr, machineFlags.objectivesAr, failedFields.has('objectivesAr')),
    getTranslationState(benefits, benefitsAr, machineFlags.benefitsAr, failedFields.has('benefitsAr')),
  ];

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
    <TranslationProvider model="initiative" id={initiative?.id} onTranslated={reloadTranslations}>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initiative ? 'Edit Initiative' : 'Add Initiative'}
      footer={footer}
    >
      <div className="flex flex-col gap-8">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

        <TranslationToolbar states={translationStates} title={title || undefined} />

        {/* Title + Subtitle always visible at top */}
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
            <ArabicField
              label="Title (Arabic)"
              placeholder="عنوان المبادرة"
              englishValue={title}
              value={titleAr}
              onChange={setTitleAr}
              isMachine={machineFlags.titleAr}
              failed={failedFields.has('titleAr')}
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
            <ArabicField
              label="Subtitle (Arabic)"
              placeholder="العنوان الفرعي"
              englishValue={subtitle}
              value={subtitleAr}
              onChange={setSubtitleAr}
              isMachine={machineFlags.subtitleAr}
              failed={failedFields.has('subtitleAr')}
            />
          </div>
        </div>

        {/* Classification */}
        <CollapsibleSection
          title="Classification"
          hint="Category, emirate, dates"
          isOpen={openSections.classification}
          onToggle={() => toggleSection('classification')}
        >
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
              <ArabicField
                label="Badge (Arabic)"
                placeholder="شارة مميزة"
                englishValue={badge}
                value={badgeAr}
                onChange={setBadgeAr}
                isMachine={machineFlags.badgeAr}
                failed={failedFields.has('badgeAr')}
              />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <StatusField value={status} onChange={setStatus} />
            </div>
            <div className="flex-1" />
          </div>
        </CollapsibleSection>

        {/* Media & URLs */}
        <CollapsibleSection
          title="Media & URLs"
          hint="Cover image and links"
          isOpen={openSections.media}
          onToggle={() => toggleSection('media')}
        >
          <div className="flex gap-8">
            <div className="flex-1">
              <FileUpload
                value={coverImage}
                label="Upload Cover Image"
                onChange={setCoverImage}
              />
            </div>
            <div className="flex-1 flex flex-col justify-end gap-4">
              <Input
                label="Official Website URL"
                placeholder="https://..."
                value={officialWebsiteUrl}
                onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
              />
              <Input
                label="Share URL"
                placeholder="https://..."
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* About */}
        <CollapsibleSection
          title="About"
          hint="Description and objectives"
          isOpen={openSections.about}
          onToggle={() => toggleSection('about')}
        >
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
            <ArabicField
              label="Description (Arabic)"
              placeholder="وصف المبادرة"
              multiline
              rows={5}
              englishValue={description}
              value={descriptionAr}
              onChange={setDescriptionAr}
              isMachine={machineFlags.descriptionAr}
              failed={failedFields.has('descriptionAr')}
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
            <ArabicField
              label="Purpose (Arabic)"
              placeholder="الغرض من المبادرة"
              multiline
              rows={4}
              englishValue={purpose}
              value={purposeAr}
              onChange={setPurposeAr}
              isMachine={machineFlags.purposeAr}
              failed={failedFields.has('purposeAr')}
            />
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Textarea
                label="Objectives"
                placeholder="One objective per line"
                rows={4}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <ArabicField
                label="Objectives (Arabic)"
                placeholder="هدف واحد في كل سطر"
                multiline
                rows={4}
                englishValue={objectives}
                value={objectivesAr}
                onChange={setObjectivesAr}
                isMachine={machineFlags.objectivesAr}
                failed={failedFields.has('objectivesAr')}
              />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Textarea
                label="Basic Information"
                placeholder="One item per line"
                rows={4}
                value={basicInformation}
                onChange={(e) => setBasicInformation(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Textarea
                label="Basic Information (Arabic)"
                placeholder="معلومة واحدة في كل سطر"
                rows={4}
                value={basicInformationAr}
                onChange={(e) => setBasicInformationAr(e.target.value)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Benefits & Support */}
        <CollapsibleSection
          title="Benefits & Support"
          hint="Support types and benefits"
          isOpen={openSections.benefits}
          onToggle={() => toggleSection('benefits')}
        >
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

          <div className="flex gap-8">
            <div className="flex-1">
              <Textarea
                label="Benefits"
                placeholder="One benefit per line"
                rows={4}
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <ArabicField
                label="Benefits (Arabic)"
                placeholder="فائدة واحدة في كل سطر"
                multiline
                rows={4}
                englishValue={benefits}
                value={benefitsAr}
                onChange={setBenefitsAr}
                isMachine={machineFlags.benefitsAr}
                failed={failedFields.has('benefitsAr')}
              />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Textarea
                label="Contact"
                placeholder="One contact item per line"
                rows={4}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Textarea
                label="Contact (Arabic)"
                placeholder="جهة اتصال واحدة في كل سطر"
                rows={4}
                value={contactAr}
                onChange={(e) => setContactAr(e.target.value)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Display Options */}
        <CollapsibleSection
          title="Display Options"
          hint="Toggle visibility"
          isOpen={openSections.display}
          onToggle={() => toggleSection('display')}
        >
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
        </CollapsibleSection>
      </div>
    </Modal>
    </TranslationProvider>
  );
}
