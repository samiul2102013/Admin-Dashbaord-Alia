'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import Select from '@/components/shared/Select';
import {
  EMIRATES_OPTIONS,
  SESSION_TYPE_OPTIONS,
  STATUS_OPTIONS,
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

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(values?: string[]) {
  return values?.join('\n') ?? '';
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
  const [counselorPhoto, setCounselorPhoto] = useState('');
  const [counselorTitle, setCounselorTitle] = useState('');
  const [counselorBio, setCounselorBio] = useState('');
  const [gallery, setGallery] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [whatYouWillLearn, setWhatYouWillLearn] = useState('');
  const [whoShouldAttend, setWhoShouldAttend] = useState('');
  const [schedule, setSchedule] = useState('');
  const [bookingNotice, setBookingNotice] = useState('');
  const [showDoctor, setShowDoctor] = useState(true);
  const [showLearnMore, setShowLearnMore] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [showSchedule, setShowSchedule] = useState(true);
  const [showBooking, setShowBooking] = useState(true);
  const [isBookable, setIsBookable] = useState(true);
  const [status, setStatus] = useState('Draft');
  const [error, setError] = useState('');

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
      setCounselorPhoto(consultation.counselorPhoto || '');
      setCounselorTitle(consultation.counselorTitle || '');
      setCounselorBio(consultation.counselorBio || '');
      setGallery(Array.isArray(consultation.gallery) && consultation.gallery[0] ? consultation.gallery[0] : '');
      setDescription(consultation.description || '');
      setObjectives(joinLines(consultation.objectives));
      setWhatYouWillLearn(joinLines(consultation.whatYouWillLearn));
      setWhoShouldAttend(joinLines(consultation.whoShouldAttend));
      setSchedule(typeof consultation.schedule === 'string' ? consultation.schedule : '');
      setBookingNotice(consultation.bookingNotice || '');
      setShowDoctor(consultation.showDoctor ?? true);
      setShowLearnMore(consultation.showLearnMore ?? true);
      setShowGallery(consultation.showGallery ?? true);
      setShowSchedule(consultation.showSchedule ?? true);
      setShowBooking(consultation.showBooking ?? true);
      setIsBookable(consultation.isBookable ?? true);
      setStatus(consultation.status || 'Draft');
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
      setCounselorPhoto('');
      setCounselorTitle('');
      setCounselorBio('');
      setGallery('');
      setDescription('');
      setObjectives('');
      setWhatYouWillLearn('');
      setWhoShouldAttend('');
      setSchedule('');
      setBookingNotice('');
      setShowDoctor(true);
      setShowLearnMore(true);
      setShowGallery(true);
      setShowSchedule(true);
      setShowBooking(true);
      setIsBookable(true);
      setStatus('Draft');
    }

    setError('');
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
      counselorPhoto: counselorPhoto.trim() || undefined,
      counselorTitle: counselorTitle.trim() || undefined,
      counselorBio: counselorBio.trim() || undefined,
      gallery: galleryValue,
      description: description.trim() || undefined,
      objectives: splitLines(objectives),
      whatYouWillLearn: splitLines(whatYouWillLearn),
      whoShouldAttend: splitLines(whoShouldAttend),
      bookingNotice: bookingNotice.trim() || undefined,
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
    <Modal isOpen={isOpen} onClose={onClose} title={consultation ? 'Edit Consultation Session' : 'Add Consultation Session'} footer={footer}>
      <div className="flex flex-col gap-8">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Session Title" required placeholder="Session title (English)" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Session Title (Arabic)" placeholder="عنوان الجلسة" value={sessionTitleAr} onChange={(e) => setSessionTitleAr(e.target.value)} />
          </div>
        </div>

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
            <Input label="Published Date" type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} />
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

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Max Participants" type="number" placeholder="e.g. 20" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Booking Notice" placeholder="Optional notice shown at booking" value={bookingNotice} onChange={(e) => setBookingNotice(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <FileUpload value={coverImage} label="Upload Session Image" isUploading={upload.isPending} onUpload={handleCoverFile} />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <Input label="Counselor Name" placeholder="Enter counselor name" value={counselor} onChange={(e) => setCounselor(e.target.value)} />
            </div>
            <div>
              <Input label="Counselor Title" placeholder="e.g. Family Counselor" value={counselorTitle} onChange={(e) => setCounselorTitle(e.target.value)} />
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
          <Textarea label="Description" placeholder="Enter session description" rows={5} className="h-[149px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <Textarea label="Objectives" placeholder="One objective per line" rows={4} value={objectives} onChange={(e) => setObjectives(e.target.value)} />
        </div>

        <div>
          <Textarea label="What You Will Learn" placeholder="One item per line" rows={4} value={whatYouWillLearn} onChange={(e) => setWhatYouWillLearn(e.target.value)} />
        </div>

        <div>
          <Textarea label="Who Should Attend" placeholder="One item per line" rows={4} value={whoShouldAttend} onChange={(e) => setWhoShouldAttend(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {toggleRow(showDoctor, setShowDoctor, 'Show Doctor')}
          {toggleRow(showLearnMore, setShowLearnMore, 'Show Learn More')}
          {toggleRow(showGallery, setShowGallery, 'Show Gallery')}
          {toggleRow(showSchedule, setShowSchedule, 'Show Schedule')}
          {toggleRow(showBooking, setShowBooking, 'Show Booking')}
          {toggleRow(isBookable, setIsBookable, 'Bookable')}
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}