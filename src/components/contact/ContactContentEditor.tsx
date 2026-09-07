'use client';

import { useEffect, useState } from 'react';
import {
  Save, Loader2, CheckCircle2, Plus, Trash2,
  Eye, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { getContactContent, saveContactContent } from '@/lib/services/contact';
import { useUpload } from '@/hooks/useMeta';
import type { ContactContent } from '@/types/contact';

/* ── Default data (mirrors i18n fallbacks) ──────────────────────────────── */

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

/* ── Section IDs ────────────────────────────────────────────────────────── */

const SECTION_IDS = ['hero', 'formLabels', 'contactInfo', 'locationMap'] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SECTION_META: Record<SectionId, { title: string; hint: string }> = {
  hero:        { title: 'Hero Section',       hint: 'Title, description & hero image' },
  formLabels:  { title: 'Form Labels',        hint: 'Contact form text & placeholders' },
  contactInfo: { title: 'Contact Info',       hint: 'Office address, hours & support' },
  locationMap: { title: 'Location & Map',     hint: 'Map embed, coordinates' },
};

/* ── Collapsible section wrapper ──────────────────────────────────────────── */

interface CollapsibleSectionProps {
  id: string;
  title: string;
  visible: boolean;
  onToggleVisible: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  children: React.ReactNode;
  hint?: string;
}

function CollapsibleSection({
  id, title, visible, onToggleVisible,
  collapsed, onToggleCollapsed, children, hint,
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-[12px] border border-secondary/30 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex items-center gap-2 text-left min-w-0 cursor-pointer"
            aria-expanded={!collapsed}
            aria-controls={`section-${id}`}
          >
            {collapsed
              ? <ChevronDown size={16} className="shrink-0 text-text-secondary" />
              : <ChevronUp   size={16} className="shrink-0 text-text-secondary" />}
            <span className="text-sm font-bold text-black font-[family-name:var(--font-poppins)] truncate">
              {title}
            </span>
          </button>
          {hint && (
            <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)] hidden sm:inline">
              — {hint}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleVisible}
          title={visible ? 'Hide this section on the user panel' : 'Show this section on the user panel'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer font-[family-name:var(--font-poppins)] shrink-0 ${
            visible
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-secondary/20 text-text-secondary hover:bg-secondary/30'
          }`}
        >
          {visible ? <Eye size={13} /> : <EyeOff size={13} />}
          {visible ? 'Visible' : 'Hidden'}
        </button>
      </div>

      {!collapsed && (
        <div
          id={`section-${id}`}
          className={`flex flex-col gap-5 px-4 pb-5 pt-4 transition-opacity ${
            visible ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ── File upload component ───────────────────────────────────────────────── */

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
        <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
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

/* ── Repeatable string list ─────────────────────────────────────────────── */

interface StringListProps {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
}

function StringList({ label, values, onChange }: StringListProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
        {label}
      </label>
      {values.map((val, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label=""
              value={val}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
            aria-label={`Remove ${label} item`}
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange([...values, ''])}>
        <Plus size={16} /> Add item
      </Button>
    </div>
  );
}

/* ── Main editor ──────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'admin_editor_collapsed_contact';

export default function ContactContentEditor() {
  const [data, setData] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const upload = useUpload();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const [sectionVisibility, setSectionVisibility] = useState<Record<SectionId, boolean>>({
    hero: true, formLabels: true, contactInfo: true, locationMap: true,
  });

  const persistCollapse = (next: Record<string, boolean>) => {
    setCollapsed(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const toggleCollapse = (id: string) => {
    persistCollapse({ ...collapsed, [id]: !collapsed[id] });
  };

  const toggleVisibility = (id: SectionId) => {
    setSectionVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    setSaved(false);
    getContactContent()
      .then((result) => {
        if (!mounted) return;
        setData(result ? cloneData(result) : cloneData(null));
      })
      .catch((e) => { if (mounted) setError(getErrorMessage(e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const setField = (patch: Partial<ContactContent>) =>
    setData((prev) => prev ? { ...prev, ...patch } : prev);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true); setSaved(false); setError('');
    try {
      const updated = await saveContactContent(data);
      setData(cloneData(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3 py-10">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}
        <p className="text-text-secondary text-sm font-[family-name:var(--font-poppins)]">
          No contact content found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0 overflow-y-auto pb-8">
      {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

      {/* ── Global toggle ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-[12px] border border-secondary/30 bg-surface">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-black font-[family-name:var(--font-poppins)]">
            Page visibility
          </span>
          <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
            {data.published
              ? 'This content is visible on the website.'
              : 'This content is hidden from the website.'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setField({ published: !data.published })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
            data.published ? 'bg-primary' : 'bg-secondary/40'
          }`}
          role="switch"
          aria-checked={data.published}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              data.published ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <CollapsibleSection
        id="hero"
        title={SECTION_META.hero.title}
        hint={SECTION_META.hero.hint}
        visible={sectionVisibility.hero}
        onToggleVisible={() => toggleVisibility('hero')}
        collapsed={!!collapsed['hero']}
        onToggleCollapsed={() => toggleCollapse('hero')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Title (English)" value={data.title} onChange={(e) => setField({ title: e.target.value })} />
          <Input label="Title (Arabic)" value={data.titleAr} onChange={(e) => setField({ titleAr: e.target.value })} />
        </div>
        <Textarea label="Description (English)" rows={3} value={data.description} onChange={(e) => setField({ description: e.target.value })} />
        <Textarea label="Description (Arabic)" rows={3} value={data.descriptionAr} onChange={(e) => setField({ descriptionAr: e.target.value })} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Browse Session (English)" value={data.browseSession} onChange={(e) => setField({ browseSession: e.target.value })} />
          <Input label="Browse Session (Arabic)" value={data.browseSessionAr} onChange={(e) => setField({ browseSessionAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Contact Support (English)" value={data.contactSupport} onChange={(e) => setField({ contactSupport: e.target.value })} />
          <Input label="Contact Support (Arabic)" value={data.contactSupportAr} onChange={(e) => setField({ contactSupportAr: e.target.value })} />
        </div>
        <div className="col-span-full">
          <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)] mb-2 block">
            Hero Image
          </label>
          <p className="text-[11px] text-text-secondary mb-2 font-[family-name:var(--font-poppins)]">
            Recommended size: 1280 × 800 px. JPG / PNG / WebP, max 5 GB.
          </p>
          <FileUpload
            value={''}
            label="Upload Hero Image"
            isUploading={upload.isPending}
            onUpload={async (file) => {
              try {
                const res = await upload.mutateAsync(file);
                void res;
              } catch (uploadError) {
                setError(`Image upload failed: ${getErrorMessage(uploadError)}`);
              }
            }}
          />
        </div>
      </CollapsibleSection>

      {/* ── Form Labels ───────────────────────────────────────────────────── */}
      <CollapsibleSection
        id="formLabels"
        title={SECTION_META.formLabels.title}
        hint={SECTION_META.formLabels.hint}
        visible={sectionVisibility.formLabels}
        onToggleVisible={() => toggleVisibility('formLabels')}
        collapsed={!!collapsed['formLabels']}
        onToggleCollapsed={() => toggleCollapse('formLabels')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Send Message Heading (EN)" value={data.sendMessage} onChange={(e) => setField({ sendMessage: e.target.value })} />
          <Input label="Send Message Heading (AR)" value={data.sendMessageAr} onChange={(e) => setField({ sendMessageAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Send Message Sub (EN)" value={data.sendMessageSub} onChange={(e) => setField({ sendMessageSub: e.target.value })} />
          <Input label="Send Message Sub (AR)" value={data.sendMessageSubAr} onChange={(e) => setField({ sendMessageSubAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Full Name Label (EN)" value={data.fullName} onChange={(e) => setField({ fullName: e.target.value })} />
          <Input label="Full Name Label (AR)" value={data.fullNameAr} onChange={(e) => setField({ fullNameAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Full Name Placeholder (EN)" value={data.fullNamePlaceholder} onChange={(e) => setField({ fullNamePlaceholder: e.target.value })} />
          <Input label="Full Name Placeholder (AR)" value={data.fullNamePlaceholderAr} onChange={(e) => setField({ fullNamePlaceholderAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Email Label (EN)" value={data.emailLabel} onChange={(e) => setField({ emailLabel: e.target.value })} />
          <Input label="Email Label (AR)" value={data.emailLabelAr} onChange={(e) => setField({ emailLabelAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Email Placeholder (EN)" value={data.emailPlaceholder} onChange={(e) => setField({ emailPlaceholder: e.target.value })} />
          <Input label="Email Placeholder (AR)" value={data.emailPlaceholderAr} onChange={(e) => setField({ emailPlaceholderAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="User Type Label (EN)" value={data.userType} onChange={(e) => setField({ userType: e.target.value })} />
          <Input label="User Type Label (AR)" value={data.userTypeAr} onChange={(e) => setField({ userTypeAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Select User Type (EN)" value={data.selectUserType} onChange={(e) => setField({ selectUserType: e.target.value })} />
          <Input label="Select User Type (AR)" value={data.selectUserTypeAr} onChange={(e) => setField({ selectUserTypeAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Individual (EN)" value={data.individual} onChange={(e) => setField({ individual: e.target.value })} />
          <Input label="Individual (AR)" value={data.individualAr} onChange={(e) => setField({ individualAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Couple (EN)" value={data.couple} onChange={(e) => setField({ couple: e.target.value })} />
          <Input label="Couple (AR)" value={data.coupleAr} onChange={(e) => setField({ coupleAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Organization (EN)" value={data.organization} onChange={(e) => setField({ organization: e.target.value })} />
          <Input label="Organization (AR)" value={data.organizationAr} onChange={(e) => setField({ organizationAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Subject Label (EN)" value={data.subjectLabel} onChange={(e) => setField({ subjectLabel: e.target.value })} />
          <Input label="Subject Label (AR)" value={data.subjectLabelAr} onChange={(e) => setField({ subjectLabelAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Subject Placeholder (EN)" value={data.subjectPlaceholder} onChange={(e) => setField({ subjectPlaceholder: e.target.value })} />
          <Input label="Subject Placeholder (AR)" value={data.subjectPlaceholderAr} onChange={(e) => setField({ subjectPlaceholderAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Phone Label (EN)" value={data.phoneLabel} onChange={(e) => setField({ phoneLabel: e.target.value })} />
          <Input label="Phone Label (AR)" value={data.phoneLabelAr} onChange={(e) => setField({ phoneLabelAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Phone Placeholder (EN)" value={data.phonePlaceholder} onChange={(e) => setField({ phonePlaceholder: e.target.value })} />
          <Input label="Phone Placeholder (AR)" value={data.phonePlaceholderAr} onChange={(e) => setField({ phonePlaceholderAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Message Label (EN)" value={data.messageLabel} onChange={(e) => setField({ messageLabel: e.target.value })} />
          <Input label="Message Label (AR)" value={data.messageLabelAr} onChange={(e) => setField({ messageLabelAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Message Placeholder (EN)" value={data.messagePlaceholder} onChange={(e) => setField({ messagePlaceholder: e.target.value })} />
          <Input label="Message Placeholder (AR)" value={data.messagePlaceholderAr} onChange={(e) => setField({ messagePlaceholderAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Send Button (EN)" value={data.sendButton} onChange={(e) => setField({ sendButton: e.target.value })} />
          <Input label="Send Button (AR)" value={data.sendButtonAr} onChange={(e) => setField({ sendButtonAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Success Message (EN)" value={data.successMessage} onChange={(e) => setField({ successMessage: e.target.value })} />
          <Input label="Success Message (AR)" value={data.successMessageAr} onChange={(e) => setField({ successMessageAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Sending Label (EN)" value={data.sending} onChange={(e) => setField({ sending: e.target.value })} />
          <Input label="Sending Label (AR)" value={data.sendingAr} onChange={(e) => setField({ sendingAr: e.target.value })} />
        </div>
      </CollapsibleSection>

      {/* ── Contact Info ──────────────────────────────────────────────────── */}
      <CollapsibleSection
        id="contactInfo"
        title={SECTION_META.contactInfo.title}
        hint={SECTION_META.contactInfo.hint}
        visible={sectionVisibility.contactInfo}
        onToggleVisible={() => toggleVisibility('contactInfo')}
        collapsed={!!collapsed['contactInfo']}
        onToggleCollapsed={() => toggleCollapse('contactInfo')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Contact Info Heading (EN)" value={data.contactInfo} onChange={(e) => setField({ contactInfo: e.target.value })} />
          <Input label="Contact Info Heading (AR)" value={data.contactInfoAr} onChange={(e) => setField({ contactInfoAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Office Address Heading (EN)" value={data.officeAddress} onChange={(e) => setField({ officeAddress: e.target.value })} />
          <Input label="Office Address Heading (AR)" value={data.officeAddressAr} onChange={(e) => setField({ officeAddressAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Working Hours Heading (EN)" value={data.workingHours} onChange={(e) => setField({ workingHours: e.target.value })} />
          <Input label="Working Hours Heading (AR)" value={data.workingHoursAr} onChange={(e) => setField({ workingHoursAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="General Inquiries Heading (EN)" value={data.generalInquiries} onChange={(e) => setField({ generalInquiries: e.target.value })} />
          <Input label="General Inquiries Heading (AR)" value={data.generalInquiriesAr} onChange={(e) => setField({ generalInquiriesAr: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Support Heading (EN)" value={data.supportHeading} onChange={(e) => setField({ supportHeading: e.target.value })} />
          <Input label="Support Heading (AR)" value={data.supportHeadingAr} onChange={(e) => setField({ supportHeadingAr: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StringList
            label="Address Lines (EN)"
            values={data.addressLines || []}
            onChange={(addressLines) => setField({ addressLines })}
          />
          <StringList
            label="Address Lines (AR)"
            values={data.addressLinesAr || []}
            onChange={(addressLinesAr) => setField({ addressLinesAr })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StringList
            label="Hours Lines (EN)"
            values={data.hoursLines || []}
            onChange={(hoursLines) => setField({ hoursLines })}
          />
          <StringList
            label="Hours Lines (AR)"
            values={data.hoursLinesAr || []}
            onChange={(hoursLinesAr) => setField({ hoursLinesAr })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StringList
            label="Inquiries Lines (EN)"
            values={data.inquiriesLines || []}
            onChange={(inquiriesLines) => setField({ inquiriesLines })}
          />
          <StringList
            label="Inquiries Lines (AR)"
            values={data.inquiriesLinesAr || []}
            onChange={(inquiriesLinesAr) => setField({ inquiriesLinesAr })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StringList
            label="Support Lines (EN)"
            values={data.supportLines || []}
            onChange={(supportLines) => setField({ supportLines })}
          />
          <StringList
            label="Support Lines (AR)"
            values={data.supportLinesAr || []}
            onChange={(supportLinesAr) => setField({ supportLinesAr })}
          />
        </div>
      </CollapsibleSection>

      {/* ── Location & Map ────────────────────────────────────────────────── */}
      <CollapsibleSection
        id="locationMap"
        title={SECTION_META.locationMap.title}
        hint={SECTION_META.locationMap.hint}
        visible={sectionVisibility.locationMap}
        onToggleVisible={() => toggleVisibility('locationMap')}
        collapsed={!!collapsed['locationMap']}
        onToggleCollapsed={() => toggleCollapse('locationMap')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Our Location Heading (EN)" value={data.ourLocation} onChange={(e) => setField({ ourLocation: e.target.value })} />
          <Input label="Our Location Heading (AR)" value={data.ourLocationAr} onChange={(e) => setField({ ourLocationAr: e.target.value })} />
        </div>
        <Textarea label="Our Location Text (English)" rows={2} value={data.ourLocationText} onChange={(e) => setField({ ourLocationText: e.target.value })} />
        <Textarea label="Our Location Text (Arabic)" rows={2} value={data.ourLocationTextAr} onChange={(e) => setField({ ourLocationTextAr: e.target.value })} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Map Title (EN)" value={data.mapTitle} onChange={(e) => setField({ mapTitle: e.target.value })} />
          <Input label="Map Title (AR)" value={data.mapTitleAr} onChange={(e) => setField({ mapTitleAr: e.target.value })} />
        </div>
        <Input label="Map Embed URL" value={data.mapEmbedUrl} onChange={(e) => setField({ mapEmbedUrl: e.target.value })} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Latitude" value={data.latitude} onChange={(e) => setField({ latitude: e.target.value })} />
          <Input label="Longitude" value={data.longitude} onChange={(e) => setField({ longitude: e.target.value })} />
        </div>
      </CollapsibleSection>

      {/* ── Save bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-secondary/30 sticky bottom-0 bg-white pb-1">
        {saved && (
          <span className="flex items-center gap-1 text-sm font-semibold text-success font-[family-name:var(--font-poppins)]">
            <CheckCircle2 size={16} /> Saved
          </span>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving\u2026' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
