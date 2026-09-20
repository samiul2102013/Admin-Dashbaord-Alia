'use client';

import { useCallback, useState, useEffect, type ChangeEvent } from 'react';
import { Info, Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import VisibilityGroups, {
  countHidden,
  type VisibilityGroup,
} from '@/components/shared/VisibilityGroups';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import StatusField from '@/components/shared/StatusField';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { EMIRATES_OPTIONS } from '@/lib/constants';
import { getEmirate } from '@/lib/services/emirates';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import { getErrorMessage } from '@/lib/api-client';
import { useCreateEmirate, useUpdateEmirate } from '@/hooks/useEmirates';
import { useUpload } from '@/hooks/useMeta';
import type { Emirates } from '@/types/emirates';

interface EmiratesModalProps {
  isOpen: boolean;
  onClose: () => void;
  emirates?: Emirates | null;
}

type EmiratesSectionKey = 'details' | 'media' | 'display';

const initialSections: Record<EmiratesSectionKey, boolean> = {
  details: false,
  media: false,
  display: false,
};

const EMIRATES_VISIBILITY_GROUPS: VisibilityGroup[] = [
  {
    title: 'Status Badge',
    description: 'the status label on the emirate page',
    icon: Info,
    items: [
      { key: 'showStatus', label: 'Status Badge', description: 'Shows the status badge/label on the public emirate page.' },
    ],
  },
];

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
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [serviceCenters, setServiceCenters] = useState('');
  const [centerCount, setCenterCount] = useState('');
  const [centerCountAr, setCenterCountAr] = useState('');
  const [image, setImage] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [showStatus, setShowStatus] = useState(true);
  const [status, setStatus] = useState('Draft');
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Record<EmiratesSectionKey, boolean>>(initialSections);

  useEffect(() => {
    if (emirates) {
      setEmiratesName(emirates.emiratesName || '');
      setEmiratesNameAr(emirates.emiratesNameAr || '');
      setTitle(emirates.title || '');
      setTitleAr(emirates.titleAr || '');
      setDescription(emirates.description || '');
      setDescriptionAr(emirates.descriptionAr || '');
      setDateTime(emirates.dateTime || '');
      setContactPhone(emirates.contactPhone || '');
      setServiceCenters(
        emirates.serviceCenters != null ? String(emirates.serviceCenters) : '',
      );
      setCenterCount(emirates.centerCount || '');
      setCenterCountAr(emirates.centerCountAr || '');
      setImage(emirates.image || '');
      setWebsiteUrl(emirates.websiteUrl || '');
      setShowStatus(emirates.showStatus ?? true);
      setStatus(emirates.status || 'Draft');
      setMachineFlags({
        emiratesNameAr: getIsMachineFlag(emirates, 'emiratesNameAr'),
        titleAr: getIsMachineFlag(emirates, 'titleAr'),
        descriptionAr: getIsMachineFlag(emirates, 'descriptionAr'),
        centerCountAr: getIsMachineFlag(emirates, 'centerCountAr'),
      });
      setFailedFields(new Set());
    } else {
      setEmiratesName('');
      setEmiratesNameAr('');
      setTitle('');
      setTitleAr('');
      setDescription('');
      setDescriptionAr('');
      setDateTime('');
      setContactPhone('');
      setServiceCenters('');
      setCenterCount('');
      setCenterCountAr('');
      setImage('');
      setWebsiteUrl('');
      setShowStatus(true);
      setStatus('Draft');
      setMachineFlags({});
      setFailedFields(new Set());
    }

    setError('');
    createEmirate.reset();
    updateEmirate.reset();
    setOpenSections(initialSections);
  }, [emirates, isOpen]);

  const mutation = emirates ? updateEmirate : createEmirate;
  const isPending = mutation.isPending || upload.isPending;

  function toggleSection(key: EmiratesSectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

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
      titleAr: titleAr.trim(),
      description: description.trim(),
      descriptionAr: descriptionAr.trim(),
      dateTime: dateTime || undefined,
      contactPhone: contactPhone.trim(),
      serviceCenters: serviceCenters ? Number(serviceCenters) : 0,
      centerCount: centerCount.trim(),
      centerCountAr: centerCountAr.trim(),
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

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    if (!emirates) return;
    const fresh = await getEmirate(emirates.id);
    setEmiratesNameAr(fresh.emiratesNameAr || '');
    setTitleAr(fresh.titleAr || '');
    setDescriptionAr(fresh.descriptionAr || '');
    setCenterCountAr(fresh.centerCountAr || '');
    setMachineFlags({
      emiratesNameAr: getIsMachineFlag(fresh, 'emiratesNameAr'),
      titleAr: getIsMachineFlag(fresh, 'titleAr'),
      descriptionAr: getIsMachineFlag(fresh, 'descriptionAr'),
      centerCountAr: getIsMachineFlag(fresh, 'centerCountAr'),
    });
    const failed = new Set<string>();
    if ((fresh.emiratesName || '').trim() && !(fresh.emiratesNameAr || '').trim()) failed.add('emiratesNameAr');
    if ((fresh.title || '').trim() && !(fresh.titleAr || '').trim()) failed.add('titleAr');
    if ((fresh.description || '').trim() && !(fresh.descriptionAr || '').trim()) failed.add('descriptionAr');
    if ((fresh.centerCount || '').trim() && !(fresh.centerCountAr || '').trim()) failed.add('centerCountAr');
    setFailedFields(failed);
  }, [emirates]);

  const translationStates: TranslationState[] = [
    getTranslationState(emiratesName, emiratesNameAr, machineFlags.emiratesNameAr, failedFields.has('emiratesNameAr')),
    getTranslationState(title, titleAr, machineFlags.titleAr, failedFields.has('titleAr')),
    getTranslationState(description, descriptionAr, machineFlags.descriptionAr, failedFields.has('descriptionAr')),
    getTranslationState(centerCount, centerCountAr, machineFlags.centerCountAr, failedFields.has('centerCountAr')),
  ];

  const emiratesToggles: Record<string, boolean> = { showStatus };
  const hiddenCount = countHidden(EMIRATES_VISIBILITY_GROUPS, emiratesToggles);

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
    <TranslationProvider model="emirate" id={emirates?.id} onTranslated={reloadTranslations}>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={emirates ? 'Edit Emirates Record' : 'Add Emirates Record'}
      footer={footer}
    >
      <div className="flex flex-col gap-8">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

        <TranslationToolbar states={translationStates} title={emiratesName || undefined} />

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
            <ArabicField
              label="Emirates Name (Arabic)"
              placeholder="اسم الإمارة"
              englishValue={emiratesName}
              value={emiratesNameAr}
              onChange={setEmiratesNameAr}
              isMachine={machineFlags.emiratesNameAr}
              failed={failedFields.has('emiratesNameAr')}
            />
          </div>
        </div>

        <CollapsibleSection
          title="Details"
          hint="Contact and service info"
          isOpen={openSections.details}
          onToggle={() => toggleSection('details')}
        >
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

          <div className="flex gap-8">
            <div className="flex-1">
              <ArabicField
                label="Title (Arabic)"
                placeholder="العنوان"
                englishValue={title}
                value={titleAr}
                onChange={setTitleAr}
                isMachine={machineFlags.titleAr}
                failed={failedFields.has('titleAr')}
              />
            </div>
            <div className="flex-1" />
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

          <div>
            <ArabicField
              label="Description (Arabic)"
              placeholder="الوصف"
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
              <ArabicField
                label="Center Count (Arabic)"
                placeholder="عدد المراكز"
                englishValue={centerCount}
                value={centerCountAr}
                onChange={setCenterCountAr}
                isMachine={machineFlags.centerCountAr}
                failed={failedFields.has('centerCountAr')}
              />
            </div>
            <div className="flex-1" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Media"
          hint="Cover image"
          isOpen={openSections.media}
          onToggle={() => toggleSection('media')}
        >
          <FileUpload
            value={image}
            label="Upload Emirate Image"
            isUploading={upload.isPending}
            onUpload={handleImageFile}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Display Options"
          hint={hiddenCount > 0 ? `${hiddenCount} of ${EMIRATES_VISIBILITY_GROUPS.flatMap((g) => g.items).length} sections hidden` : 'All sections visible'}
          isOpen={openSections.display}
          onToggle={() => toggleSection('display')}
        >
          <VisibilityGroups
            groups={EMIRATES_VISIBILITY_GROUPS}
            toggles={emiratesToggles}
            onChange={(key, checked) => {
              if (key === 'showStatus') setShowStatus(checked);
            }}
            intro="Each group below controls one part of the public emirate page. Hiding a section removes it for visitors — the emirate and its content are not affected."
          />

          <StatusField value={status} onChange={setStatus} />
        </CollapsibleSection>
      </div>
    </Modal>
    </TranslationProvider>
  );
}