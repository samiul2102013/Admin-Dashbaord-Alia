'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { getErrorMessage } from '@/lib/api-client';
import { saveContactContent, getContactContent, contactKeys } from '@/lib/services/contact';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import type { ContactContent } from '@/types/contact';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ContactContent | null;
}

const SECTIONS = [
  'Hero',
  'Form Labels',
  'Contact Info',
  'Location / Map',
] as const;

type SectionKey = (typeof SECTIONS)[number];

/** Every scalar English/Arabic pair wired to the translation toolbar. */
const SCALAR_PAIRS: { ar: keyof ContactContent; en: keyof ContactContent }[] = [
  { ar: 'titleAr', en: 'title' },
  { ar: 'descriptionAr', en: 'description' },
  { ar: 'browseSessionAr', en: 'browseSession' },
  { ar: 'contactSupportAr', en: 'contactSupport' },
  { ar: 'sendMessageAr', en: 'sendMessage' },
  { ar: 'sendMessageSubAr', en: 'sendMessageSub' },
  { ar: 'fullNameAr', en: 'fullName' },
  { ar: 'fullNamePlaceholderAr', en: 'fullNamePlaceholder' },
  { ar: 'emailLabelAr', en: 'emailLabel' },
  { ar: 'emailPlaceholderAr', en: 'emailPlaceholder' },
  { ar: 'userTypeAr', en: 'userType' },
  { ar: 'selectUserTypeAr', en: 'selectUserType' },
  { ar: 'individualAr', en: 'individual' },
  { ar: 'coupleAr', en: 'couple' },
  { ar: 'organizationAr', en: 'organization' },
  { ar: 'subjectLabelAr', en: 'subjectLabel' },
  { ar: 'subjectPlaceholderAr', en: 'subjectPlaceholder' },
  { ar: 'phoneLabelAr', en: 'phoneLabel' },
  { ar: 'phonePlaceholderAr', en: 'phonePlaceholder' },
  { ar: 'messageLabelAr', en: 'messageLabel' },
  { ar: 'messagePlaceholderAr', en: 'messagePlaceholder' },
  { ar: 'sendButtonAr', en: 'sendButton' },
  { ar: 'successMessageAr', en: 'successMessage' },
  { ar: 'sendingAr', en: 'sending' },
  { ar: 'contactInfoAr', en: 'contactInfo' },
  { ar: 'officeAddressAr', en: 'officeAddress' },
  { ar: 'workingHoursAr', en: 'workingHours' },
  { ar: 'generalInquiriesAr', en: 'generalInquiries' },
  { ar: 'supportHeadingAr', en: 'supportHeading' },
  { ar: 'ourLocationAr', en: 'ourLocation' },
  { ar: 'ourLocationTextAr', en: 'ourLocationText' },
  { ar: 'mapTitleAr', en: 'mapTitle' },
];

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readMachineFlags(record: ContactContent | null): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  SCALAR_PAIRS.forEach(({ ar }) => {
    flags[ar] = getIsMachineFlag(record, ar);
  });
  return flags;
}

/** Fields the backend left blank despite an English source — retry candidates. */
function readFailedFields(record: ContactContent | null): Set<string> {
  const failed = new Set<string>();
  if (!record) return failed;
  SCALAR_PAIRS.forEach(({ ar, en }) => {
    if (asString(record[en]).trim() && !asString(record[ar]).trim()) failed.add(ar);
  });
  return failed;
}

function cloneData(d: ContactContent | null): ContactContent {
  return d
    ? JSON.parse(JSON.stringify(d))
    : {
        id: '', title: '', titleAr: '', description: '', descriptionAr: '',
        browseSession: '', browseSessionAr: '', contactSupport: '', contactSupportAr: '',
        sendMessage: '', sendMessageAr: '', sendMessageSub: '', sendMessageSubAr: '',
        fullName: '', fullNameAr: '', fullNamePlaceholder: '', fullNamePlaceholderAr: '',
        emailLabel: '', emailLabelAr: '', emailPlaceholder: '', emailPlaceholderAr: '',
        userType: '', userTypeAr: '', selectUserType: '', selectUserTypeAr: '',
        individual: '', individualAr: '', couple: '', coupleAr: '',
        organization: '', organizationAr: '',
        subjectLabel: '', subjectLabelAr: '', subjectPlaceholder: '', subjectPlaceholderAr: '',
        phoneLabel: '', phoneLabelAr: '', phonePlaceholder: '', phonePlaceholderAr: '',
        messageLabel: '', messageLabelAr: '', messagePlaceholder: '', messagePlaceholderAr: '',
        sendButton: '', sendButtonAr: '', successMessage: '', successMessageAr: '',
        sending: '', sendingAr: '',
        contactInfo: '', contactInfoAr: '', officeAddress: '', officeAddressAr: '',
        workingHours: '', workingHoursAr: '', generalInquiries: '', generalInquiriesAr: '',
        supportHeading: '', supportHeadingAr: '',
        addressLines: [], addressLinesAr: [],
        hoursLines: [], hoursLinesAr: [],
        inquiriesLines: [], inquiriesLinesAr: [],
        supportLines: [], supportLinesAr: [],
        ourLocation: '', ourLocationAr: '', ourLocationText: '', ourLocationTextAr: '',
        mapTitle: '', mapTitleAr: '', mapEmbedUrl: '', latitude: '', longitude: '',
        published: false,
      };
}

export default function ContactModal({ isOpen, onClose, data }: ContactModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ContactContent>(() => cloneData(data));
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['Hero']));

  useEffect(() => {
    if (isOpen) {
      setFormData(cloneData(data));
      setMachineFlags(readMachineFlags(data));
      setFailedFields(new Set());
      setError('');
      setOpenSections(new Set(['Hero']));
    }
  }, [isOpen, data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<ContactContent>) => saveContactContent(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(contactKeys.content(), updated);
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const setField = (patch: Partial<ContactContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    const fresh = await getContactContent();
    if (!fresh) return;
    setFormData(cloneData(fresh));
    setMachineFlags(readMachineFlags(fresh));
    setFailedFields(readFailedFields(fresh));
  }, []);

  const translationStates: TranslationState[] = SCALAR_PAIRS.map(({ ar, en }) =>
    getTranslationState(
      asString(formData[en]),
      asString(formData[ar]),
      machineFlags[ar],
      failedFields.has(ar),
    ),
  );

  const handleSubmit = () => {
    setError('');
    saveMutation.mutate(formData);
  };

  const isPending = saveMutation.isPending;

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={isPending}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
        Save All Changes
      </Button>
    </div>
  );

  return (
    <TranslationProvider model="contact" id={formData.id || undefined} onTranslated={reloadTranslations}>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Contact Content" footer={footer}>
        <div className="flex flex-col gap-4">
          {error && (
            <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
          )}

          <TranslationToolbar states={translationStates} title={formData.title || undefined} />

          <SectionBlock title="Hero Section" isOpen={openSections.has('Hero')} onToggle={() => toggleSection('Hero')}>
            <Input label="Title (EN)" value={formData.title} onChange={(e) => setField({ title: e.target.value })} />
            <ArabicField
              label="Title (AR)"
              englishValue={formData.title}
              value={formData.titleAr}
              onChange={(v) => setField({ titleAr: v })}
              isMachine={machineFlags.titleAr}
              failed={failedFields.has('titleAr')}
            />
            <Textarea label="Description (EN)" rows={3} value={formData.description} onChange={(e) => setField({ description: e.target.value })} />
            <ArabicField
              label="Description (AR)"
              multiline
              rows={3}
              englishValue={formData.description}
              value={formData.descriptionAr}
              onChange={(v) => setField({ descriptionAr: v })}
              isMachine={machineFlags.descriptionAr}
              failed={failedFields.has('descriptionAr')}
            />
            <Input label="Browse Session (EN)" value={formData.browseSession} onChange={(e) => setField({ browseSession: e.target.value })} />
            <ArabicField
              label="Browse Session (AR)"
              englishValue={formData.browseSession}
              value={formData.browseSessionAr}
              onChange={(v) => setField({ browseSessionAr: v })}
              isMachine={machineFlags.browseSessionAr}
              failed={failedFields.has('browseSessionAr')}
            />
            <Input label="Contact Support (EN)" value={formData.contactSupport} onChange={(e) => setField({ contactSupport: e.target.value })} />
            <ArabicField
              label="Contact Support (AR)"
              englishValue={formData.contactSupport}
              value={formData.contactSupportAr}
              onChange={(v) => setField({ contactSupportAr: v })}
              isMachine={machineFlags.contactSupportAr}
              failed={failedFields.has('contactSupportAr')}
            />
          </SectionBlock>

          <SectionBlock title="Form Labels" isOpen={openSections.has('Form Labels')} onToggle={() => toggleSection('Form Labels')}>
            <Input label="Send Message Heading (EN)" value={formData.sendMessage} onChange={(e) => setField({ sendMessage: e.target.value })} />
            <ArabicField
              label="Send Message Heading (AR)"
              englishValue={formData.sendMessage}
              value={formData.sendMessageAr}
              onChange={(v) => setField({ sendMessageAr: v })}
              isMachine={machineFlags.sendMessageAr}
              failed={failedFields.has('sendMessageAr')}
            />
            <Input label="Send Message Sub (EN)" value={formData.sendMessageSub} onChange={(e) => setField({ sendMessageSub: e.target.value })} />
            <ArabicField
              label="Send Message Sub (AR)"
              englishValue={formData.sendMessageSub}
              value={formData.sendMessageSubAr}
              onChange={(v) => setField({ sendMessageSubAr: v })}
              isMachine={machineFlags.sendMessageSubAr}
              failed={failedFields.has('sendMessageSubAr')}
            />
            <Input label="Full Name Label (EN)" value={formData.fullName} onChange={(e) => setField({ fullName: e.target.value })} />
            <ArabicField
              label="Full Name Label (AR)"
              englishValue={formData.fullName}
              value={formData.fullNameAr}
              onChange={(v) => setField({ fullNameAr: v })}
              isMachine={machineFlags.fullNameAr}
              failed={failedFields.has('fullNameAr')}
            />
            <Input label="Full Name Placeholder (EN)" value={formData.fullNamePlaceholder} onChange={(e) => setField({ fullNamePlaceholder: e.target.value })} />
            <ArabicField
              label="Full Name Placeholder (AR)"
              englishValue={formData.fullNamePlaceholder}
              value={formData.fullNamePlaceholderAr}
              onChange={(v) => setField({ fullNamePlaceholderAr: v })}
              isMachine={machineFlags.fullNamePlaceholderAr}
              failed={failedFields.has('fullNamePlaceholderAr')}
            />
            <Input label="Email Label (EN)" value={formData.emailLabel} onChange={(e) => setField({ emailLabel: e.target.value })} />
            <ArabicField
              label="Email Label (AR)"
              englishValue={formData.emailLabel}
              value={formData.emailLabelAr}
              onChange={(v) => setField({ emailLabelAr: v })}
              isMachine={machineFlags.emailLabelAr}
              failed={failedFields.has('emailLabelAr')}
            />
            <Input label="Email Placeholder (EN)" value={formData.emailPlaceholder} onChange={(e) => setField({ emailPlaceholder: e.target.value })} />
            <ArabicField
              label="Email Placeholder (AR)"
              englishValue={formData.emailPlaceholder}
              value={formData.emailPlaceholderAr}
              onChange={(v) => setField({ emailPlaceholderAr: v })}
              isMachine={machineFlags.emailPlaceholderAr}
              failed={failedFields.has('emailPlaceholderAr')}
            />
            <Input label="User Type Label (EN)" value={formData.userType} onChange={(e) => setField({ userType: e.target.value })} />
            <ArabicField
              label="User Type Label (AR)"
              englishValue={formData.userType}
              value={formData.userTypeAr}
              onChange={(v) => setField({ userTypeAr: v })}
              isMachine={machineFlags.userTypeAr}
              failed={failedFields.has('userTypeAr')}
            />
            <Input label="Select User Type (EN)" value={formData.selectUserType} onChange={(e) => setField({ selectUserType: e.target.value })} />
            <ArabicField
              label="Select User Type (AR)"
              englishValue={formData.selectUserType}
              value={formData.selectUserTypeAr}
              onChange={(v) => setField({ selectUserTypeAr: v })}
              isMachine={machineFlags.selectUserTypeAr}
              failed={failedFields.has('selectUserTypeAr')}
            />
            <Input label="Individual (EN)" value={formData.individual} onChange={(e) => setField({ individual: e.target.value })} />
            <ArabicField
              label="Individual (AR)"
              englishValue={formData.individual}
              value={formData.individualAr}
              onChange={(v) => setField({ individualAr: v })}
              isMachine={machineFlags.individualAr}
              failed={failedFields.has('individualAr')}
            />
            <Input label="Couple (EN)" value={formData.couple} onChange={(e) => setField({ couple: e.target.value })} />
            <ArabicField
              label="Couple (AR)"
              englishValue={formData.couple}
              value={formData.coupleAr}
              onChange={(v) => setField({ coupleAr: v })}
              isMachine={machineFlags.coupleAr}
              failed={failedFields.has('coupleAr')}
            />
            <Input label="Organization (EN)" value={formData.organization} onChange={(e) => setField({ organization: e.target.value })} />
            <ArabicField
              label="Organization (AR)"
              englishValue={formData.organization}
              value={formData.organizationAr}
              onChange={(v) => setField({ organizationAr: v })}
              isMachine={machineFlags.organizationAr}
              failed={failedFields.has('organizationAr')}
            />
            <Input label="Subject Label (EN)" value={formData.subjectLabel} onChange={(e) => setField({ subjectLabel: e.target.value })} />
            <ArabicField
              label="Subject Label (AR)"
              englishValue={formData.subjectLabel}
              value={formData.subjectLabelAr}
              onChange={(v) => setField({ subjectLabelAr: v })}
              isMachine={machineFlags.subjectLabelAr}
              failed={failedFields.has('subjectLabelAr')}
            />
            <Input label="Subject Placeholder (EN)" value={formData.subjectPlaceholder} onChange={(e) => setField({ subjectPlaceholder: e.target.value })} />
            <ArabicField
              label="Subject Placeholder (AR)"
              englishValue={formData.subjectPlaceholder}
              value={formData.subjectPlaceholderAr}
              onChange={(v) => setField({ subjectPlaceholderAr: v })}
              isMachine={machineFlags.subjectPlaceholderAr}
              failed={failedFields.has('subjectPlaceholderAr')}
            />
            <Input label="Phone Label (EN)" value={formData.phoneLabel} onChange={(e) => setField({ phoneLabel: e.target.value })} />
            <ArabicField
              label="Phone Label (AR)"
              englishValue={formData.phoneLabel}
              value={formData.phoneLabelAr}
              onChange={(v) => setField({ phoneLabelAr: v })}
              isMachine={machineFlags.phoneLabelAr}
              failed={failedFields.has('phoneLabelAr')}
            />
            <Input label="Phone Placeholder (EN)" value={formData.phonePlaceholder} onChange={(e) => setField({ phonePlaceholder: e.target.value })} />
            <ArabicField
              label="Phone Placeholder (AR)"
              englishValue={formData.phonePlaceholder}
              value={formData.phonePlaceholderAr}
              onChange={(v) => setField({ phonePlaceholderAr: v })}
              isMachine={machineFlags.phonePlaceholderAr}
              failed={failedFields.has('phonePlaceholderAr')}
            />
            <Input label="Message Label (EN)" value={formData.messageLabel} onChange={(e) => setField({ messageLabel: e.target.value })} />
            <ArabicField
              label="Message Label (AR)"
              englishValue={formData.messageLabel}
              value={formData.messageLabelAr}
              onChange={(v) => setField({ messageLabelAr: v })}
              isMachine={machineFlags.messageLabelAr}
              failed={failedFields.has('messageLabelAr')}
            />
            <Input label="Message Placeholder (EN)" value={formData.messagePlaceholder} onChange={(e) => setField({ messagePlaceholder: e.target.value })} />
            <ArabicField
              label="Message Placeholder (AR)"
              englishValue={formData.messagePlaceholder}
              value={formData.messagePlaceholderAr}
              onChange={(v) => setField({ messagePlaceholderAr: v })}
              isMachine={machineFlags.messagePlaceholderAr}
              failed={failedFields.has('messagePlaceholderAr')}
            />
            <Input label="Send Button (EN)" value={formData.sendButton} onChange={(e) => setField({ sendButton: e.target.value })} />
            <ArabicField
              label="Send Button (AR)"
              englishValue={formData.sendButton}
              value={formData.sendButtonAr}
              onChange={(v) => setField({ sendButtonAr: v })}
              isMachine={machineFlags.sendButtonAr}
              failed={failedFields.has('sendButtonAr')}
            />
            <Input label="Success Message (EN)" value={formData.successMessage} onChange={(e) => setField({ successMessage: e.target.value })} />
            <ArabicField
              label="Success Message (AR)"
              englishValue={formData.successMessage}
              value={formData.successMessageAr}
              onChange={(v) => setField({ successMessageAr: v })}
              isMachine={machineFlags.successMessageAr}
              failed={failedFields.has('successMessageAr')}
            />
            <Input label="Sending Label (EN)" value={formData.sending} onChange={(e) => setField({ sending: e.target.value })} />
            <ArabicField
              label="Sending Label (AR)"
              englishValue={formData.sending}
              value={formData.sendingAr}
              onChange={(v) => setField({ sendingAr: v })}
              isMachine={machineFlags.sendingAr}
              failed={failedFields.has('sendingAr')}
            />
          </SectionBlock>

          <SectionBlock title="Contact Info" isOpen={openSections.has('Contact Info')} onToggle={() => toggleSection('Contact Info')}>
            <Input label="Contact Info Heading (EN)" value={formData.contactInfo} onChange={(e) => setField({ contactInfo: e.target.value })} />
            <ArabicField
              label="Contact Info Heading (AR)"
              englishValue={formData.contactInfo}
              value={formData.contactInfoAr}
              onChange={(v) => setField({ contactInfoAr: v })}
              isMachine={machineFlags.contactInfoAr}
              failed={failedFields.has('contactInfoAr')}
            />
            <Input label="Office Address Heading (EN)" value={formData.officeAddress} onChange={(e) => setField({ officeAddress: e.target.value })} />
            <ArabicField
              label="Office Address Heading (AR)"
              englishValue={formData.officeAddress}
              value={formData.officeAddressAr}
              onChange={(v) => setField({ officeAddressAr: v })}
              isMachine={machineFlags.officeAddressAr}
              failed={failedFields.has('officeAddressAr')}
            />
            <Input label="Working Hours Heading (EN)" value={formData.workingHours} onChange={(e) => setField({ workingHours: e.target.value })} />
            <ArabicField
              label="Working Hours Heading (AR)"
              englishValue={formData.workingHours}
              value={formData.workingHoursAr}
              onChange={(v) => setField({ workingHoursAr: v })}
              isMachine={machineFlags.workingHoursAr}
              failed={failedFields.has('workingHoursAr')}
            />
            <Input label="General Inquiries Heading (EN)" value={formData.generalInquiries} onChange={(e) => setField({ generalInquiries: e.target.value })} />
            <ArabicField
              label="General Inquiries Heading (AR)"
              englishValue={formData.generalInquiries}
              value={formData.generalInquiriesAr}
              onChange={(v) => setField({ generalInquiriesAr: v })}
              isMachine={machineFlags.generalInquiriesAr}
              failed={failedFields.has('generalInquiriesAr')}
            />
            <Input label="Support Heading (EN)" value={formData.supportHeading} onChange={(e) => setField({ supportHeading: e.target.value })} />
            <ArabicField
              label="Support Heading (AR)"
              englishValue={formData.supportHeading}
              value={formData.supportHeadingAr}
              onChange={(v) => setField({ supportHeadingAr: v })}
              isMachine={machineFlags.supportHeadingAr}
              failed={failedFields.has('supportHeadingAr')}
            />
            <p className="col-span-full text-[11px] text-text-secondary font-[family-name:var(--font-poppins)]">
              List items (address, hours, inquiries and support lines) are translated by the machine
              engine at read time; their Arabic lists are not stored, so no per-item status is shown.
            </p>
            <div className="col-span-full">
              <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Address Lines (comma-separated)</label>
              <Input label="" value={(formData.addressLines || []).join(', ')} onChange={(e) => setField({ addressLines: e.target.value.split(',').map((s: string) => s.trim()) })} />
            </div>
            <div className="col-span-full">
              <ArabicField
                label="Address Lines AR (comma-separated)"
                statusOnly
                englishValue={(formData.addressLines || []).join(', ')}
                value={(formData.addressLinesAr || []).join(', ')}
                onChange={(v) => setField({ addressLinesAr: v.split(',').map((s: string) => s.trim()) })}
              />
            </div>
            <div className="col-span-full">
              <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Hours Lines (comma-separated)</label>
              <Input label="" value={(formData.hoursLines || []).join(', ')} onChange={(e) => setField({ hoursLines: e.target.value.split(',').map((s: string) => s.trim()) })} />
            </div>
            <div className="col-span-full">
              <ArabicField
                label="Hours Lines AR (comma-separated)"
                statusOnly
                englishValue={(formData.hoursLines || []).join(', ')}
                value={(formData.hoursLinesAr || []).join(', ')}
                onChange={(v) => setField({ hoursLinesAr: v.split(',').map((s: string) => s.trim()) })}
              />
            </div>
            <div className="col-span-full">
              <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Inquiries Lines (comma-separated)</label>
              <Input label="" value={(formData.inquiriesLines || []).join(', ')} onChange={(e) => setField({ inquiriesLines: e.target.value.split(',').map((s: string) => s.trim()) })} />
            </div>
            <div className="col-span-full">
              <ArabicField
                label="Inquiries Lines AR (comma-separated)"
                statusOnly
                englishValue={(formData.inquiriesLines || []).join(', ')}
                value={(formData.inquiriesLinesAr || []).join(', ')}
                onChange={(v) => setField({ inquiriesLinesAr: v.split(',').map((s: string) => s.trim()) })}
              />
            </div>
            <div className="col-span-full">
              <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Support Lines (comma-separated)</label>
              <Input label="" value={(formData.supportLines || []).join(', ')} onChange={(e) => setField({ supportLines: e.target.value.split(',').map((s: string) => s.trim()) })} />
            </div>
            <div className="col-span-full">
              <ArabicField
                label="Support Lines AR (comma-separated)"
                statusOnly
                englishValue={(formData.supportLines || []).join(', ')}
                value={(formData.supportLinesAr || []).join(', ')}
                onChange={(v) => setField({ supportLinesAr: v.split(',').map((s: string) => s.trim()) })}
              />
            </div>
          </SectionBlock>

          <SectionBlock title="Location / Map" isOpen={openSections.has('Location / Map')} onToggle={() => toggleSection('Location / Map')}>
            <Input label="Our Location Heading (EN)" value={formData.ourLocation} onChange={(e) => setField({ ourLocation: e.target.value })} />
            <ArabicField
              label="Our Location Heading (AR)"
              englishValue={formData.ourLocation}
              value={formData.ourLocationAr}
              onChange={(v) => setField({ ourLocationAr: v })}
              isMachine={machineFlags.ourLocationAr}
              failed={failedFields.has('ourLocationAr')}
            />
            <Textarea label="Our Location Text (EN)" rows={2} value={formData.ourLocationText} onChange={(e) => setField({ ourLocationText: e.target.value })} />
            <ArabicField
              label="Our Location Text (AR)"
              multiline
              rows={2}
              englishValue={formData.ourLocationText}
              value={formData.ourLocationTextAr}
              onChange={(v) => setField({ ourLocationTextAr: v })}
              isMachine={machineFlags.ourLocationTextAr}
              failed={failedFields.has('ourLocationTextAr')}
            />
            <Input label="Map Title (EN)" value={formData.mapTitle} onChange={(e) => setField({ mapTitle: e.target.value })} />
            <ArabicField
              label="Map Title (AR)"
              englishValue={formData.mapTitle}
              value={formData.mapTitleAr}
              onChange={(v) => setField({ mapTitleAr: v })}
              isMachine={machineFlags.mapTitleAr}
              failed={failedFields.has('mapTitleAr')}
            />
            <Input label="Map Embed URL" value={formData.mapEmbedUrl} onChange={(e) => setField({ mapEmbedUrl: e.target.value })} />
            <Input label="Latitude" value={formData.latitude} onChange={(e) => setField({ latitude: e.target.value })} />
            <Input label="Longitude" value={formData.longitude} onChange={(e) => setField({ longitude: e.target.value })} />
          </SectionBlock>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-secondary/30 bg-surface/50">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setField({ published: e.target.checked })}
              className="w-5 h-5 accent-primary mt-0.5"
            />
            <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">
              Published — shows the complete public Contact page and all of its content. Turning this
              off hides the whole page, not only the navigation link.
            </span>
          </div>
        </div>
      </Modal>
    </TranslationProvider>
  );
}

function SectionBlock({ title, isOpen, onToggle, children }: { title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-secondary/30 bg-surface/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary/10 transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronDown size={16} className="text-text-secondary" /> : <ChevronRight size={16} className="text-text-secondary" />}
        <span className="text-sm font-bold font-[family-name:var(--font-manrope)]">{title}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}
