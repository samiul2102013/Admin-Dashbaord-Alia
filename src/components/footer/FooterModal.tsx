'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import ArabicField from '@/components/shared/ArabicField';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { getErrorMessage } from '@/lib/api-client';
import { saveFooterContent, getFooterContent, footerKeys } from '@/lib/services/footer';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import type { FooterContent, FooterLink } from '@/types/footer';

interface FooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FooterContent | null;
}

const SECTIONS = [
  'Brand',
  'Quick Links',
  'Resources',
  'Contacts',
  'Bottom Bar',
] as const;

type SectionKey = (typeof SECTIONS)[number];

const FOOTER_VISIBILITY_LABELS = {
  brand: 'Brand Column',
  quickLinks: 'Quick Links Column',
  resources: 'Resources Column',
  contacts: 'Contacts Column',
  bottomBar: 'Bottom Bar',
} as const;

type VisibilityKey = keyof typeof FOOTER_VISIBILITY_LABELS;

const SECTION_VIS_KEY: Record<SectionKey, VisibilityKey> = {
  Brand: 'brand',
  'Quick Links': 'quickLinks',
  Resources: 'resources',
  Contacts: 'contacts',
  'Bottom Bar': 'bottomBar',
};

const SECTION_PREVIEW: Record<SectionKey, string> = {
  Brand: 'the footer brand column (logo, brand text and government label)',
  'Quick Links': 'the Quick Links column and all of its links',
  Resources: 'the Resources column and all of its links',
  Contacts: 'the Contacts column (heading, phone, email and address)',
  'Bottom Bar': 'the footer bottom bar (copyright and built-for text)',
};

const DEFAULT_VISIBILITY: Record<VisibilityKey, boolean> = {
  brand: true,
  quickLinks: true,
  resources: true,
  contacts: true,
  bottomBar: true,
};

/** Every scalar English/Arabic pair wired to the translation toolbar. */
const SCALAR_PAIRS: { ar: keyof FooterContent; en: keyof FooterContent }[] = [
  { ar: 'brandTextAr', en: 'brandText' },
  { ar: 'governmentLabelAr', en: 'governmentLabel' },
  { ar: 'quickLinksHeadingAr', en: 'quickLinksHeading' },
  { ar: 'resourceLinksHeadingAr', en: 'resourceLinksHeading' },
  { ar: 'contactsHeadingAr', en: 'contactsHeading' },
  { ar: 'addressAr', en: 'address' },
  { ar: 'copyrightTextAr', en: 'copyrightText' },
  { ar: 'builtForTextAr', en: 'builtForText' },
];

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readMachineFlags(record: FooterContent | null): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  SCALAR_PAIRS.forEach(({ ar }) => {
    flags[ar] = getIsMachineFlag(record, ar);
  });
  return flags;
}

/** Fields the backend left blank despite an English source — retry candidates. */
function readFailedFields(record: FooterContent | null): Set<string> {
  const failed = new Set<string>();
  if (!record) return failed;
  SCALAR_PAIRS.forEach(({ ar, en }) => {
    if (asString(record[en]).trim() && !asString(record[ar]).trim()) failed.add(ar);
  });
  return failed;
}

function cloneData(d: FooterContent | null): FooterContent {
  return d
    ? JSON.parse(JSON.stringify(d))
    : {
        id: '', logoUrl: '', brandText: '', brandTextAr: '', governmentLabel: '', governmentLabelAr: '',
        quickLinksHeading: '', quickLinksHeadingAr: '',
        resourceLinksHeading: '', resourceLinksHeadingAr: '',
        contactsHeading: '', contactsHeadingAr: '',
        quickLinks: [], resourceLinks: [],
        phone: '', email: '', address: '', addressAr: '',
        copyrightText: '', copyrightTextAr: '', builtForText: '', builtForTextAr: '',
        published: false,
        sectionVisibility: { ...DEFAULT_VISIBILITY },
      };
}

export default function FooterModal({ isOpen, onClose, data }: FooterModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FooterContent>(() => cloneData(data));
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['Brand']));

  useEffect(() => {
    if (isOpen) {
      setFormData(cloneData(data));
      setMachineFlags(readMachineFlags(data));
      setFailedFields(new Set());
      setError('');
      setOpenSections(new Set(['Brand']));
    }
  }, [isOpen, data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<FooterContent>) => saveFooterContent(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(footerKeys.content(), updated);
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const setField = (patch: Partial<FooterContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const setQuickLinks = (links: FooterLink[]) => setField({ quickLinks: links });
  const setResourceLinks = (links: FooterLink[]) => setField({ resourceLinks: links });

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const visibility = (formData.sectionVisibility as Record<string, boolean>) ?? DEFAULT_VISIBILITY;
  const isVisible = (section: SectionKey) => visibility[SECTION_VIS_KEY[section]] ?? true;
  const toggleVisible = (section: SectionKey) =>
    setField({
      sectionVisibility: {
        ...visibility,
        [SECTION_VIS_KEY[section]]: !isVisible(section),
      },
    });

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    const fresh = await getFooterContent();
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
    <TranslationProvider model="footer" id={formData.id || undefined} onTranslated={reloadTranslations}>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Footer Content" footer={footer}>
        <div className="flex flex-col gap-4">
          {error && (
            <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
          )}

          <TranslationToolbar states={translationStates} title={formData.brandText || undefined} />

          <CollapsibleSection
            title="Brand Column"
            hint="Logo, brand text & government label"
            isOpen={openSections.has('Brand')}
            onToggle={() => toggleSection('Brand')}
            visible={isVisible('Brand')}
            onToggleVisible={() => toggleVisible('Brand')}
            sectionName={FOOTER_VISIBILITY_LABELS[SECTION_VIS_KEY.Brand]}
            hidePreview={SECTION_PREVIEW.Brand}
          >
            <Input label="Logo URL" value={formData.logoUrl} onChange={(e) => setField({ logoUrl: e.target.value })} placeholder="Leave empty to use the default logo" />
            <Textarea label="Brand Text (EN)" rows={4} value={formData.brandText} onChange={(e) => setField({ brandText: e.target.value })} />
            <ArabicField
              label="Brand Text (AR)"
              multiline
              rows={4}
              englishValue={formData.brandText}
              value={formData.brandTextAr}
              onChange={(v) => setField({ brandTextAr: v })}
              isMachine={machineFlags.brandTextAr}
              failed={failedFields.has('brandTextAr')}
            />
            <Input label="Government Label (EN)" value={formData.governmentLabel} onChange={(e) => setField({ governmentLabel: e.target.value })} />
            <ArabicField
              label="Government Label (AR)"
              englishValue={formData.governmentLabel}
              value={formData.governmentLabelAr}
              onChange={(v) => setField({ governmentLabelAr: v })}
              isMachine={machineFlags.governmentLabelAr}
              failed={failedFields.has('governmentLabelAr')}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Quick Links"
            hint="Column heading & links"
            isOpen={openSections.has('Quick Links')}
            onToggle={() => toggleSection('Quick Links')}
            visible={isVisible('Quick Links')}
            onToggleVisible={() => toggleVisible('Quick Links')}
            sectionName={FOOTER_VISIBILITY_LABELS[SECTION_VIS_KEY['Quick Links']]}
            hidePreview={SECTION_PREVIEW['Quick Links']}
          >
            <Input label="Column Heading (EN)" value={formData.quickLinksHeading} onChange={(e) => setField({ quickLinksHeading: e.target.value })} />
            <ArabicField
              label="Column Heading (AR)"
              englishValue={formData.quickLinksHeading}
              value={formData.quickLinksHeadingAr}
              onChange={(v) => setField({ quickLinksHeadingAr: v })}
              isMachine={machineFlags.quickLinksHeadingAr}
              failed={failedFields.has('quickLinksHeadingAr')}
            />
            <LinksEditor links={formData.quickLinks || []} onChange={setQuickLinks} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Resource Links"
            hint="Column heading & links"
            isOpen={openSections.has('Resources')}
            onToggle={() => toggleSection('Resources')}
            visible={isVisible('Resources')}
            onToggleVisible={() => toggleVisible('Resources')}
            sectionName={FOOTER_VISIBILITY_LABELS[SECTION_VIS_KEY.Resources]}
            hidePreview={SECTION_PREVIEW.Resources}
          >
            <Input label="Column Heading (EN)" value={formData.resourceLinksHeading} onChange={(e) => setField({ resourceLinksHeading: e.target.value })} />
            <ArabicField
              label="Column Heading (AR)"
              englishValue={formData.resourceLinksHeading}
              value={formData.resourceLinksHeadingAr}
              onChange={(v) => setField({ resourceLinksHeadingAr: v })}
              isMachine={machineFlags.resourceLinksHeadingAr}
              failed={failedFields.has('resourceLinksHeadingAr')}
            />
            <LinksEditor links={formData.resourceLinks || []} onChange={setResourceLinks} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Contacts Column"
            hint="Heading, phone, email & address"
            isOpen={openSections.has('Contacts')}
            onToggle={() => toggleSection('Contacts')}
            visible={isVisible('Contacts')}
            onToggleVisible={() => toggleVisible('Contacts')}
            sectionName={FOOTER_VISIBILITY_LABELS[SECTION_VIS_KEY.Contacts]}
            hidePreview={SECTION_PREVIEW.Contacts}
          >
            <Input label="Column Heading (EN)" value={formData.contactsHeading} onChange={(e) => setField({ contactsHeading: e.target.value })} />
            <ArabicField
              label="Column Heading (AR)"
              englishValue={formData.contactsHeading}
              value={formData.contactsHeadingAr}
              onChange={(v) => setField({ contactsHeadingAr: v })}
              isMachine={machineFlags.contactsHeadingAr}
              failed={failedFields.has('contactsHeadingAr')}
            />
            <Input label="Phone" value={formData.phone} onChange={(e) => setField({ phone: e.target.value })} />
            <Input label="Email" value={formData.email} onChange={(e) => setField({ email: e.target.value })} />
            <Input label="Address (EN)" value={formData.address} onChange={(e) => setField({ address: e.target.value })} />
            <ArabicField
              label="Address (AR)"
              englishValue={formData.address}
              value={formData.addressAr}
              onChange={(v) => setField({ addressAr: v })}
              isMachine={machineFlags.addressAr}
              failed={failedFields.has('addressAr')}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Bottom Bar"
            hint="Copyright & built-for text"
            isOpen={openSections.has('Bottom Bar')}
            onToggle={() => toggleSection('Bottom Bar')}
            visible={isVisible('Bottom Bar')}
            onToggleVisible={() => toggleVisible('Bottom Bar')}
            sectionName={FOOTER_VISIBILITY_LABELS[SECTION_VIS_KEY['Bottom Bar']]}
            hidePreview={SECTION_PREVIEW['Bottom Bar']}
          >
            <Input label="Copyright Text (EN)" value={formData.copyrightText} onChange={(e) => setField({ copyrightText: e.target.value })} />
            <ArabicField
              label="Copyright Text (AR)"
              englishValue={formData.copyrightText}
              value={formData.copyrightTextAr}
              onChange={(v) => setField({ copyrightTextAr: v })}
              isMachine={machineFlags.copyrightTextAr}
              failed={failedFields.has('copyrightTextAr')}
            />
            <Input label="Built For Text (EN)" value={formData.builtForText} onChange={(e) => setField({ builtForText: e.target.value })} />
            <ArabicField
              label="Built For Text (AR)"
              englishValue={formData.builtForText}
              value={formData.builtForTextAr}
              onChange={(v) => setField({ builtForTextAr: v })}
              isMachine={machineFlags.builtForTextAr}
              failed={failedFields.has('builtForTextAr')}
            />
          </CollapsibleSection>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-secondary/30 bg-surface/50">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setField({ published: e.target.checked })}
              className="w-5 h-5 accent-primary mt-0.5"
            />
            <span className="text-sm font-semibold font-[family-name:var(--font-poppins)]">
              Published — shows the complete public Footer and all of its content. Turning this off
              hides the whole footer, not only the navigation link.
            </span>
          </div>
        </div>
      </Modal>
    </TranslationProvider>
  );
}

interface LinksEditorProps {
  links: FooterLink[];
  onChange: (links: FooterLink[]) => void;
}

function LinksEditor({ links, onChange }: LinksEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      {links.map((link, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-start">
          <Input
            label="Label (EN)"
            value={link.label}
            onChange={(e) => {
              const next = [...links];
              next[i] = { ...link, label: e.target.value };
              onChange(next);
            }}
          />
          <ArabicField
            label="Label (AR)"
            statusOnly
            englishValue={link.label}
            value={link.labelAr ?? ''}
            onChange={(v) => {
              const next = [...links];
              next[i] = { ...link, labelAr: v };
              onChange(next);
            }}
          />
          <Input
            label="Link (href)"
            value={link.href}
            onChange={(e) => {
              const next = [...links];
              next[i] = { ...link, href: e.target.value };
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(links.filter((_, idx) => idx !== i))}
            className="mt-[26px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
            aria-label="Remove link"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      ))}
      <div>
        <Button variant="ghost" size="sm" onClick={() => onChange([...links, { label: '', labelAr: '', href: '' }])}>
          <Plus size={16} />
          Add link
        </Button>
      </div>
    </div>
  );
}
