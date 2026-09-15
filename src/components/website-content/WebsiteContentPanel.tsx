'use client';

import { useCallback, useEffect, useState } from 'react';
import { Save, Loader2, Pencil, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { getErrorMessage } from '@/lib/api-client';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import {
  listPresentations,
  updatePresentation,
  SECTION_LABELS,
} from '@/lib/services/presentations';
import type { Presentation, PresentationFaq, PresentationTopic } from '@/types/presentations';

// The public site only renders shorts/news/consultation/initiatives/emirates.
// The 'home' presentation has no public consumer, so it is intentionally excluded
// here — admins must not be able to edit a screen that does nothing.
const EDITABLE_KEYS = ['news', 'shorts', 'consultation', 'initiatives', 'emirates'];
const EXCLUDED_KEYS = ['home'];

export default function WebsiteContentPanel() {
  const [items, setItems] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Presentation | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    listPresentations()
      .then((list) => {
        if (!mounted) return;
        const eligible = list.filter((p) => !EXCLUDED_KEYS.includes(p.key));
        const ordered = EDITABLE_KEYS
          .map((key) => eligible.find((p) => p.key === key))
          .filter(Boolean) as Presentation[];
        setItems(eligible.length === ordered.length ? ordered : eligible);
      })
      .catch((e) => {
        if (mounted) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const startEdit = (item: Presentation) => {
    setEditing(item);
    setError('');
    setSaved(false);
    setMachineFlags({
      titleAr: getIsMachineFlag(item, 'titleAr'),
      descriptionAr: getIsMachineFlag(item, 'descriptionAr'),
    });
    const failed = new Set<string>();
    if ((item.title || '').trim() && !(item.titleAr || '').trim()) failed.add('titleAr');
    if ((item.description || '').trim() && !(item.descriptionAr || '').trim()) failed.add('descriptionAr');
    setFailedFields(failed);
  };

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    if (!editing) return;
    const list = await listPresentations();
    const fresh = list.find((p) => p.id === editing.id) ?? list.find((p) => p.key === editing.key);
    if (!fresh) return;
    setEditing(fresh);
    setMachineFlags({
      titleAr: getIsMachineFlag(fresh, 'titleAr'),
      descriptionAr: getIsMachineFlag(fresh, 'descriptionAr'),
    });
    const failed = new Set<string>();
    if ((fresh.title || '').trim() && !(fresh.titleAr || '').trim()) failed.add('titleAr');
    if ((fresh.description || '').trim() && !(fresh.descriptionAr || '').trim()) failed.add('descriptionAr');
    setFailedFields(failed);
  }, [editing]);

  const translationStates: TranslationState[] = editing
    ? [
        getTranslationState(editing.title, editing.titleAr, machineFlags.titleAr, failedFields.has('titleAr')),
        getTranslationState(editing.description, editing.descriptionAr, machineFlags.descriptionAr, failedFields.has('descriptionAr')),
      ]
    : [];

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updatePresentation(editing.id, {
        title: editing.title,
        titleAr: editing.titleAr,
        description: editing.description,
        descriptionAr: editing.descriptionAr,
        badge: editing.badge,
        heroImage: editing.heroImage,
        published: editing.published,
        topics: editing.topics,
        contributors: editing.contributors,
        faqs: editing.faqs,
      });
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSaved(true);
      setTimeout(() => setEditing(null), 700);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const setField = (patch: Partial<Presentation>) => {
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const setTopics = (topics: PresentationTopic[]) => setField({ topics });
  const setContributors = (contributors: string[]) => setField({ contributors });
  const setFaqs = (faqs: PresentationFaq[]) => setField({ faqs });

  return (
    <TranslationProvider model="presentation" id={editing?.id} onTranslated={reloadTranslations}>
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      {error && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-text-secondary text-sm font-[family-name:var(--font-poppins)]">
          No presentations found. Run the backend seed command to create the default pages.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-6 p-5 rounded-[12px] border border-secondary/40 bg-surface"
            >
              <div className="flex items-center gap-4 min-w-0">
                {item.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.heroImage}
                    alt={item.title}
                    className="h-[64px] w-[96px] rounded-md object-cover bg-secondary/20 shrink-0"
                  />
                ) : (
                  <div className="flex h-[64px] w-[96px] items-center justify-center rounded-md bg-secondary/20 shrink-0">
                    <span className="text-[10px] text-text-secondary font-[family-name:var(--font-poppins)]">
                      No image
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary uppercase font-[family-name:var(--font-manrope)]">
                      {SECTION_LABELS[item.key] ?? item.key}
                    </span>
                    {!item.published && (
                      <span className="rounded-full bg-danger/10 px-3 py-0.5 text-xs font-bold text-danger uppercase">
                        Unpublished
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-black leading-snug truncate font-[family-name:var(--font-poppins)]">
                    {item.title || 'No title set'}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 truncate font-[family-name:var(--font-poppins)]">
                    {item.description || 'No description set'}
                  </p>
                </div>
              </div>

              <Button variant="secondary" onClick={() => startEdit(item)}>
                <Pencil size={16} />
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit page presentation" size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-sm font-semibold text-success font-[family-name:var(--font-poppins)]">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !editing}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        {editing && (
          <div className="flex flex-col gap-5">
            <Input label="Section" value={SECTION_LABELS[editing.key] ?? editing.key} disabled />

            <TranslationToolbar states={translationStates} title={editing.title || undefined} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Title (English)" value={editing.title} onChange={(e) => setField({ title: e.target.value })} />
              <ArabicField
                label="Title (Arabic)"
                englishValue={editing.title}
                value={editing.titleAr}
                onChange={(v) => setField({ titleAr: v })}
                isMachine={machineFlags.titleAr}
                failed={failedFields.has('titleAr')}
              />
            </div>
            <Textarea label="Description (English)" rows={3} value={editing.description} onChange={(e) => setField({ description: e.target.value })} />
            <ArabicField
              label="Description (Arabic)"
              multiline
              rows={3}
              englishValue={editing.description}
              value={editing.descriptionAr}
              onChange={(v) => setField({ descriptionAr: v })}
              isMachine={machineFlags.descriptionAr}
              failed={failedFields.has('descriptionAr')}
            />
            <Input label="Badge" value={editing.badge} onChange={(e) => setField({ badge: e.target.value })} />
            <Input label="Hero Image URL" value={editing.heroImage} onChange={(e) => setField({ heroImage: e.target.value })} />

            {editing.key === 'shorts' && (
              <ShortsExtrasEditor
                topics={editing.topics ?? []}
                contributors={editing.contributors ?? []}
                faqs={editing.faqs ?? []}
                onChangeTopics={setTopics}
                onChangeContributors={setContributors}
                onChangeFaqs={setFaqs}
              />
            )}

            <label className="flex items-start gap-3 cursor-pointer font-[family-name:var(--font-poppins)]">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setField({ published: e.target.checked })}
                className="w-5 h-5 accent-primary mt-0.5"
              />
              <span className="text-sm font-semibold">
                Published — shows the complete public page and all of its content. Turning this off
                hides the whole page, not only the navigation link.
              </span>
            </label>
          </div>
        )}
      </Modal>
    </div>
    </TranslationProvider>
  );
}

interface ShortsExtrasEditorProps {
  topics: PresentationTopic[];
  contributors: string[];
  faqs: PresentationFaq[];
  onChangeTopics: (topics: PresentationTopic[]) => void;
  onChangeContributors: (contributors: string[]) => void;
  onChangeFaqs: (faqs: PresentationFaq[]) => void;
}

function ShortsExtrasEditor({
  topics,
  contributors,
  faqs,
  onChangeTopics,
  onChangeContributors,
  onChangeFaqs,
}: ShortsExtrasEditorProps) {
  return (
    <div className="flex flex-col gap-6 border-t border-secondary/30 pt-5">
      <SectionLabel title="Explore Topics" hint="Shown as cards on the Shorts page." />

      {topics.map((topic, i) => (
        <div key={i} className="flex flex-col md:flex-row items-start gap-2">
          <div className="flex-1">
            <Input
              label="Topic Title"
              value={topic.title}
              onChange={(e) => {
                const next = [...topics];
                next[i] = { ...topic, title: e.target.value };
                onChangeTopics(next);
              }}
            />
          </div>
          <div className="flex-1">
            <ArabicField
              label="Topic Title (Arabic)"
              statusOnly
              englishValue={topic.title}
              value={topic.titleAr ?? ''}
              onChange={(v) => {
                const next = [...topics];
                next[i] = { ...topic, titleAr: v };
                onChangeTopics(next);
              }}
            />
          </div>
          <div className="w-full md:w-[160px]">
            <Input
              label="Videos Count"
              value={topic.videos ?? ''}
              onChange={(e) => {
                const next = [...topics];
                next[i] = { ...topic, videos: e.target.value };
                onChangeTopics(next);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChangeTopics(topics.filter((_, idx) => idx !== i))}
            className="mt-[26px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
            aria-label="Remove topic"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChangeTopics([...topics, { title: '', videos: '' }])}>
        <Plus size={16} />
        Add topic
      </Button>

      <SectionLabel title="Contributors" hint="Names displayed on the Shorts page." />
      <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)] -mt-3">
        Contributor names are machine-translated to Arabic on the public site, so there is no stored
        Arabic field to edit here.
      </p>
      {contributors.map((name, i) => (
        <div key={i} className="flex items-start gap-2 col-span-full">
          <div className="flex-1">
            <Input
              label=""
              value={name}
              onChange={(e) => {
                const next = [...contributors];
                next[i] = e.target.value;
                onChangeContributors(next);
              }}
              placeholder="Contributor name"
            />
          </div>
          <button
            type="button"
            onClick={() => onChangeContributors(contributors.filter((_, idx) => idx !== i))}
            className="mt-[28px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
            aria-label="Remove contributor"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChangeContributors([...contributors, ''])}>
        <Plus size={16} />
        Add contributor
      </Button>

      <SectionLabel title="FAQs" hint="Accordion questions on the Shorts page." />
      {faqs.map((faq, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-secondary/30 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              label="Question (EN)"
              value={faq.question}
              onChange={(e) => {
                const next = [...faqs];
                next[i] = { ...faq, question: e.target.value };
                onChangeFaqs(next);
              }}
            />
            <ArabicField
              label="Question (AR)"
              statusOnly
              englishValue={faq.question}
              value={faq.questionAr ?? ''}
              onChange={(v) => {
                const next = [...faqs];
                next[i] = { ...faq, questionAr: v };
                onChangeFaqs(next);
              }}
            />
            <Input
              label="Answer (EN)"
              value={faq.answer}
              onChange={(e) => {
                const next = [...faqs];
                next[i] = { ...faq, answer: e.target.value };
                onChangeFaqs(next);
              }}
            />
            <ArabicField
              label="Answer (AR)"
              statusOnly
              multiline
              rows={3}
              englishValue={faq.answer}
              value={faq.answerAr ?? ''}
              onChange={(v) => {
                const next = [...faqs];
                next[i] = { ...faq, answerAr: v };
                onChangeFaqs(next);
              }}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onChangeFaqs(faqs.filter((_, idx) => idx !== i))}
              className="w-10 h-10 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
              aria-label="Remove FAQ"
            >
              <Trash2 size={16} className="text-danger" />
            </button>
          </div>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChangeFaqs([...faqs, { question: '', questionAr: '', answer: '', answerAr: '' }])}
      >
        <Plus size={16} />
        Add FAQ
      </Button>
    </div>
  );
}

function SectionLabel({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-bold text-black font-[family-name:var(--font-poppins)]">{title}</span>
      <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">{hint}</span>
    </div>
  );
}
