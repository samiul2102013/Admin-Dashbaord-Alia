'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { saveContactContent, contactKeys } from '@/lib/services/contact';
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
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['Hero']));

  useEffect(() => {
    if (isOpen) {
      setFormData(cloneData(data));
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Contact Content" footer={footer}>
      <div className="flex flex-col gap-4">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        <SectionBlock title="Hero Section" isOpen={openSections.has('Hero')} onToggle={() => toggleSection('Hero')}>
          <Input label="Title (EN)" value={formData.title} onChange={(e) => setField({ title: e.target.value })} />
          <Input label="Title (AR)" value={formData.titleAr} onChange={(e) => setField({ titleAr: e.target.value })} />
          <Textarea label="Description (EN)" rows={3} value={formData.description} onChange={(e) => setField({ description: e.target.value })} />
          <Textarea label="Description (AR)" rows={3} value={formData.descriptionAr} onChange={(e) => setField({ descriptionAr: e.target.value })} />
          <Input label="Browse Session (EN)" value={formData.browseSession} onChange={(e) => setField({ browseSession: e.target.value })} />
          <Input label="Browse Session (AR)" value={formData.browseSessionAr} onChange={(e) => setField({ browseSessionAr: e.target.value })} />
          <Input label="Contact Support (EN)" value={formData.contactSupport} onChange={(e) => setField({ contactSupport: e.target.value })} />
          <Input label="Contact Support (AR)" value={formData.contactSupportAr} onChange={(e) => setField({ contactSupportAr: e.target.value })} />
        </SectionBlock>

        <SectionBlock title="Form Labels" isOpen={openSections.has('Form Labels')} onToggle={() => toggleSection('Form Labels')}>
          <Input label="Send Message Heading (EN)" value={formData.sendMessage} onChange={(e) => setField({ sendMessage: e.target.value })} />
          <Input label="Send Message Heading (AR)" value={formData.sendMessageAr} onChange={(e) => setField({ sendMessageAr: e.target.value })} />
          <Input label="Send Message Sub (EN)" value={formData.sendMessageSub} onChange={(e) => setField({ sendMessageSub: e.target.value })} />
          <Input label="Send Message Sub (AR)" value={formData.sendMessageSubAr} onChange={(e) => setField({ sendMessageSubAr: e.target.value })} />
          <Input label="Full Name Label (EN)" value={formData.fullName} onChange={(e) => setField({ fullName: e.target.value })} />
          <Input label="Full Name Label (AR)" value={formData.fullNameAr} onChange={(e) => setField({ fullNameAr: e.target.value })} />
          <Input label="Full Name Placeholder (EN)" value={formData.fullNamePlaceholder} onChange={(e) => setField({ fullNamePlaceholder: e.target.value })} />
          <Input label="Full Name Placeholder (AR)" value={formData.fullNamePlaceholderAr} onChange={(e) => setField({ fullNamePlaceholderAr: e.target.value })} />
          <Input label="Email Label (EN)" value={formData.emailLabel} onChange={(e) => setField({ emailLabel: e.target.value })} />
          <Input label="Email Label (AR)" value={formData.emailLabelAr} onChange={(e) => setField({ emailLabelAr: e.target.value })} />
          <Input label="Email Placeholder (EN)" value={formData.emailPlaceholder} onChange={(e) => setField({ emailPlaceholder: e.target.value })} />
          <Input label="Email Placeholder (AR)" value={formData.emailPlaceholderAr} onChange={(e) => setField({ emailPlaceholderAr: e.target.value })} />
          <Input label="Subject Label (EN)" value={formData.subjectLabel} onChange={(e) => setField({ subjectLabel: e.target.value })} />
          <Input label="Subject Label (AR)" value={formData.subjectLabelAr} onChange={(e) => setField({ subjectLabelAr: e.target.value })} />
          <Input label="Subject Placeholder (EN)" value={formData.subjectPlaceholder} onChange={(e) => setField({ subjectPlaceholder: e.target.value })} />
          <Input label="Subject Placeholder (AR)" value={formData.subjectPlaceholderAr} onChange={(e) => setField({ subjectPlaceholderAr: e.target.value })} />
          <Input label="Phone Label (EN)" value={formData.phoneLabel} onChange={(e) => setField({ phoneLabel: e.target.value })} />
          <Input label="Phone Label (AR)" value={formData.phoneLabelAr} onChange={(e) => setField({ phoneLabelAr: e.target.value })} />
          <Input label="Phone Placeholder (EN)" value={formData.phonePlaceholder} onChange={(e) => setField({ phonePlaceholder: e.target.value })} />
          <Input label="Phone Placeholder (AR)" value={formData.phonePlaceholderAr} onChange={(e) => setField({ phonePlaceholderAr: e.target.value })} />
          <Input label="Message Label (EN)" value={formData.messageLabel} onChange={(e) => setField({ messageLabel: e.target.value })} />
          <Input label="Message Label (AR)" value={formData.messageLabelAr} onChange={(e) => setField({ messageLabelAr: e.target.value })} />
          <Input label="Message Placeholder (EN)" value={formData.messagePlaceholder} onChange={(e) => setField({ messagePlaceholder: e.target.value })} />
          <Input label="Message Placeholder (AR)" value={formData.messagePlaceholderAr} onChange={(e) => setField({ messagePlaceholderAr: e.target.value })} />
          <Input label="Send Button (EN)" value={formData.sendButton} onChange={(e) => setField({ sendButton: e.target.value })} />
          <Input label="Send Button (AR)" value={formData.sendButtonAr} onChange={(e) => setField({ sendButtonAr: e.target.value })} />
          <Input label="Success Message (EN)" value={formData.successMessage} onChange={(e) => setField({ successMessage: e.target.value })} />
          <Input label="Success Message (AR)" value={formData.successMessageAr} onChange={(e) => setField({ successMessageAr: e.target.value })} />
        </SectionBlock>

        <SectionBlock title="Contact Info" isOpen={openSections.has('Contact Info')} onToggle={() => toggleSection('Contact Info')}>
          <Input label="Contact Info Heading (EN)" value={formData.contactInfo} onChange={(e) => setField({ contactInfo: e.target.value })} />
          <Input label="Contact Info Heading (AR)" value={formData.contactInfoAr} onChange={(e) => setField({ contactInfoAr: e.target.value })} />
          <Input label="Office Address Heading (EN)" value={formData.officeAddress} onChange={(e) => setField({ officeAddress: e.target.value })} />
          <Input label="Office Address Heading (AR)" value={formData.officeAddressAr} onChange={(e) => setField({ officeAddressAr: e.target.value })} />
          <Input label="Working Hours Heading (EN)" value={formData.workingHours} onChange={(e) => setField({ workingHours: e.target.value })} />
          <Input label="Working Hours Heading (AR)" value={formData.workingHoursAr} onChange={(e) => setField({ workingHoursAr: e.target.value })} />
          <Input label="General Inquiries Heading (EN)" value={formData.generalInquiries} onChange={(e) => setField({ generalInquiries: e.target.value })} />
          <Input label="General Inquiries Heading (AR)" value={formData.generalInquiriesAr} onChange={(e) => setField({ generalInquiriesAr: e.target.value })} />
          <Input label="Support Heading (EN)" value={formData.supportHeading} onChange={(e) => setField({ supportHeading: e.target.value })} />
          <Input label="Support Heading (AR)" value={formData.supportHeadingAr} onChange={(e) => setField({ supportHeadingAr: e.target.value })} />
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Address Lines (comma-separated)</label>
            <Input label="" value={(formData.addressLines || []).join(', ')} onChange={(e) => setField({ addressLines: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Address Lines AR (comma-separated)</label>
            <Input label="" value={(formData.addressLinesAr || []).join(', ')} onChange={(e) => setField({ addressLinesAr: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Hours Lines (comma-separated)</label>
            <Input label="" value={(formData.hoursLines || []).join(', ')} onChange={(e) => setField({ hoursLines: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Hours Lines AR (comma-separated)</label>
            <Input label="" value={(formData.hoursLinesAr || []).join(', ')} onChange={(e) => setField({ hoursLinesAr: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Inquiries Lines (comma-separated)</label>
            <Input label="" value={(formData.inquiriesLines || []).join(', ')} onChange={(e) => setField({ inquiriesLines: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Inquiries Lines AR (comma-separated)</label>
            <Input label="" value={(formData.inquiriesLinesAr || []).join(', ')} onChange={(e) => setField({ inquiriesLinesAr: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Support Lines (comma-separated)</label>
            <Input label="" value={(formData.supportLines || []).join(', ')} onChange={(e) => setField({ supportLines: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
          <div className="col-span-full">
            <label className="text-xs font-bold text-text-secondary uppercase mb-2 block font-[family-name:var(--font-manrope)]">Support Lines AR (comma-separated)</label>
            <Input label="" value={(formData.supportLinesAr || []).join(', ')} onChange={(e) => setField({ supportLinesAr: e.target.value.split(',').map((s: string) => s.trim()) })} />
          </div>
        </SectionBlock>

        <SectionBlock title="Location / Map" isOpen={openSections.has('Location / Map')} onToggle={() => toggleSection('Location / Map')}>
          <Input label="Our Location Heading (EN)" value={formData.ourLocation} onChange={(e) => setField({ ourLocation: e.target.value })} />
          <Input label="Our Location Heading (AR)" value={formData.ourLocationAr} onChange={(e) => setField({ ourLocationAr: e.target.value })} />
          <Textarea label="Our Location Text (EN)" rows={2} value={formData.ourLocationText} onChange={(e) => setField({ ourLocationText: e.target.value })} />
          <Textarea label="Our Location Text (AR)" rows={2} value={formData.ourLocationTextAr} onChange={(e) => setField({ ourLocationTextAr: e.target.value })} />
          <Input label="Map Title (EN)" value={formData.mapTitle} onChange={(e) => setField({ mapTitle: e.target.value })} />
          <Input label="Map Title (AR)" value={formData.mapTitleAr} onChange={(e) => setField({ mapTitleAr: e.target.value })} />
          <Input label="Map Embed URL" value={formData.mapEmbedUrl} onChange={(e) => setField({ mapEmbedUrl: e.target.value })} />
          <Input label="Latitude" value={formData.latitude} onChange={(e) => setField({ latitude: e.target.value })} />
          <Input label="Longitude" value={formData.longitude} onChange={(e) => setField({ longitude: e.target.value })} />
        </SectionBlock>

        <div className="flex items-center gap-3 p-4 rounded-lg border border-secondary/30 bg-surface/50">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setField({ published: e.target.checked })}
            className="w-5 h-5 accent-primary"
          />
          <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">Published (visible on the website)</span>
        </div>
      </div>
    </Modal>
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
