'use client';

import { useCallback, useState, useEffect, type ChangeEvent } from 'react';
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import Select from '@/components/shared/Select';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import VisibilityGroups, {
  countHidden,
  type VisibilityGroup,
} from '@/components/shared/VisibilityGroups';
import StatusField from '@/components/shared/StatusField';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { getConsultation } from '@/lib/services/consultations';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import {
  EMIRATES_OPTIONS,
  SESSION_TYPE_OPTIONS,
  MARITAL_STAGE_OPTIONS,
  LANGUAGE_OPTIONS,
} from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { useCreateConsultation, useUpdateConsultation } from '@/hooks/useConsultations';
import { useUpload } from '@/hooks/useMeta';
import type { Consultation } from '@/types/consultations';

interface ConsultationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation?: Consultation | null;
}

const MEETING_FORMAT_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'onsite', label: 'Onsite' },
];

type ConsultationSectionKey = 'schedule' | 'pricing' | 'counselor' | 'content' | 'display';

const initialSections: Record<ConsultationSectionKey, boolean> = {
  schedule: false,
  pricing: false,
  counselor: false,
  content: false,
  display: false,
};

// Groups mirror the order sections appear on the public session detail page.
const CONSULTATION_VISIBILITY_GROUPS: VisibilityGroup[] = [
  {
    title: 'Doctor / Counselor',
    description: 'the counselor card',
    icon: User,
    items: [
      { key: 'showDoctor', label: 'Counselor Card', description: 'Shows the counselor name, photo, title and bio.' },
    ],
  },
  {
    title: 'Learn More',
    description: 'the learn-more block',
    icon: BookOpen,
    items: [
      { key: 'showLearnMore', label: 'Learn More Section', description: 'Shows the additional learn-more content for the session.' },
    ],
  },
  {
    title: 'Gallery',
    description: 'the session images',
    icon: ImageIcon,
    items: [
      { key: 'showGallery', label: 'Image Gallery', description: 'Shows the large image and thumbnail gallery.' },
    ],
  },
  {
    title: 'Schedule',
    description: 'date, time & time zone',
    icon: Calendar,
    items: [
      { key: 'showSchedule', label: 'Schedule Section', description: 'Shows the session date, start/end time and time zone.' },
    ],
  },
  {
    title: 'Booking',
    description: 'the booking call-to-action',
    icon: CalendarCheck,
    items: [
      { key: 'showBooking', label: 'Booking CTA', description: 'Shows the booking button. Use "Bookable" in Content to block actual bookings.' },
    ],
  },
];

interface ItemListEditorProps {
  label: string;
  itemsEn: string[];
  itemsAr: string[];
  onChange: (nextEn: string[], nextAr: string[]) => void;
  enPlaceholder?: string;
  arPlaceholder?: string;
  addLabel?: string;
}

function ItemListEditor({
  label,
  itemsEn,
  itemsAr,
  onChange,
  enPlaceholder,
  arPlaceholder,
  addLabel = 'Add item',
}: ItemListEditorProps) {
  const rowCount = Math.max(itemsEn.length, itemsAr.length);

  const setAt = (index: number, patch: { en?: string; ar?: string }) => {
    const nextEn = [...itemsEn];
    const nextAr = [...itemsAr];
    if (patch.en !== undefined) nextEn[index] = patch.en;
    if (patch.ar !== undefined) nextAr[index] = patch.ar;
    onChange(nextEn, nextAr);
  };

  const add = () => onChange([...itemsEn, ''], [...itemsAr, '']);

  const remove = (index: number) =>
    onChange(
      itemsEn.filter((_, i) => i !== index),
      itemsAr.filter((_, i) => i !== index),
    );

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
        {label}
      </span>
      {Array.from({ length: rowCount }).map((_, i) => (
        <div key={i} className="flex flex-col md:flex-row items-start gap-3">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                label={`Item ${i + 1}`}
                placeholder={enPlaceholder}
                value={itemsEn[i] ?? ''}
                onChange={(e) => setAt(i, { en: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <ArabicField
                label={`Item ${i + 1} (Arabic)`}
                statusOnly
                multiline
                rows={2}
                placeholder={arPlaceholder}
                englishValue={itemsEn[i] ?? ''}
                value={itemsAr[i] ?? ''}
                onChange={(v) => setAt(i, { ar: v })}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-[26px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
            aria-label={`Remove ${label} item`}
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add}>
        <Plus size={16} /> {addLabel}
      </Button>
    </div>
  );
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
    </div>
  );
}

export default function ConsultationsModal({ isOpen, onClose, consultation }: ConsultationsModalProps) {
  const createConsultation = useCreateConsultation();
  const updateConsultation = useUpdateConsultation();
  const upload = useUpload();

  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTitleAr, setSessionTitleAr] = useState('');
  const [category, setCategory] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [emirates, setEmirates] = useState('');
  const [maritalStage, setMaritalStage] = useState('');
  const [language, setLanguage] = useState('');
  const [date, setDate] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [meetingFormat, setMeetingFormat] = useState('online');
  const [sessionLink, setSessionLink] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [fee, setFee] = useState('');
  const [processingFee, setProcessingFee] = useState('');
  const [discount, setDiscount] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [counselor, setCounselor] = useState('');
  const [counselorAr, setCounselorAr] = useState('');
  const [counselorPhoto, setCounselorPhoto] = useState('');
  const [counselorTitle, setCounselorTitle] = useState('');
  const [counselorTitleAr, setCounselorTitleAr] = useState('');
  const [counselorBio, setCounselorBio] = useState('');
  const [counselorBioAr, setCounselorBioAr] = useState('');
  const [gallery, setGallery] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [objectivesAr, setObjectivesAr] = useState<string[]>([]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([]);
  const [whatYouWillLearnAr, setWhatYouWillLearnAr] = useState<string[]>([]);
  const [whoShouldAttend, setWhoShouldAttend] = useState<string[]>([]);
  const [whoShouldAttendAr, setWhoShouldAttendAr] = useState<string[]>([]);
  const [schedule, setSchedule] = useState('');
  const [bookingNotice, setBookingNotice] = useState('');
  const [bookingNoticeAr, setBookingNoticeAr] = useState('');
  const [showDoctor, setShowDoctor] = useState(true);
  const [showLearnMore, setShowLearnMore] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [showSchedule, setShowSchedule] = useState(true);
  const [showBooking, setShowBooking] = useState(true);
  const [isBookable, setIsBookable] = useState(true);
  const [status, setStatus] = useState('Draft');
  const [error, setError] = useState('');
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Record<ConsultationSectionKey, boolean>>(initialSections);

  const coverImage = (consultation?.gallery && Array.isArray(consultation.gallery) && consultation.gallery[0]) || gallery;

  useEffect(() => {
    if (consultation) {
      setSessionTitle(consultation.sessionTitle || '');
      setSessionTitleAr(consultation.sessionTitleAr || '');
      setCategory(consultation.category || '');
      setSessionType(consultation.sessionType || '');
      setEmirates(consultation.emirates || '');
      setMaritalStage(consultation.maritalStage || '');
      setLanguage(consultation.language || '');
      setDate(consultation.date || '');
      setPublishedDate(consultation.publishedDate || '');
      setStartTime(consultation.startTime || '');
      setEndTime(consultation.endTime || '');
      setDuration(consultation.duration || '');
      setTimeZone(consultation.timeZone || '');
      setMeetingFormat(consultation.meetingFormat || 'online');
      setSessionLink(consultation.sessionLink || '');
      setIsFree(consultation.isFree ?? true);
      setFee(consultation.fee != null ? String(consultation.fee) : '');
      setProcessingFee(consultation.processingFee != null ? String(consultation.processingFee) : '');
      setDiscount(consultation.discount != null ? String(consultation.discount) : '');
      setMaxParticipants(consultation.maxParticipants != null ? String(consultation.maxParticipants) : '');
      setCounselor(consultation.counselor || '');
      setCounselorAr(consultation.counselorAr || '');
      setCounselorPhoto(consultation.counselorPhoto || '');
      setCounselorTitle(consultation.counselorTitle || '');
      setCounselorTitleAr(consultation.counselorTitleAr || '');
      setCounselorBio(consultation.counselorBio || '');
      setCounselorBioAr(consultation.counselorBioAr || '');
      setGallery(Array.isArray(consultation.gallery) && consultation.gallery[0] ? consultation.gallery[0] : '');
      setDescription(consultation.description || '');
      setDescriptionAr(consultation.descriptionAr || '');
      setObjectives(consultation.objectives ?? []);
      setObjectivesAr(consultation.objectivesAr ?? []);
      setWhatYouWillLearn(consultation.whatYouWillLearn ?? []);
      setWhatYouWillLearnAr(consultation.whatYouWillLearnAr ?? []);
      setWhoShouldAttend(consultation.whoShouldAttend ?? []);
      setWhoShouldAttendAr(consultation.whoShouldAttendAr ?? []);
      setSchedule(typeof consultation.schedule === 'string' ? consultation.schedule : '');
      setBookingNotice(consultation.bookingNotice || '');
      setBookingNoticeAr(consultation.bookingNoticeAr || '');
      setShowDoctor(consultation.showDoctor ?? true);
      setShowLearnMore(consultation.showLearnMore ?? true);
      setShowGallery(consultation.showGallery ?? true);
      setShowSchedule(consultation.showSchedule ?? true);
      setShowBooking(consultation.showBooking ?? true);
      setIsBookable(consultation.isBookable ?? true);
      setStatus(consultation.status || 'Draft');
      setMachineFlags({
        sessionTitleAr: getIsMachineFlag(consultation, 'sessionTitleAr'),
        counselorAr: getIsMachineFlag(consultation, 'counselorAr'),
        counselorTitleAr: getIsMachineFlag(consultation, 'counselorTitleAr'),
        counselorBioAr: getIsMachineFlag(consultation, 'counselorBioAr'),
        descriptionAr: getIsMachineFlag(consultation, 'descriptionAr'),
        bookingNoticeAr: getIsMachineFlag(consultation, 'bookingNoticeAr'),
      });
      setFailedFields(new Set());
    } else {
      setSessionTitle('');
      setSessionTitleAr('');
      setCategory('');
      setSessionType('');
      setEmirates('');
      setMaritalStage('');
      setLanguage('');
      setDate('');
      setPublishedDate('');
      setStartTime('');
      setEndTime('');
      setDuration('');
      setTimeZone('');
      setMeetingFormat('online');
      setSessionLink('');
      setIsFree(true);
      setFee('');
      setProcessingFee('');
      setDiscount('');
      setMaxParticipants('');
      setCounselor('');
      setCounselorAr('');
      setCounselorPhoto('');
      setCounselorTitle('');
      setCounselorTitleAr('');
      setCounselorBio('');
      setCounselorBioAr('');
      setGallery('');
      setDescription('');
      setDescriptionAr('');
      setObjectives([]);
      setObjectivesAr([]);
      setWhatYouWillLearn([]);
      setWhatYouWillLearnAr([]);
      setWhoShouldAttend([]);
      setWhoShouldAttendAr([]);
      setSchedule('');
      setBookingNotice('');
      setBookingNoticeAr('');
      setShowDoctor(true);
      setShowLearnMore(true);
      setShowGallery(true);
      setShowSchedule(true);
      setShowBooking(true);
      setIsBookable(true);
      setStatus('Draft');
      setMachineFlags({});
      setFailedFields(new Set());
    }

    setError('');
    setOpenSections(initialSections);
    createConsultation.reset();
    updateConsultation.reset();
    upload.reset();
  }, [consultation, isOpen]);

  useEffect(() => {
    if (createConsultation.isError) setError(getErrorMessage(createConsultation.error));
    if (updateConsultation.isError) setError(getErrorMessage(updateConsultation.error));
  }, [createConsultation.isError, createConsultation.error, updateConsultation.isError, updateConsultation.error]);

  const mutation = consultation ? updateConsultation : createConsultation;
  const isPending = mutation.isPending || upload.isPending;

  function toggleSection(key: ConsultationSectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleCoverFile(file: File) {
    setError('');
    try {
      const res = await upload.mutateAsync(file);
      setGallery(res.url);
    } catch (uploadError) {
      setError(`Image upload failed: ${getErrorMessage(uploadError)}`);
    }
  }

  function handleSubmit() {
    if (!sessionTitle.trim()) {
      setError('Session title is required.');
      return;
    }

    const galleryValue = gallery.trim() ? [gallery.trim()] : [];

    const payload: Partial<Consultation> = {
      sessionTitle: sessionTitle.trim(),
      sessionTitleAr: sessionTitleAr.trim() || undefined,
      category: category.trim() || undefined,
      sessionType: sessionType || undefined,
      emirates: emirates || undefined,
      maritalStage: maritalStage || undefined,
      language: language || undefined,
      date: date || undefined,
      publishedDate: publishedDate || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      duration: duration.trim() || undefined,
      timeZone: timeZone.trim() || undefined,
      meetingFormat: (meetingFormat || 'online') as Consultation['meetingFormat'],
      sessionLink: sessionLink.trim() || undefined,
      isFree,
      fee: fee !== '' ? Number(fee) : undefined,
      processingFee: processingFee !== '' ? Number(processingFee) : undefined,
      discount: discount !== '' ? Number(discount) : undefined,
      maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
      counselor: counselor.trim() || undefined,
      counselorAr: counselorAr.trim() || undefined,
      counselorPhoto: counselorPhoto.trim() || undefined,
      counselorTitle: counselorTitle.trim() || undefined,
      counselorTitleAr: counselorTitleAr.trim() || undefined,
      counselorBio: counselorBio.trim() || undefined,
      counselorBioAr: counselorBioAr.trim() || undefined,
      gallery: galleryValue,
      description: description.trim() || undefined,
      descriptionAr: descriptionAr.trim() || undefined,
      objectives,
      objectivesAr,
      whatYouWillLearn,
      whatYouWillLearnAr,
      whoShouldAttend,
      whoShouldAttendAr,
      bookingNotice: bookingNotice.trim() || undefined,
      bookingNoticeAr: bookingNoticeAr.trim() || undefined,
      showDoctor,
      showLearnMore,
      showGallery,
      showSchedule,
      showBooking,
      isBookable,
      status: status as Consultation['status'],
    };

    if (consultation) {
      updateConsultation.mutate(
        { id: consultation.id, payload },
        { onSuccess: () => onClose() },
      );
    } else {
      createConsultation.mutate(payload, { onSuccess: () => onClose() });
    }
  }

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    if (!consultation) return;
    const fresh = await getConsultation(consultation.id);
    setSessionTitleAr(fresh.sessionTitleAr || '');
    setCounselorAr(fresh.counselorAr || '');
    setCounselorTitleAr(fresh.counselorTitleAr || '');
    setCounselorBioAr(fresh.counselorBioAr || '');
    setDescriptionAr(fresh.descriptionAr || '');
    setBookingNoticeAr(fresh.bookingNoticeAr || '');
    setObjectivesAr(fresh.objectivesAr ?? []);
    setWhatYouWillLearnAr(fresh.whatYouWillLearnAr ?? []);
    setWhoShouldAttendAr(fresh.whoShouldAttendAr ?? []);
    setMachineFlags({
      sessionTitleAr: getIsMachineFlag(fresh, 'sessionTitleAr'),
      counselorAr: getIsMachineFlag(fresh, 'counselorAr'),
      counselorTitleAr: getIsMachineFlag(fresh, 'counselorTitleAr'),
      counselorBioAr: getIsMachineFlag(fresh, 'counselorBioAr'),
      descriptionAr: getIsMachineFlag(fresh, 'descriptionAr'),
      bookingNoticeAr: getIsMachineFlag(fresh, 'bookingNoticeAr'),
    });
    const failed = new Set<string>();
    if ((fresh.sessionTitle || '').trim() && !(fresh.sessionTitleAr || '').trim()) failed.add('sessionTitleAr');
    if ((fresh.counselor || '').trim() && !(fresh.counselorAr || '').trim()) failed.add('counselorAr');
    if ((fresh.counselorTitle || '').trim() && !(fresh.counselorTitleAr || '').trim()) failed.add('counselorTitleAr');
    if ((fresh.counselorBio || '').trim() && !(fresh.counselorBioAr || '').trim()) failed.add('counselorBioAr');
    if ((fresh.description || '').trim() && !(fresh.descriptionAr || '').trim()) failed.add('descriptionAr');
    if ((fresh.bookingNotice || '').trim() && !(fresh.bookingNoticeAr || '').trim()) failed.add('bookingNoticeAr');
    setFailedFields(failed);
  }, [consultation]);

  const translationStates: TranslationState[] = [
    getTranslationState(sessionTitle, sessionTitleAr, machineFlags.sessionTitleAr, failedFields.has('sessionTitleAr')),
    getTranslationState(counselor, counselorAr, machineFlags.counselorAr, failedFields.has('counselorAr')),
    getTranslationState(counselorTitle, counselorTitleAr, machineFlags.counselorTitleAr, failedFields.has('counselorTitleAr')),
    getTranslationState(counselorBio, counselorBioAr, machineFlags.counselorBioAr, failedFields.has('counselorBioAr')),
    getTranslationState(description, descriptionAr, machineFlags.descriptionAr, failedFields.has('descriptionAr')),
    getTranslationState(bookingNotice, bookingNoticeAr, machineFlags.bookingNoticeAr, failedFields.has('bookingNoticeAr')),
    getTranslationState(objectives.join('\n'), objectivesAr.join('\n'), undefined, false),
    getTranslationState(whatYouWillLearn.join('\n'), whatYouWillLearnAr.join('\n'), undefined, false),
    getTranslationState(whoShouldAttend.join('\n'), whoShouldAttendAr.join('\n'), undefined, false),
  ];

  const consultationToggles: Record<string, boolean> = {
    showDoctor,
    showLearnMore,
    showGallery,
    showSchedule,
    showBooking,
  };

  const setConsultationToggle = (key: string, checked: boolean) => {
    switch (key) {
      case 'showDoctor': setShowDoctor(checked); break;
      case 'showLearnMore': setShowLearnMore(checked); break;
      case 'showGallery': setShowGallery(checked); break;
      case 'showSchedule': setShowSchedule(checked); break;
      case 'showBooking': setShowBooking(checked); break;
    }
  };

  const hiddenCount = countHidden(CONSULTATION_VISIBILITY_GROUPS, consultationToggles);

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
        {consultation ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  const toggleRow = (checked: boolean, onChange: (v: boolean) => void, label: string) => (
    <label className="flex items-center gap-3 rounded-[10px] border border-secondary/30 px-4 py-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#781E36]" />
      <span className="text-sm font-medium font-[family-name:var(--font-poppins)]">{label}</span>
    </label>
  );

  return (
    <TranslationProvider model="consultation" id={consultation?.id} onTranslated={reloadTranslations}>
    <Modal isOpen={isOpen} onClose={onClose} title={consultation ? 'Edit Consultation Session' : 'Add Consultation Session'} footer={footer}>
      <div className="flex flex-col gap-8">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

        <TranslationToolbar states={translationStates} title={sessionTitle || undefined} />

        {/* Titles stay visible at the top */}
        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Session Title" required placeholder="Session title (English)" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
          </div>
          <div className="flex-1">
            <ArabicField
              label="Session Title (Arabic)"
              placeholder="عنوان الجلسة"
              englishValue={sessionTitle}
              value={sessionTitleAr}
              onChange={setSessionTitleAr}
              isMachine={machineFlags.sessionTitleAr}
              failed={failedFields.has('sessionTitleAr')}
            />
          </div>
        </div>

        <CollapsibleSection title="Schedule & Format" hint="Date, time, format" isOpen={openSections.schedule} onToggle={() => toggleSection('schedule')}>
          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Category" placeholder="e.g. Education" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="flex-1">
              <Select label="Session Type" options={SESSION_TYPE_OPTIONS} placeholder="Select type" value={sessionType} onChange={(e) => setSessionType(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Select label="Emirates" options={EMIRATES_OPTIONS} placeholder="Select emirate" value={emirates} onChange={(e) => setEmirates(e.target.value)} />
            </div>
            <div className="flex-1">
              <Select label="Marital Stage" options={MARITAL_STAGE_OPTIONS} placeholder="Select stage" value={maritalStage} onChange={(e) => setMaritalStage(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Select label="Language" options={LANGUAGE_OPTIONS} placeholder="Select language" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="Session Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              {/* Backend-managed: stamped on first publish; shown read-only. */}
              <Input label="Published Date (auto)" type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} disabled />
            </div>
            <div className="flex-1">
              <Input label="Duration" placeholder="e.g. 2 hours" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Start Time" placeholder="HH:MM" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="End Time" placeholder="HH:MM" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Time Zone" placeholder="e.g. GST (UTC+4)" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
            </div>
            <div className="flex-1">
              <Select label="Meeting Format" options={MEETING_FORMAT_OPTIONS} value={meetingFormat} onChange={(e) => setMeetingFormat(e.target.value)} />
            </div>
          </div>

          <div>
            <Input label="Session Link" placeholder="https://..." value={sessionLink} onChange={(e) => setSessionLink(e.target.value)} />
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Max Participants" type="number" placeholder="e.g. 20" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} />
            </div>
            <div className="flex-1" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Pricing" hint="Free or paid" isOpen={openSections.pricing} onToggle={() => toggleSection('pricing')}>
          <div className="flex gap-8 items-end">
            <div className="flex-1 flex items-center gap-3 rounded-[10px] border border-secondary/30 px-4 py-3 h-12">
              <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="h-4 w-4 accent-[#781E36]" />
              <span className="text-sm font-medium font-[family-name:var(--font-poppins)]">Free session</span>
            </div>
            <div className="flex-1">
              <Input label="Fee (AED)" type="number" value={fee} onChange={(e) => setFee(e.target.value)} disabled={isFree} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Processing Fee (AED)" type="number" value={processingFee} onChange={(e) => setProcessingFee(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="Discount (AED)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
          </div>

          <div>
            <Input label="Booking Notice" placeholder="Optional notice shown at booking" value={bookingNotice} onChange={(e) => setBookingNotice(e.target.value)} />
          </div>

          <div>
            <ArabicField
              label="Booking Notice (Arabic)"
              placeholder="ملاحظة الحجز"
              multiline
              rows={3}
              englishValue={bookingNotice}
              value={bookingNoticeAr}
              onChange={setBookingNoticeAr}
              isMachine={machineFlags.bookingNoticeAr}
              failed={failedFields.has('bookingNoticeAr')}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Counselor" hint="Session host" isOpen={openSections.counselor} onToggle={() => toggleSection('counselor')}>
          <div className="flex gap-8">
            <div className="flex-1">
              <FileUpload value={coverImage} label="Upload Session Image" isUploading={upload.isPending} onUpload={handleCoverFile} />
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex gap-8">
                <div className="flex-1">
                  <Input label="Counselor Name" placeholder="Enter counselor name" value={counselor} onChange={(e) => setCounselor(e.target.value)} />
                </div>
                <div className="flex-1">
                  <ArabicField
                    label="Counselor Name (Arabic)"
                    placeholder="اسم المستشار"
                    englishValue={counselor}
                    value={counselorAr}
                    onChange={setCounselorAr}
                    isMachine={machineFlags.counselorAr}
                    failed={failedFields.has('counselorAr')}
                  />
                </div>
              </div>
              <div className="flex gap-8">
                <div className="flex-1">
                  <Input label="Counselor Title" placeholder="e.g. Family Counselor" value={counselorTitle} onChange={(e) => setCounselorTitle(e.target.value)} />
                </div>
                <div className="flex-1">
                  <ArabicField
                    label="Counselor Title (Arabic)"
                    placeholder="المسمى الوظيفي للمستشار"
                    englishValue={counselorTitle}
                    value={counselorTitleAr}
                    onChange={setCounselorTitleAr}
                    isMachine={machineFlags.counselorTitleAr}
                    failed={failedFields.has('counselorTitleAr')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <FileUpload value={counselorPhoto} label="Upload Counselor Photo" isUploading={upload.isPending} onUpload={async (file) => {
                try {
                  const res = await upload.mutateAsync(file);
                  setCounselorPhoto(res.url);
                } catch (e) {
                  setError(`Counselor photo upload failed: ${getErrorMessage(e)}`);
                }
              }} />
            </div>
            <div className="flex-1">
              <Textarea label="Counselor Bio" placeholder="Counselor biography" rows={5} className="h-full" value={counselorBio} onChange={(e) => setCounselorBio(e.target.value)} />
            </div>
          </div>

          <div>
            <ArabicField
              label="Counselor Bio (Arabic)"
              placeholder="نبذة عن المستشار"
              multiline
              rows={5}
              englishValue={counselorBio}
              value={counselorBioAr}
              onChange={setCounselorBioAr}
              isMachine={machineFlags.counselorBioAr}
              failed={failedFields.has('counselorBioAr')}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Content" hint="Description and objectives" isOpen={openSections.content} onToggle={() => toggleSection('content')}>
          <div>
            <Textarea label="Description" placeholder="Enter session description" rows={5} className="h-[149px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <ArabicField
              label="Description (Arabic)"
              placeholder="وصف الجلسة"
              multiline
              rows={5}
              englishValue={description}
              value={descriptionAr}
              onChange={setDescriptionAr}
              isMachine={machineFlags.descriptionAr}
              failed={failedFields.has('descriptionAr')}
            />
          </div>

          <ItemListEditor
            label="Objectives"
            itemsEn={objectives}
            itemsAr={objectivesAr}
            onChange={(en, ar) => {
              setObjectives(en);
              setObjectivesAr(ar);
            }}
            enPlaceholder="Enter an objective"
            arPlaceholder="أدخل الهدف"
            addLabel="Add objective"
          />

          <ItemListEditor
            label="What You Will Learn"
            itemsEn={whatYouWillLearn}
            itemsAr={whatYouWillLearnAr}
            onChange={(en, ar) => {
              setWhatYouWillLearn(en);
              setWhatYouWillLearnAr(ar);
            }}
            enPlaceholder="Enter a learning outcome"
            arPlaceholder="أدخل مخرجات التعلم"
            addLabel="Add item"
          />

          <ItemListEditor
            label="Who Should Attend"
            itemsEn={whoShouldAttend}
            itemsAr={whoShouldAttendAr}
            onChange={(en, ar) => {
              setWhoShouldAttend(en);
              setWhoShouldAttendAr(ar);
            }}
            enPlaceholder="Enter an audience"
            arPlaceholder="أدخل الفئة المستهدفة"
            addLabel="Add audience"
          />

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Gallery" placeholder="Image URL" value={gallery} onChange={(e) => setGallery(e.target.value)} />
            </div>
            <div className="flex-1">
              <Textarea label="Schedule" placeholder="Schedule description" rows={3} value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            </div>
          </div>

          <div>
            {toggleRow(isBookable, setIsBookable, 'Bookable')}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Display Options"
          hint={hiddenCount > 0 ? `${hiddenCount} of ${CONSULTATION_VISIBILITY_GROUPS.flatMap((g) => g.items).length} sections hidden` : 'All sections visible'}
          isOpen={openSections.display}
          onToggle={() => toggleSection('display')}
        >
          <VisibilityGroups
            groups={CONSULTATION_VISIBILITY_GROUPS}
            toggles={consultationToggles}
            onChange={setConsultationToggle}
            intro="Each group below controls one section of the public session page, in the order it appears. Hiding a section removes it for visitors — the session and its content are not affected."
          />

          <div className="flex gap-8">
            <div className="flex-1">
              <StatusField value={status} onChange={setStatus} />
            </div>
            <div className="flex-1" />
          </div>
        </CollapsibleSection>
      </div>
    </Modal>
    </TranslationProvider>
  );
}