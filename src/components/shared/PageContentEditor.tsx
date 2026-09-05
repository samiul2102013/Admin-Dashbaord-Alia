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
import { listPresentations, updatePresentation } from '@/lib/services/presentations';
import type {
  Presentation, PresentationFaq, PresentationTopic, ShortsSectionVisibility,
} from '@/types/presentations';

interface PageContentEditorProps {
  presentationKey: string;
}

/* ── Default shorts content (mirrors i18n fallbacks) ──────────────────────── */

const SHORTS_DEFAULT_TOPICS: PresentationTopic[] = [
  { title: 'Marriage Preparation', videos: '24 Videos' },
  { title: 'Relationship Advice',  videos: '25 Videos' },
  { title: 'Financial Planning',   videos: '18 Videos' },
  { title: 'Family Well-being',    videos: '32 Videos' },
  { title: 'Counseling',           videos: '15 Videos' },
  { title: 'Parenting',            videos: '28 Videos' },
];

const SHORTS_DEFAULT_CONTRIBUTORS: string[] = [
  'Government Programs',
  'Family Court Experts',
  'Certified Counselors',
  'NGO Partners',
];

const SHORTS_DEFAULT_FAQS: PresentationFaq[] = [
  {
    question:   'Are the videos free to watch?',
    questionAr: 'هل مشاهدة مقاطع الفيديو مجانية؟',
    answer:     'Yes — all our educational shorts and full-length videos are completely free to access. Simply browse the topic that interests you and start watching.',
    answerAr:   'نعم — جميع مقاطع الفيديو التعليمية القصيرة والكاملة متاحة مجانًا. ما عليك سوى تصفح الموضوع الذي يثير اهتمامك والبدء في المشاهدة.',
  },
  {
    question:   'Can I share these videos with others?',
    questionAr: 'هل يمكنني مشاركة هذه الفيديوهات مع الآخرين؟',
    answer:     'Absolutely. You can share any video directly from the platform with family, friends, or community groups to help spread awareness.',
    answerAr:   'بالتأكيد. يمكنك مشاركة أي فيديو مباشرةً من المنصة مع أفراد الأسرة والأصدقاء أو مجموعات المجتمع للمساعدة في نشر الوعي.',
  },
  {
    question:   'How often are new videos added?',
    questionAr: 'كم مرة تُضاف مقاطع فيديو جديدة؟',
    answer:     'We add new content weekly. Our library is continuously updated by trusted contributors and certified counselors to ensure fresh, relevant material.',
    answerAr:   'نضيف محتوى جديدًا أسبوعيًا. يتم تحديث مكتبتنا باستمرار من قِبل مساهمين موثوقين ومستشارين معتمدين لضمان تقديم مواد جديدة وذات صلة.',
  },
  {
    question:   'Are subtitles or translations available?',
    questionAr: 'هل تتوفر ترجمات أو ترجمات نصية؟',
    answer:     'Yes — most videos include Arabic and English subtitles. Additional language support is being rolled out gradually.',
    answerAr:   'نعم — تتضمن معظم مقاطع الفيديو ترجمات نصية باللغتين العربية والإنجليزية. ويجري طرح دعم لغات إضافية تدريجيًا.',
  },
];

const DEFAULT_SECTION_VISIBILITY: ShortsSectionVisibility = {
  hero: true, topics: true, contributors: true, faqs: true,
};

function applyShortsFallbacks(p: Presentation): Presentation {
  return {
    ...p,
    topics:            p.topics?.length       ? p.topics       : SHORTS_DEFAULT_TOPICS,
    contributors:      p.contributors?.length ? p.contributors : SHORTS_DEFAULT_CONTRIBUTORS,
    faqs:              p.faqs?.length         ? p.faqs         : SHORTS_DEFAULT_FAQS,
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY, ...(p.sectionVisibility ?? {}) },
  };
}

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
      {/* Header */}
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

        {/* Visibility toggle */}
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

      {/* Content */}
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

/* ── Main editor ──────────────────────────────────────────────────────────── */

const STORAGE_KEY = (key: string) => `admin_editor_collapsed_${key}`;

export default function PageContentEditor({ presentationKey }: PageContentEditorProps) {
  const [data, setData] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Collapse state per section — persisted in localStorage
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY(presentationKey));
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const persistCollapse = (next: Record<string, boolean>) => {
    setCollapsed(next);
    try { localStorage.setItem(STORAGE_KEY(presentationKey), JSON.stringify(next)); } catch { /* ignore */ }
  };

  const toggleCollapse = (id: string) => {
    persistCollapse({ ...collapsed, [id]: !collapsed[id] });
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    setSaved(false);
    listPresentations()
      .then((list) => {
        if (!mounted) return;
        let found = list.find((p) => p.key === presentationKey) ?? null;
        if (found && presentationKey === 'shorts') found = applyShortsFallbacks(found);
        setData(found);
      })
      .catch((e) => { if (mounted) setError(getErrorMessage(e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [presentationKey]);

  const setField = (patch: Partial<Presentation>) =>
    setData((prev) => prev ? { ...prev, ...patch } : prev);

  const setVis = (section: keyof ShortsSectionVisibility, value: boolean) =>
    setField({
      sectionVisibility: {
        ...DEFAULT_SECTION_VISIBILITY,
        ...(data?.sectionVisibility ?? {}),
        [section]: value,
      },
    });

  const vis = (section: keyof ShortsSectionVisibility): boolean =>
    data?.sectionVisibility?.[section] ?? true;

  const setTopics       = (topics: PresentationTopic[]) => setField({ topics });
  const setContributors = (contributors: string[])       => setField({ contributors });
  const setFaqs         = (faqs: PresentationFaq[])      => setField({ faqs });

  const handleSave = async () => {
    if (!data) return;
    setSaving(true); setSaved(false); setError('');
    try {
      const updated = await updatePresentation(data.id, {
        title: data.title, titleAr: data.titleAr,
        description: data.description, descriptionAr: data.descriptionAr,
        badge: data.badge, heroImage: data.heroImage,
        published: data.published,
        topics: data.topics, contributors: data.contributors, faqs: data.faqs,
        sectionVisibility: data.sectionVisibility,
      });
      setData(presentationKey === 'shorts' ? applyShortsFallbacks(updated) : updated);
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
          No page content found. Run <code>python manage.py seed_shorts</code> to initialise.
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
              ? 'This page is visible in the navbar. Turn off to hide the nav link.'
              : 'This page is hidden from the navbar.'}
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

      {/* ── Hero section ───────────────────────────────────────────────────── */}
      <CollapsibleSection
        id="hero" title="Hero Section"
        hint="Title, description & hero image"
        visible={vis('hero')}
        onToggleVisible={() => setVis('hero', !vis('hero'))}
        collapsed={!!collapsed['hero']}
        onToggleCollapsed={() => toggleCollapse('hero')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Title (English)"  value={data.title}    onChange={(e) => setField({ title: e.target.value })} />
          <Input label="Title (Arabic)"   value={data.titleAr}  onChange={(e) => setField({ titleAr: e.target.value })} />
        </div>
        <Textarea label="Description (English)" rows={3} value={data.description}    onChange={(e) => setField({ description: e.target.value })} />
        <Textarea label="Description (Arabic)"  rows={3} value={data.descriptionAr} onChange={(e) => setField({ descriptionAr: e.target.value })} />
        <Input label="Badge"          value={data.badge}      onChange={(e) => setField({ badge: e.target.value })} />
        <Input label="Hero Image URL" value={data.heroImage}  onChange={(e) => setField({ heroImage: e.target.value })} />
      </CollapsibleSection>

      {/* ── Shorts-only sections ───────────────────────────────────────────── */}
      {presentationKey === 'shorts' && (
        <>
          {/* Explore Topics */}
          <CollapsibleSection
            id="topics" title="Explore Topics"
            hint="Cards shown on the Shorts page"
            visible={vis('topics')}
            onToggleVisible={() => setVis('topics', !vis('topics'))}
            collapsed={!!collapsed['topics']}
            onToggleCollapsed={() => toggleCollapse('topics')}
          >
            {(data.topics ?? []).map((topic, i) => (
              <div key={i} className="flex flex-col md:flex-row items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={`Topic ${i + 1} — Title`}
                    value={topic.title}
                    onChange={(e) => {
                      const next = [...data.topics];
                      next[i] = { ...topic, title: e.target.value };
                      setTopics(next);
                    }}
                  />
                </div>
                <div className="w-full md:w-[160px]">
                  <Input
                    label="Videos Count"
                    value={topic.videos ?? ''}
                    onChange={(e) => {
                      const next = [...data.topics];
                      next[i] = { ...topic, videos: e.target.value };
                      setTopics(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setTopics(data.topics.filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove topic"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setTopics([...(data.topics ?? []), { title: '', videos: '' }])}>
              <Plus size={16} /> Add topic
            </Button>
          </CollapsibleSection>

          {/* Trusted Contributors */}
          <CollapsibleSection
            id="contributors" title="Trusted Contributors"
            hint="Name cards displayed on the Shorts page"
            visible={vis('contributors')}
            onToggleVisible={() => setVis('contributors', !vis('contributors'))}
            collapsed={!!collapsed['contributors']}
            onToggleCollapsed={() => toggleCollapse('contributors')}
          >
            {(data.contributors ?? []).map((name, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={`Contributor ${i + 1}`}
                    value={name}
                    placeholder="e.g. Government Programs"
                    onChange={(e) => {
                      const next = [...data.contributors];
                      next[i] = e.target.value;
                      setContributors(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setContributors(data.contributors.filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove contributor"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setContributors([...(data.contributors ?? []), ''])}>
              <Plus size={16} /> Add contributor
            </Button>
          </CollapsibleSection>

          {/* FAQs */}
          <CollapsibleSection
            id="faqs" title="Frequently Asked Questions"
            hint="Accordion shown on the Shorts page"
            visible={vis('faqs')}
            onToggleVisible={() => setVis('faqs', !vis('faqs'))}
            collapsed={!!collapsed['faqs']}
            onToggleCollapsed={() => toggleCollapse('faqs')}
          >
            {(data.faqs ?? []).map((faq, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-secondary/30 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input label="Question (EN)" value={faq.question}      onChange={(e) => { const n=[...data.faqs]; n[i]={...faq,question:e.target.value}; setFaqs(n); }} />
                  <Input label="Question (AR)" value={faq.questionAr??''} onChange={(e) => { const n=[...data.faqs]; n[i]={...faq,questionAr:e.target.value}; setFaqs(n); }} />
                  <Input label="Answer (EN)"   value={faq.answer}        onChange={(e) => { const n=[...data.faqs]; n[i]={...faq,answer:e.target.value}; setFaqs(n); }} />
                  <Input label="Answer (AR)"   value={faq.answerAr??''}  onChange={(e) => { const n=[...data.faqs]; n[i]={...faq,answerAr:e.target.value}; setFaqs(n); }} />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setFaqs(data.faqs.filter((_, idx) => idx !== i))}
                    className="w-10 h-10 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                    aria-label="Remove FAQ"
                  >
                    <Trash2 size={16} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
            <Button
              variant="ghost" size="sm"
              onClick={() => setFaqs([...(data.faqs ?? []), { question: '', questionAr: '', answer: '', answerAr: '' }])}
            >
              <Plus size={16} /> Add FAQ
            </Button>
          </CollapsibleSection>
        </>
      )}

      {/* ── Save bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-secondary/30 sticky bottom-0 bg-white pb-1">
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
