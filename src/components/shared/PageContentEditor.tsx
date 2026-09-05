    'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import { listPresentations, updatePresentation } from '@/lib/services/presentations';
import type { Presentation, PresentationFaq, PresentationTopic } from '@/types/presentations';

interface PageContentEditorProps {
  /** The presentation key to load and save, e.g. 'shorts', 'news', 'consultation' */
  presentationKey: string;
}

export default function PageContentEditor({ presentationKey }: PageContentEditorProps) {
  const [data, setData] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    setSaved(false);
    listPresentations()
      .then((list) => {
        if (!mounted) return;
        const found = list.find((p) => p.key === presentationKey) ?? null;
        setData(found);
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
  }, [presentationKey]);

  const setField = (patch: Partial<Presentation>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const setTopics = (topics: PresentationTopic[]) => setField({ topics });
  const setContributors = (contributors: string[]) => setField({ contributors });
  const setFaqs = (faqs: PresentationFaq[]) => setField({ faqs });

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const updated = await updatePresentation(data.id, {
        title: data.title,
        titleAr: data.titleAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        badge: data.badge,
        heroImage: data.heroImage,
        published: data.published,
        topics: data.topics,
        contributors: data.contributors,
        faqs: data.faqs,
      });
      setData(updated);
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
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}
        <p className="text-text-secondary text-sm font-[family-name:var(--font-poppins)]">
          No page content found for this section. Run the backend seed command to create the default
          page presentations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto pb-6">
      {error && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
      )}

      {/* Hero fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Title (English)"
          value={data.title}
          onChange={(e) => setField({ title: e.target.value })}
        />
        <Input
          label="Title (Arabic)"
          value={data.titleAr}
          onChange={(e) => setField({ titleAr: e.target.value })}
        />
      </div>

      <Textarea
        label="Description (English)"
        rows={3}
        value={data.description}
        onChange={(e) => setField({ description: e.target.value })}
      />
      <Textarea
        label="Description (Arabic)"
        rows={3}
        value={data.descriptionAr}
        onChange={(e) => setField({ descriptionAr: e.target.value })}
      />

      <Input
        label="Badge"
        value={data.badge}
        onChange={(e) => setField({ badge: e.target.value })}
      />
      <Input
        label="Hero Image URL"
        value={data.heroImage}
        onChange={(e) => setField({ heroImage: e.target.value })}
      />

      {/* Shorts-only extras */}
      {presentationKey === 'shorts' && (
        <ShortsExtrasEditor
          topics={data.topics ?? []}
          contributors={data.contributors ?? []}
          faqs={data.faqs ?? []}
          onChangeTopics={setTopics}
          onChangeContributors={setContributors}
          onChangeFaqs={setFaqs}
        />
      )}

      <label className="flex items-center gap-3 cursor-pointer font-[family-name:var(--font-poppins)]">
        <input
          type="checkbox"
          checked={data.published}
          onChange={(e) => setField({ published: e.target.checked })}
          className="w-5 h-5 accent-primary"
        />
        <span className="text-sm font-semibold">Published (visible on the website)</span>
      </label>

      {/* Save bar */}
      <div className="flex items-center gap-3 pt-2 border-t border-secondary/30">
        {saved && (
          <span className="flex items-center gap-1 text-sm font-semibold text-success font-[family-name:var(--font-poppins)]">
            <CheckCircle2 size={16} /> Saved
          </span>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

/* ── Shorts extras ─────────────────────────────────────────────────────────── */

interface ShortsExtrasEditorProps {
  topics: PresentationTopic[];
  contributors: string[];
  faqs: PresentationFaq[];
  onChangeTopics: (t: PresentationTopic[]) => void;
  onChangeContributors: (c: string[]) => void;
  onChangeFaqs: (f: PresentationFaq[]) => void;
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
      <SectionLabel title="Explore Topics" hint="Topic cards shown on the Shorts page (title + video count)." />
      {topics.map((topic, i) => (
        <div key={i} className="flex flex-col md:flex-row items-start gap-2">
          <Input
            label="Topic Title"
            value={topic.title}
            onChange={(e) => {
              const next = [...topics];
              next[i] = { ...topic, title: e.target.value };
              onChangeTopics(next);
            }}
          />
          <Input
            label="Videos Count"
            value={topic.videos ?? ''}
            onChange={(e) => {
              const next = [...topics];
              next[i] = { ...topic, videos: e.target.value };
              onChangeTopics(next);
            }}
          />
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChangeTopics([...topics, { title: '', videos: '' }])}
      >
        <Plus size={16} />
        Add topic
      </Button>

      <SectionLabel title="Trusted Contributors" hint="Names displayed as cards on the Shorts page." />
      {contributors.map((name, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label={`Contributor ${i + 1}`}
              value={name}
              placeholder="e.g. Government Programs"
              onChange={(e) => {
                const next = [...contributors];
                next[i] = e.target.value;
                onChangeContributors(next);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChangeContributors(contributors.filter((_, idx) => idx !== i))}
            className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
            aria-label="Remove contributor"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChangeContributors([...contributors, ''])}
      >
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
            <Input
              label="Question (AR)"
              value={faq.questionAr ?? ''}
              onChange={(e) => {
                const next = [...faqs];
                next[i] = { ...faq, questionAr: e.target.value };
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
            <Input
              label="Answer (AR)"
              value={faq.answerAr ?? ''}
              onChange={(e) => {
                const next = [...faqs];
                next[i] = { ...faq, answerAr: e.target.value };
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
        onClick={() =>
          onChangeFaqs([...faqs, { question: '', questionAr: '', answer: '', answerAr: '' }])
        }
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
      <span className="text-sm font-bold text-black font-[family-name:var(--font-poppins)]">
        {title}
      </span>
      <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
        {hint}
      </span>
    </div>
  );
}
