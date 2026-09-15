'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Save, Loader2, CheckCircle2, Plus, Trash2,
  Eye, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { getErrorMessage } from '@/lib/api-client';
import { getContactContent, saveContactContent } from '@/lib/services/contact';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
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

/* ── Translation field map ─────────────────────────────────────────────── */

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
  visible?: boolean;
  onToggleVisible?: () => void;
  /** Real name of the public section this visibility toggle controls. */
  sectionName?: string;
  /** Concrete preview of what disappears, e.g. "the entire Form Labels section". */
  hidePreview?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  children: React.ReactNode;
  hint?: string;
}

function CollapsibleSection({
  id, title, visible = true, onToggleVisible, sectionName, hidePreview,
  collapsed, onToggleCollapsed, children, hint,
}: CollapsibleSectionProps) {
  const publicName = sectionName ?? title;

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

        {onToggleVisible && (
          <button
            type="button"
            onClick={onToggleVisible}
            title={
              visible
                ? `Hide the "${publicName}" section from the public site`
                : `Show the "${publicName}" section on the public site`
            }
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer font-[family-name:var(--font-poppins)] shrink-0 ${
              visible
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-secondary/20 text-text-secondary hover:bg-secondary/30'
            }`}
          >
            {visible ? <Eye size={13} /> : <EyeOff size={13} />}
            {visible ? 'Visible publicly' : 'Hidden publicly'}
          </button>
        )}
      </div>

      {onToggleVisible && !visible && (
        <div className="border-t border-secondary/20 bg-warning/5 px-4 py-2 text-xs text-warning font-[family-name:var(--font-poppins)]">
          Hidden from the public site: {hidePreview ?? `the entire "${publicName}" section`}.
        </div>
      )}

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
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());

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
        setMachineFlags(readMachineFlags(result));
        setFailedFields(new Set());
        if (result?.sectionVisibility) {
          setSectionVisibility((prev) => ({ ...prev, ...result.sectionVisibility }));
        }
      })
      .catch((e) => { if (mounted) setError(getErrorMessage(e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const setField = (patch: Partial<ContactContent>) =>
    setData((prev) => prev ? { ...prev, ...patch } : prev);

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    const updated = await getContactContent();
    if (!updated) return;
    setData(cloneData(updated));
    setMachineFlags(readMachineFlags(updated));
    setFailedFields(readFailedFields(updated));
  }, []);

  const translationStates: TranslationState[] = SCALAR_PAIRS.map(({ ar, en }) =>
    getTranslationState(
      asString(data?.[en]),
      asString(data?.[ar]),
      machineFlags[ar],
      failedFields.has(ar),
    ),
  );

  const handleSave = async () => {
    if (!data) return;
    setSaving(true); setSaved(false); setError('');
    try {
      const updated = await saveContactContent({ ...data, sectionVisibility: { ...sectionVisibility, hero: true } });
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
    <TranslationProvider model="contact" id={data.id} onTranslated={reloadTranslations}>
    <div className="flex flex-col gap-5 flex-1 min-h-0 overflow-y-auto pb-8">
      {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

      {/* ── Global toggle ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 p-4 rounded-[12px] border border-secondary/30 bg-surface">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-black font-[family-name:var(--font-poppins)]">
            Page visibility
          </span>
          <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
            Published — shows the complete public Contact page and all of its content. Turning this
            off hides the whole page, not only the navigation link.
          </span>
          <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
            {data.published
              ? 'Currently published: the complete Contact page is live to the public.'
              : 'Currently unpublished: the entire Contact page is hidden from the public.'}
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

      <TranslationToolbar states={translationStates} title={data.title || undefined} />

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <CollapsibleSection
        id="hero"
        title={SECTION_META.hero.title}
        hint={SECTION_META.hero.hint}
        collapsed={!!collapsed['hero']}
        onToggleCollapsed={() => toggleCollapse('hero')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Title (English)" value={data.title} onChange={(e) => setField({ title: e.target.value })} />
          <ArabicField
            label="Title (Arabic)"
            englishValue={data.title}
            value={data.titleAr}
            onChange={(v) => setField({ titleAr: v })}
            isMachine={machineFlags.titleAr}
            failed={failedFields.has('titleAr')}
          />
        </div>
        <Textarea label="Description (English)" rows={3} value={data.description} onChange={(e) => setField({ description: e.target.value })} />
        <ArabicField
          label="Description (Arabic)"
          multiline
          rows={3}
          englishValue={data.description}
          value={data.descriptionAr}
          onChange={(v) => setField({ descriptionAr: v })}
          isMachine={machineFlags.descriptionAr}
          failed={failedFields.has('descriptionAr')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Browse Session (English)" value={data.browseSession} onChange={(e) => setField({ browseSession: e.target.value })} />
          <ArabicField
            label="Browse Session (Arabic)"
            englishValue={data.browseSession}
            value={data.browseSessionAr}
            onChange={(v) => setField({ browseSessionAr: v })}
            isMachine={machineFlags.browseSessionAr}
            failed={failedFields.has('browseSessionAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Contact Support (English)" value={data.contactSupport} onChange={(e) => setField({ contactSupport: e.target.value })} />
          <ArabicField
            label="Contact Support (Arabic)"
            englishValue={data.contactSupport}
            value={data.contactSupportAr}
            onChange={(v) => setField({ contactSupportAr: v })}
            isMachine={machineFlags.contactSupportAr}
            failed={failedFields.has('contactSupportAr')}
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
        sectionName="Form Labels"
        hidePreview="the entire Form Labels section (all contact-form headings, labels and placeholders)"
        collapsed={!!collapsed['formLabels']}
        onToggleCollapsed={() => toggleCollapse('formLabels')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Send Message Heading (EN)" value={data.sendMessage} onChange={(e) => setField({ sendMessage: e.target.value })} />
          <ArabicField
            label="Send Message Heading (AR)"
            englishValue={data.sendMessage}
            value={data.sendMessageAr}
            onChange={(v) => setField({ sendMessageAr: v })}
            isMachine={machineFlags.sendMessageAr}
            failed={failedFields.has('sendMessageAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Send Message Sub (EN)" value={data.sendMessageSub} onChange={(e) => setField({ sendMessageSub: e.target.value })} />
          <ArabicField
            label="Send Message Sub (AR)"
            englishValue={data.sendMessageSub}
            value={data.sendMessageSubAr}
            onChange={(v) => setField({ sendMessageSubAr: v })}
            isMachine={machineFlags.sendMessageSubAr}
            failed={failedFields.has('sendMessageSubAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Full Name Label (EN)" value={data.fullName} onChange={(e) => setField({ fullName: e.target.value })} />
          <ArabicField
            label="Full Name Label (AR)"
            englishValue={data.fullName}
            value={data.fullNameAr}
            onChange={(v) => setField({ fullNameAr: v })}
            isMachine={machineFlags.fullNameAr}
            failed={failedFields.has('fullNameAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Full Name Placeholder (EN)" value={data.fullNamePlaceholder} onChange={(e) => setField({ fullNamePlaceholder: e.target.value })} />
          <ArabicField
            label="Full Name Placeholder (AR)"
            englishValue={data.fullNamePlaceholder}
            value={data.fullNamePlaceholderAr}
            onChange={(v) => setField({ fullNamePlaceholderAr: v })}
            isMachine={machineFlags.fullNamePlaceholderAr}
            failed={failedFields.has('fullNamePlaceholderAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Email Label (EN)" value={data.emailLabel} onChange={(e) => setField({ emailLabel: e.target.value })} />
          <ArabicField
            label="Email Label (AR)"
            englishValue={data.emailLabel}
            value={data.emailLabelAr}
            onChange={(v) => setField({ emailLabelAr: v })}
            isMachine={machineFlags.emailLabelAr}
            failed={failedFields.has('emailLabelAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Email Placeholder (EN)" value={data.emailPlaceholder} onChange={(e) => setField({ emailPlaceholder: e.target.value })} />
          <ArabicField
            label="Email Placeholder (AR)"
            englishValue={data.emailPlaceholder}
            value={data.emailPlaceholderAr}
            onChange={(v) => setField({ emailPlaceholderAr: v })}
            isMachine={machineFlags.emailPlaceholderAr}
            failed={failedFields.has('emailPlaceholderAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="User Type Label (EN)" value={data.userType} onChange={(e) => setField({ userType: e.target.value })} />
          <ArabicField
            label="User Type Label (AR)"
            englishValue={data.userType}
            value={data.userTypeAr}
            onChange={(v) => setField({ userTypeAr: v })}
            isMachine={machineFlags.userTypeAr}
            failed={failedFields.has('userTypeAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Select User Type (EN)" value={data.selectUserType} onChange={(e) => setField({ selectUserType: e.target.value })} />
          <ArabicField
            label="Select User Type (AR)"
            englishValue={data.selectUserType}
            value={data.selectUserTypeAr}
            onChange={(v) => setField({ selectUserTypeAr: v })}
            isMachine={machineFlags.selectUserTypeAr}
            failed={failedFields.has('selectUserTypeAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Individual (EN)" value={data.individual} onChange={(e) => setField({ individual: e.target.value })} />
          <ArabicField
            label="Individual (AR)"
            englishValue={data.individual}
            value={data.individualAr}
            onChange={(v) => setField({ individualAr: v })}
            isMachine={machineFlags.individualAr}
            failed={failedFields.has('individualAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Couple (EN)" value={data.couple} onChange={(e) => setField({ couple: e.target.value })} />
          <ArabicField
            label="Couple (AR)"
            englishValue={data.couple}
            value={data.coupleAr}
            onChange={(v) => setField({ coupleAr: v })}
            isMachine={machineFlags.coupleAr}
            failed={failedFields.has('coupleAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Organization (EN)" value={data.organization} onChange={(e) => setField({ organization: e.target.value })} />
          <ArabicField
            label="Organization (AR)"
            englishValue={data.organization}
            value={data.organizationAr}
            onChange={(v) => setField({ organizationAr: v })}
            isMachine={machineFlags.organizationAr}
            failed={failedFields.has('organizationAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Subject Label (EN)" value={data.subjectLabel} onChange={(e) => setField({ subjectLabel: e.target.value })} />
          <ArabicField
            label="Subject Label (AR)"
            englishValue={data.subjectLabel}
            value={data.subjectLabelAr}
            onChange={(v) => setField({ subjectLabelAr: v })}
            isMachine={machineFlags.subjectLabelAr}
            failed={failedFields.has('subjectLabelAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Subject Placeholder (EN)" value={data.subjectPlaceholder} onChange={(e) => setField({ subjectPlaceholder: e.target.value })} />
          <ArabicField
            label="Subject Placeholder (AR)"
            englishValue={data.subjectPlaceholder}
            value={data.subjectPlaceholderAr}
            onChange={(v) => setField({ subjectPlaceholderAr: v })}
            isMachine={machineFlags.subjectPlaceholderAr}
            failed={failedFields.has('subjectPlaceholderAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Phone Label (EN)" value={data.phoneLabel} onChange={(e) => setField({ phoneLabel: e.target.value })} />
          <ArabicField
            label="Phone Label (AR)"
            englishValue={data.phoneLabel}
            value={data.phoneLabelAr}
            onChange={(v) => setField({ phoneLabelAr: v })}
            isMachine={machineFlags.phoneLabelAr}
            failed={failedFields.has('phoneLabelAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Phone Placeholder (EN)" value={data.phonePlaceholder} onChange={(e) => setField({ phonePlaceholder: e.target.value })} />
          <ArabicField
            label="Phone Placeholder (AR)"
            englishValue={data.phonePlaceholder}
            value={data.phonePlaceholderAr}
            onChange={(v) => setField({ phonePlaceholderAr: v })}
            isMachine={machineFlags.phonePlaceholderAr}
            failed={failedFields.has('phonePlaceholderAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Message Label (EN)" value={data.messageLabel} onChange={(e) => setField({ messageLabel: e.target.value })} />
          <ArabicField
            label="Message Label (AR)"
            englishValue={data.messageLabel}
            value={data.messageLabelAr}
            onChange={(v) => setField({ messageLabelAr: v })}
            isMachine={machineFlags.messageLabelAr}
            failed={failedFields.has('messageLabelAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Message Placeholder (EN)" value={data.messagePlaceholder} onChange={(e) => setField({ messagePlaceholder: e.target.value })} />
          <ArabicField
            label="Message Placeholder (AR)"
            englishValue={data.messagePlaceholder}
            value={data.messagePlaceholderAr}
            onChange={(v) => setField({ messagePlaceholderAr: v })}
            isMachine={machineFlags.messagePlaceholderAr}
            failed={failedFields.has('messagePlaceholderAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Send Button (EN)" value={data.sendButton} onChange={(e) => setField({ sendButton: e.target.value })} />
          <ArabicField
            label="Send Button (AR)"
            englishValue={data.sendButton}
            value={data.sendButtonAr}
            onChange={(v) => setField({ sendButtonAr: v })}
            isMachine={machineFlags.sendButtonAr}
            failed={failedFields.has('sendButtonAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Success Message (EN)" value={data.successMessage} onChange={(e) => setField({ successMessage: e.target.value })} />
          <ArabicField
            label="Success Message (AR)"
            englishValue={data.successMessage}
            value={data.successMessageAr}
            onChange={(v) => setField({ successMessageAr: v })}
            isMachine={machineFlags.successMessageAr}
            failed={failedFields.has('successMessageAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Sending Label (EN)" value={data.sending} onChange={(e) => setField({ sending: e.target.value })} />
          <ArabicField
            label="Sending Label (AR)"
            englishValue={data.sending}
            value={data.sendingAr}
            onChange={(v) => setField({ sendingAr: v })}
            isMachine={machineFlags.sendingAr}
            failed={failedFields.has('sendingAr')}
          />
        </div>
      </CollapsibleSection>

      {/* ── Contact Info ──────────────────────────────────────────────────── */}
      <CollapsibleSection
        id="contactInfo"
        title={SECTION_META.contactInfo.title}
        hint={SECTION_META.contactInfo.hint}
        visible={sectionVisibility.contactInfo}
        onToggleVisible={() => toggleVisibility('contactInfo')}
        sectionName="Contact Info"
        hidePreview="the entire Contact Info section (office address, working hours and support details)"
        collapsed={!!collapsed['contactInfo']}
        onToggleCollapsed={() => toggleCollapse('contactInfo')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Contact Info Heading (EN)" value={data.contactInfo} onChange={(e) => setField({ contactInfo: e.target.value })} />
          <ArabicField
            label="Contact Info Heading (AR)"
            englishValue={data.contactInfo}
            value={data.contactInfoAr}
            onChange={(v) => setField({ contactInfoAr: v })}
            isMachine={machineFlags.contactInfoAr}
            failed={failedFields.has('contactInfoAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Office Address Heading (EN)" value={data.officeAddress} onChange={(e) => setField({ officeAddress: e.target.value })} />
          <ArabicField
            label="Office Address Heading (AR)"
            englishValue={data.officeAddress}
            value={data.officeAddressAr}
            onChange={(v) => setField({ officeAddressAr: v })}
            isMachine={machineFlags.officeAddressAr}
            failed={failedFields.has('officeAddressAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Working Hours Heading (EN)" value={data.workingHours} onChange={(e) => setField({ workingHours: e.target.value })} />
          <ArabicField
            label="Working Hours Heading (AR)"
            englishValue={data.workingHours}
            value={data.workingHoursAr}
            onChange={(v) => setField({ workingHoursAr: v })}
            isMachine={machineFlags.workingHoursAr}
            failed={failedFields.has('workingHoursAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="General Inquiries Heading (EN)" value={data.generalInquiries} onChange={(e) => setField({ generalInquiries: e.target.value })} />
          <ArabicField
            label="General Inquiries Heading (AR)"
            englishValue={data.generalInquiries}
            value={data.generalInquiriesAr}
            onChange={(v) => setField({ generalInquiriesAr: v })}
            isMachine={machineFlags.generalInquiriesAr}
            failed={failedFields.has('generalInquiriesAr')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Support Heading (EN)" value={data.supportHeading} onChange={(e) => setField({ supportHeading: e.target.value })} />
          <ArabicField
            label="Support Heading (AR)"
            englishValue={data.supportHeading}
            value={data.supportHeadingAr}
            onChange={(v) => setField({ supportHeadingAr: v })}
            isMachine={machineFlags.supportHeadingAr}
            failed={failedFields.has('supportHeadingAr')}
          />
        </div>

        <p className="text-[11px] text-text-secondary font-[family-name:var(--font-poppins)] -mt-2">
          List items (address, hours, inquiries and support lines) are translated by the machine
          engine at read time; their Arabic lists are not stored, so no per-item status is shown.
        </p>

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
        sectionName="Location & Map"
        hidePreview="the entire Location & Map section (location heading, text and embedded map)"
        collapsed={!!collapsed['locationMap']}
        onToggleCollapsed={() => toggleCollapse('locationMap')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Our Location Heading (EN)" value={data.ourLocation} onChange={(e) => setField({ ourLocation: e.target.value })} />
          <ArabicField
            label="Our Location Heading (AR)"
            englishValue={data.ourLocation}
            value={data.ourLocationAr}
            onChange={(v) => setField({ ourLocationAr: v })}
            isMachine={machineFlags.ourLocationAr}
            failed={failedFields.has('ourLocationAr')}
          />
        </div>
        <Textarea label="Our Location Text (English)" rows={2} value={data.ourLocationText} onChange={(e) => setField({ ourLocationText: e.target.value })} />
        <ArabicField
          label="Our Location Text (Arabic)"
          multiline
          rows={2}
          englishValue={data.ourLocationText}
          value={data.ourLocationTextAr}
          onChange={(v) => setField({ ourLocationTextAr: v })}
          isMachine={machineFlags.ourLocationTextAr}
          failed={failedFields.has('ourLocationTextAr')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Map Title (EN)" value={data.mapTitle} onChange={(e) => setField({ mapTitle: e.target.value })} />
          <ArabicField
            label="Map Title (AR)"
            englishValue={data.mapTitle}
            value={data.mapTitleAr}
            onChange={(v) => setField({ mapTitleAr: v })}
            isMachine={machineFlags.mapTitleAr}
            failed={failedFields.has('mapTitleAr')}
          />
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
    </TranslationProvider>
  );
}
