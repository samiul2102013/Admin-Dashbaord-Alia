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
import { useUpload } from '@/hooks/useMeta';
import type {
  Presentation, PresentationFaq, PresentationTopic, ShortsSectionVisibility,
  InitiativesSectionVisibility, ConsultationSectionVisibility, EmiratesSectionVisibility,
  NewsSectionVisibility,
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
  hero: true, topics: true, contributors: true, faqs: true, cta: true,
  categories: true, orgs: true,
};

const DEFAULT_INITIATIVES_SECTION_VISIBILITY: InitiativesSectionVisibility = {
  hero: true, topics: true, contributors: true, faqs: true, cta: true,
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

const INITIATIVES_DEFAULT_TOPICS: PresentationTopic[] = [
  { title: 'Housing Support',     videos: '12 Programs' },
  { title: 'Financial Aid',       videos: '8 Programs' },
  { title: 'Education Programs',  videos: '15 Programs' },
  { title: 'Marriage Training',   videos: '6 Programs' },
  { title: 'Pre-Marital Prep',    videos: '10 Programs' },
  { title: 'Community Outreach',  videos: '9 Programs' },
];

const INITIATIVES_DEFAULT_CONTRIBUTORS: string[] = [
  'Ministry of Community Development',
  'Dubai Marriage Fund',
  'Abu Dhabi Family Foundation',
  'Sharjah Social Services',
];

const INITIATIVES_DEFAULT_FAQS: PresentationFaq[] = [
  {
    question:   'Who is eligible for initiative support?',
    questionAr: 'من مؤهل للحصول على دعم المبادرة؟',
    answer:     'Eligibility varies by initiative. Most programs are available to UAE nationals and residents who meet specific criteria outlined in each initiative description.',
    answerAr:   'تختلف الأهلية حسب المبادرة. معظم البرامج متاحة للمواطنين والمقيمين في الإمارات الذين يستوفون معايير محددة موضحة في وصف كل مبادرة.',
  },
  {
    question:   'How do I apply for an initiative?',
    questionAr: 'كيف أتقدم بطلب للحصول على مبادرة؟',
    answer:     'You can apply directly through the initiative page by clicking the application button. Some initiatives require specific documentation — check the basic information section for details.',
    answerAr:   'يمكنك التقدم مباشرة من خلال صفحة المبادرة بالضغط على زر التقديم. تتطلب بعض المبادرة وثائق محددة — تحقق من قسم المعلومات الأساسية للتفاصيل.',
  },
  {
    question:   'Are these initiatives free?',
    questionAr: 'هل هذه المبادرة مجانية؟',
    answer:     'Most government-backed initiatives are completely free. Some programs may have nominal processing fees, which are clearly indicated on the initiative page.',
    answerAr:   'معظم المبادرة المدعومة من الحكومة مجانية تمامًا. قد تحتوي بعض البرامج على رسوم معالجة رمزية، وهو ما يُوضح بوضوح على صفحة المبادرة.',
  },
  {
    question:   'Can I apply to multiple initiatives?',
    questionAr: 'هل يمكنني التقدم لأكثر من مبادرة؟',
    answer:     'Yes, you can apply to multiple initiatives simultaneously as long as you meet the eligibility criteria for each one.',
    answerAr:   'نعم، يمكنك التقدم لأكثر من مبادرة في نفس الوقت شريطة أن تستوفي معايير الأهلية لكل منها.',
  },
];

function applyInitiativesFallbacks(p: Presentation): Presentation {
  return {
    ...p,
    initiativesTopics:            p.initiativesTopics?.length       ? p.initiativesTopics       : INITIATIVES_DEFAULT_TOPICS,
    initiativesContributors:      p.initiativesContributors?.length ? p.initiativesContributors : INITIATIVES_DEFAULT_CONTRIBUTORS,
    initiativesFaqs:              p.initiativesFaqs?.length         ? p.initiativesFaqs         : INITIATIVES_DEFAULT_FAQS,
    initiativesSectionVisibility: { ...DEFAULT_INITIATIVES_SECTION_VISIBILITY, ...(p.initiativesSectionVisibility ?? {}) },
  };
}

const DEFAULT_CONSULTATION_SECTION_VISIBILITY: ConsultationSectionVisibility = {
  hero: true, topics: true, contributors: true, faqs: true, cta: true,
};

const CONSULTATION_DEFAULT_TOPICS: PresentationTopic[] = [
  { title: 'Marriage Counseling', titleAr: 'الاستشارات الزوجية', videos: '12 Sessions' },
  { title: 'Premarital Guidance', titleAr: 'التوجيه قبل الزواج', videos: '8 Sessions' },
  { title: 'Family Mediation', titleAr: 'الوساطة الأسرية', videos: '6 Sessions' },
  { title: 'Financial Counseling', titleAr: 'الاستشارات المالية', videos: '5 Sessions' },
  { title: 'Parenting Support', titleAr: 'دعم الأبوة والأمومة', videos: '10 Sessions' },
];

const CONSULTATION_DEFAULT_CONTRIBUTORS: string[] = [
  'Licensed Marriage Counselors',
  'Family Therapists',
  'Certified Coaches',
  'Sharia Experts',
];

const CONSULTATION_DEFAULT_FAQS: PresentationFaq[] = [
  {
    question:   'How do I book a consultation session?',
    questionAr: 'كيف أحجز جلسة استشارية؟',
    answer:     'You can browse available counselors, select a time slot that fits your schedule, and complete the booking directly through our platform. You will receive a confirmation email with session details.',
    answerAr:   'يمكنك تصفح المستشارين المتاحين، اختيار الوقت الذي يناسب جدولك، وإتمام الحجز مباشرة عبر منصتنا. ستتلقى بريدًا إلكترونيًا بتأكيد الحجز يحتوي على تفاصيل الجلسة.',
  },
  {
    question:   'Are consultations confidential?',
    questionAr: 'هل الاستشارات سرية؟',
    answer:     'Yes, all consultations are 100% confidential. Our counselors are bound by professional ethics and privacy agreements to protect your information.',
    answerAr:   'نعم، جميع الاستشارات سرية بنسبة 100٪. يلتزم مستشارونا بأخلاقيات المهنة واتفاقيات الخصوصية لحماية معلوماتك.',
  },
  {
    question:   'Can I choose my counselor?',
    questionAr: 'هل يمكنني اختيار المستشار؟',
    answer:     'Absolutely. You can view each counselor\'s profile, specialties, experience, and reviews before making your selection.',
    answerAr:   'بالتأكيد. يمكنك الاطلاع على ملف كل مستشار، وتخصصاته، وخبرته، والتقييمات قبل اتخاذ قرارك.',
  },
  {
    question:   'What is the cost of a consultation?',
    questionAr: 'ما تكلفة الاستشارة؟',
    answer:     'Costs vary by counselor and session type. Many sessions are offered for free or at subsidized rates through government partnerships. Pricing is clearly displayed on each counselor\'s profile.',
    answerAr:   'تختلف التكاليف حسب المستشار ونوع الجلسة. يتم تقديم العديد من الجلسات مجانًا أو بأسعار مدعومة من خلال الشراكات الحكومية. يتم عرض الأسعار بوضوح على ملف كل مستشار.',
  },
];

function applyConsultationFallbacks(p: Presentation): Presentation {
  return {
    ...p,
    consultationTopics:            p.consultationTopics?.length       ? p.consultationTopics       : CONSULTATION_DEFAULT_TOPICS,
    consultationContributors:      p.consultationContributors?.length ? p.consultationContributors : CONSULTATION_DEFAULT_CONTRIBUTORS,
    consultationFaqs:              p.consultationFaqs?.length         ? p.consultationFaqs         : CONSULTATION_DEFAULT_FAQS,
    consultationSectionVisibility: { ...DEFAULT_CONSULTATION_SECTION_VISIBILITY, ...(p.consultationSectionVisibility ?? {}) },
  };
}

const DEFAULT_EMIRATES_SECTION_VISIBILITY: EmiratesSectionVisibility = {
  hero: true, topics: true, contributors: true, faqs: true, cta: true,
};

const EMIRATES_DEFAULT_TOPICS: PresentationTopic[] = [
  { title: 'Abu Dhabi', titleAr: 'أبوظبي', videos: '15 Centers' },
  { title: 'Dubai', titleAr: 'دبي', videos: '22 Centers' },
  { title: 'Sharjah', titleAr: 'الشارقة', videos: '11 Centers' },
  { title: 'Ajman', titleAr: 'عجمان', videos: '6 Centers' },
  { title: 'Fujairah', titleAr: 'الفجيرة', videos: '5 Centers' },
  { title: 'Ras Al Khaimah', titleAr: 'رأس الخيمة', videos: '7 Centers' },
  { title: 'Umm Al Quwain', titleAr: 'أم القيوين', videos: '4 Centers' },
];

const EMIRATES_DEFAULT_CONTRIBUTORS: string[] = [
  'Abu Dhabi Family Development',
  'Dubai Marriage Support Center',
  'Sharjah Social Services',
  'Community Development Authority',
];

const EMIRATES_DEFAULT_FAQS: PresentationFaq[] = [
  {
    question:   'What services are available in my emirate?',
    questionAr: 'ما الخدمات المتاحة في إمارتي؟',
    answer:     'Each emirate offers marriage support programs, counseling centers, financial aid, and community initiatives. Select your emirate to view dedicated services, contact details, and service center locations.',
    answerAr:   'تقدم كل إمارة برامج دعم زوجي، ومراكز استشارية، ومساعدات مالية، ومبادرات مجتمعية. اختر إمارتك لاستعراض الخدمات المخصصة، ومعلومات الاتصال، ومواقع مراكز الخدمة.',
  },
  {
    question:   'How do I contact the nearest service center?',
    questionAr: 'كيف أتواصل مع أقرب مركز خدمة؟',
    answer:     'Click on your emirate card to view phone numbers, website links, and a list of service center locations with operating hours.',
    answerAr:   'انقر على بطاقة إمارتك لعرض أرقام الهواتف، وروابط المواقع الإلكترونية، وقائمة بمواقع مراكز الخدمة مع ساعات العمل.',
  },
  {
    question:   'Are services available for non-citizens?',
    questionAr: 'هل الخدمات متاحة لغير المواطنين؟',
    answer:     'Many services are available to both UAE citizens and residents. Eligibility details are listed on each emirate\'s page and individual service descriptions.',
    answerAr:   'العديد من الخدمات متاحة للمواطنين والمقيمين في الإمارات على حد سواء. يتم سرد تفاصيل الأهلية في صفحة كل إمارة وفي أوصاف الخدمات الفردية.',
  },
  {
    question:   'Can I access services across emirates?',
    questionAr: 'هل يمكنني الاستفادة من الخدمات عبر الإمارات؟',
    answer:     'Some federal programs are accessible nationwide, while others are emirate-specific. Your home emirate services are always your primary point of contact for specialized support.',
    answerAr:   'بعض البرامج الفيدرالية يمكن الوصول إليها على الصعيد الوطني، بينما البعض الآخر خاص بإمارة معينة. خدمات إمارتك المحلية دائمًا هي نقطة الاتصال الأساسية للحصول على دعم متخصص.',
  },
];

function applyEmiratesFallbacks(p: Presentation): Presentation {
  return {
    ...p,
    emiratesTopics:            p.emiratesTopics?.length       ? p.emiratesTopics       : EMIRATES_DEFAULT_TOPICS,
    emiratesContributors:      p.emiratesContributors?.length ? p.emiratesContributors : EMIRATES_DEFAULT_CONTRIBUTORS,
    emiratesFaqs:              p.emiratesFaqs?.length         ? p.emiratesFaqs         : EMIRATES_DEFAULT_FAQS,
    emiratesSectionVisibility: { ...DEFAULT_EMIRATES_SECTION_VISIBILITY, ...(p.emiratesSectionVisibility ?? {}) },
  };
}

const DEFAULT_NEWS_SECTION_VISIBILITY: NewsSectionVisibility = {
  hero: true, topics: true, contributors: true, faqs: true, cta: true,
  categories: true, orgs: true,
};

const NEWS_DEFAULT_TOPICS: PresentationTopic[] = [
  { title: 'Marriage Law Updates', videos: '12 Articles' },
  { title: 'Community Events',     videos: '8 Articles' },
  { title: 'Success Stories',      videos: '15 Articles' },
  { title: 'Expert Opinions',      videos: '10 Articles' },
  { title: 'Government Programs',  videos: '6 Articles' },
  { title: 'Family Wellness',      videos: '9 Articles' },
];

const NEWS_DEFAULT_CONTRIBUTORS: string[] = [
  'Ministry of Justice',
  'National Media Council',
  'Family Development Authority',
  'Community Development Department',
];

const NEWS_DEFAULT_FAQS: PresentationFaq[] = [
  {
    question:   'How do I stay updated with the latest news?',
    questionAr: 'كيف أظل مطلعًا على آخر الأخبار؟',
    answer:     'You can browse our News page regularly for the latest updates on marriage support programs, events, success stories, and expert advice from across the UAE.',
    answerAr:   'يمكنك تصفح صفحة الأخبار بانتظام للحصول على آخر التحديثات حول برامج دعم الزواج والفعاليات وقصص النصائح الخبراء من جميع أنحاء الإمارات.',
  },
  {
    question:   'Can I submit a news story or event?',
    questionAr: 'هل يمكنني تقديم خبر أو فعالية؟',
    answer:     'Yes, we welcome community submissions. Contact our editorial team through the contact page with your story idea or event details for review.',
    answerAr:   'نعم، نرحب بمساهمات المجتمع. تواصل مع فريق التحرير لدينا من خلال صفحة الاتصال مع فكرة خبرك أو تفاصيل فعالتك للمراجعة.',
  },
  {
    question:   'Are news articles available in both languages?',
    questionAr: 'هل المقالات الإخبارية متاحة باللغتين؟',
    answer:     'Most news articles are published in both Arabic and English to serve all members of our diverse community across the UAE.',
    answerAr:   'يتم نشر معظم المقالات الإخبارية باللغتين العربية والإنجليزية لخدمة جميع أفراد مجتمعنا المتنوع عبر الإمارات.',
  },
  {
    question:   'How can I share news articles with others?',
    questionAr: 'كيف يمكنني مشاركة المقالات الإخبارية مع الآخرين؟',
    answer:     'Every news article includes a share button that allows you to share via social media, email, or direct link with family, friends, and community groups.',
    answerAr:   'تتضمن كل مقال إخباري زر مشاركة يسمح لك بالمشاركة عبر وسائل التواصل الاجتماعي أو البريد الإلكتروني أو الرابط المباشر مع العائلة والأصدقاء ومجموعات المجتمع.',
  },
];

function applyNewsFallbacks(p: Presentation): Presentation {
  return {
    ...p,
    newsTopics:            p.newsTopics?.length       ? p.newsTopics       : NEWS_DEFAULT_TOPICS,
    newsContributors:      p.newsContributors?.length ? p.newsContributors : NEWS_DEFAULT_CONTRIBUTORS,
    newsFaqs:              p.newsFaqs?.length         ? p.newsFaqs         : NEWS_DEFAULT_FAQS,
    newsSectionVisibility: { ...DEFAULT_NEWS_SECTION_VISIBILITY, ...(p.newsSectionVisibility ?? {}) },
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

/* ── File upload component (reused across editors) ───────────────────────── */

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

/* ── Main editor ──────────────────────────────────────────────────────────── */

const STORAGE_KEY = (key: string) => `admin_editor_collapsed_${key}`;

export default function PageContentEditor({ presentationKey }: PageContentEditorProps) {
  const [data, setData] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const upload = useUpload();

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
        if (found && presentationKey === 'initiatives') found = applyInitiativesFallbacks(found);
        if (found && presentationKey === 'consultation') found = applyConsultationFallbacks(found);
        if (found && presentationKey === 'emirates') found = applyEmiratesFallbacks(found);
        if (found && presentationKey === 'news') found = applyNewsFallbacks(found);
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

  /* ── Initiatives helpers ───────────────────────────────────────────────── */
  const setInitiativesVis = (section: keyof InitiativesSectionVisibility, value: boolean) =>
    setField({
      initiativesSectionVisibility: {
        ...DEFAULT_INITIATIVES_SECTION_VISIBILITY,
        ...(data?.initiativesSectionVisibility ?? {}),
        [section]: value,
      },
    });

  const initiativesVis = (section: keyof InitiativesSectionVisibility): boolean =>
    data?.initiativesSectionVisibility?.[section] ?? true;

  const setInitiativesTopics       = (initiativesTopics: PresentationTopic[]) => setField({ initiativesTopics });
  const setInitiativesContributors = (initiativesContributors: string[])       => setField({ initiativesContributors });
  const setInitiativesFaqs         = (initiativesFaqs: PresentationFaq[])      => setField({ initiativesFaqs });

  /* ── Consultation helpers ──────────────────────────────────────────────── */
  const setConsultationVis = (section: keyof ConsultationSectionVisibility, value: boolean) =>
    setField({
      consultationSectionVisibility: {
        ...DEFAULT_CONSULTATION_SECTION_VISIBILITY,
        ...(data?.consultationSectionVisibility ?? {}),
        [section]: value,
      },
    });

  const consultationVis = (section: keyof ConsultationSectionVisibility): boolean =>
    data?.consultationSectionVisibility?.[section] ?? true;

  const setConsultationTopics       = (consultationTopics: PresentationTopic[]) => setField({ consultationTopics });
  const setConsultationContributors = (consultationContributors: string[])       => setField({ consultationContributors });
  const setConsultationFaqs         = (consultationFaqs: PresentationFaq[])      => setField({ consultationFaqs });

  /* ── Emirates helpers ──────────────────────────────────────────────────── */
  const setEmiratesVis = (section: keyof EmiratesSectionVisibility, value: boolean) =>
    setField({
      emiratesSectionVisibility: {
        ...DEFAULT_EMIRATES_SECTION_VISIBILITY,
        ...(data?.emiratesSectionVisibility ?? {}),
        [section]: value,
      },
    });

  const emiratesVis = (section: keyof EmiratesSectionVisibility): boolean =>
    data?.emiratesSectionVisibility?.[section] ?? true;

  const setEmiratesTopics       = (emiratesTopics: PresentationTopic[]) => setField({ emiratesTopics });
  const setEmiratesContributors = (emiratesContributors: string[])       => setField({ emiratesContributors });
  const setEmiratesFaqs         = (emiratesFaqs: PresentationFaq[])      => setField({ emiratesFaqs });

  /* ── News helpers ──────────────────────────────────────────────────── */
  const setNewsVis = (section: keyof NewsSectionVisibility, value: boolean) =>
    setField({
      newsSectionVisibility: {
        ...DEFAULT_NEWS_SECTION_VISIBILITY,
        ...(data?.newsSectionVisibility ?? {}),
        [section]: value,
      },
    });

  const newsVis = (section: keyof NewsSectionVisibility): boolean =>
    data?.newsSectionVisibility?.[section] ?? true;

  const setNewsTopics       = (newsTopics: PresentationTopic[]) => setField({ newsTopics });
  const setNewsContributors = (newsContributors: string[])       => setField({ newsContributors });
  const setNewsFaqs         = (newsFaqs: PresentationFaq[])      => setField({ newsFaqs });

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
        initiativesTopics: data.initiativesTopics,
        initiativesContributors: data.initiativesContributors,
        initiativesFaqs: data.initiativesFaqs,
        initiativesSectionVisibility: data.initiativesSectionVisibility,
        consultationTopics: data.consultationTopics,
        consultationContributors: data.consultationContributors,
        consultationFaqs: data.consultationFaqs,
        consultationSectionVisibility: data.consultationSectionVisibility,
        emiratesTopics: data.emiratesTopics,
        emiratesContributors: data.emiratesContributors,
        emiratesFaqs: data.emiratesFaqs,
        emiratesSectionVisibility: data.emiratesSectionVisibility,
        newsTopics: data.newsTopics,
        newsContributors: data.newsContributors,
        newsFaqs: data.newsFaqs,
        newsSectionVisibility: data.newsSectionVisibility,
      });
      let patched = updated;
      if (presentationKey === 'shorts') patched = applyShortsFallbacks(patched);
      if (presentationKey === 'initiatives') patched = applyInitiativesFallbacks(patched);
      if (presentationKey === 'consultation') patched = applyConsultationFallbacks(patched);
      if (presentationKey === 'emirates') patched = applyEmiratesFallbacks(patched);
      if (presentationKey === 'news') patched = applyNewsFallbacks(patched);
      setData(patched);
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
        <div className="col-span-full">
          <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)] mb-2 block">
            Hero Image
          </label>
          <p className="text-[11px] text-text-secondary mb-2 font-[family-name:var(--font-poppins)]">
            Recommended size: 1280 × 800 px. JPG / PNG / WebP, max 5 GB.
          </p>
          <FileUpload
            value={data.heroImage}
            label="Upload Hero Image"
            isUploading={upload.isPending}
            onUpload={async (file) => {
              try {
                const res = await upload.mutateAsync(file);
                setField({ heroImage: res.url });
              } catch (uploadError) {
                setError(`Image upload failed: ${getErrorMessage(uploadError)}`);
              }
            }}
          />
        </div>
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

          {/* Explore More CTA Banner */}
          <CollapsibleSection
            id="cta" title="Explore More Marriage Support"
            hint="Bottom CTA banner on the Shorts page"
            visible={vis('cta')}
            onToggleVisible={() => setVis('cta', !vis('cta'))}
            collapsed={!!collapsed['cta']}
            onToggleCollapsed={() => toggleCollapse('cta')}
          >
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
              The text content for this banner (title, description, button labels) is managed via
              the i18n translation files. Use the visibility toggle above to show or hide it entirely.
            </p>
          </CollapsibleSection>
        </>
      )}

      {/* ── News-only sections ───────────────────────────────────────────── */}
      {presentationKey === 'news' && (
        <>
          {/* Popular Categories */}
          <CollapsibleSection
            id="news-categories" title="Popular Categories"
            hint="Category cards on the News page"
            visible={newsVis('categories')}
            onToggleVisible={() => setNewsVis('categories', !newsVis('categories'))}
            collapsed={!!collapsed['news-categories']}
            onToggleCollapsed={() => toggleCollapse('news-categories')}
          >
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
              The category content is managed via the i18n translation files. Use the visibility toggle above to show or hide this section entirely.
            </p>
          </CollapsibleSection>

          {/* Explore Topics */}
          <CollapsibleSection
            id="news-topics" title="Explore Topics"
            hint="Cards shown on the News page"
            visible={newsVis('topics')}
            onToggleVisible={() => setNewsVis('topics', !newsVis('topics'))}
            collapsed={!!collapsed['news-topics']}
            onToggleCollapsed={() => toggleCollapse('news-topics')}
          >
            {(data.newsTopics ?? []).map((topic, i) => (
              <div key={i} className="flex flex-col md:flex-row items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={`Topic ${i + 1} — Title`}
                    value={topic.title}
                    onChange={(e) => {
                      const next = [...(data.newsTopics ?? [])];
                      next[i] = { ...topic, title: e.target.value };
                      setNewsTopics(next);
                    }}
                  />
                </div>
                <div className="w-full md:w-[160px]">
                  <Input
                    label="Count Label"
                    value={topic.videos ?? ''}
                    onChange={(e) => {
                      const next = [...(data.newsTopics ?? [])];
                      next[i] = { ...topic, videos: e.target.value };
                      setNewsTopics(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setNewsTopics((data.newsTopics ?? []).filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove topic"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setNewsTopics([...(data.newsTopics ?? []), { title: '', videos: '' }])}>
              <Plus size={16} /> Add topic
            </Button>
          </CollapsibleSection>

          {/* Featured Organizations */}
          <CollapsibleSection
            id="news-orgs" title="Featured Organizations"
            hint="Organization cards on the News page"
            visible={newsVis('orgs')}
            onToggleVisible={() => setNewsVis('orgs', !newsVis('orgs'))}
            collapsed={!!collapsed['news-orgs']}
            onToggleCollapsed={() => toggleCollapse('news-orgs')}
          >
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
              The organization content is managed via the i18n translation files. Use the visibility toggle above to show or hide this section entirely.
            </p>
          </CollapsibleSection>

          {/* Trusted Contributors */}
          <CollapsibleSection
            id="news-contributors" title="Trusted Contributors"
            hint="Name cards displayed on the News page"
            visible={newsVis('contributors')}
            onToggleVisible={() => setNewsVis('contributors', !newsVis('contributors'))}
            collapsed={!!collapsed['news-contributors']}
            onToggleCollapsed={() => toggleCollapse('news-contributors')}
          >
            {(data.newsContributors ?? []).map((name, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={`Contributor ${i + 1}`}
                    value={name}
                    placeholder="e.g. Ministry of Justice"
                    onChange={(e) => {
                      const next = [...(data.newsContributors ?? [])];
                      next[i] = e.target.value;
                      setNewsContributors(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setNewsContributors((data.newsContributors ?? []).filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove contributor"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setNewsContributors([...(data.newsContributors ?? []), ''])}>
              <Plus size={16} /> Add contributor
            </Button>
          </CollapsibleSection>

          {/* FAQs */}
          <CollapsibleSection
            id="news-faqs" title="Frequently Asked Questions"
            hint="Accordion shown on the News page"
            visible={newsVis('faqs')}
            onToggleVisible={() => setNewsVis('faqs', !newsVis('faqs'))}
            collapsed={!!collapsed['news-faqs']}
            onToggleCollapsed={() => toggleCollapse('news-faqs')}
          >
            {(data.newsFaqs ?? []).map((faq, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-secondary/30 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input label="Question (EN)" value={faq.question}      onChange={(e) => { const n=[...(data.newsFaqs ?? [])]; n[i]={...faq,question:e.target.value}; setNewsFaqs(n); }} />
                  <Input label="Question (AR)" value={faq.questionAr??''} onChange={(e) => { const n=[...(data.newsFaqs ?? [])]; n[i]={...faq,questionAr:e.target.value}; setNewsFaqs(n); }} />
                  <Input label="Answer (EN)"   value={faq.answer}        onChange={(e) => { const n=[...(data.newsFaqs ?? [])]; n[i]={...faq,answer:e.target.value}; setNewsFaqs(n); }} />
                  <Input label="Answer (AR)"   value={faq.answerAr??''}  onChange={(e) => { const n=[...(data.newsFaqs ?? [])]; n[i]={...faq,answerAr:e.target.value}; setNewsFaqs(n); }} />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setNewsFaqs((data.newsFaqs ?? []).filter((_, idx) => idx !== i))}
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
              onClick={() => setNewsFaqs([...(data.newsFaqs ?? []), { question: '', questionAr: '', answer: '', answerAr: '' }])}
            >
              <Plus size={16} /> Add FAQ
            </Button>
          </CollapsibleSection>

          {/* CTA Banner */}
          <CollapsibleSection
            id="news-cta" title="Explore More Resources"
            hint="Bottom CTA banner on the News page"
            visible={newsVis('cta')}
            onToggleVisible={() => setNewsVis('cta', !newsVis('cta'))}
            collapsed={!!collapsed['news-cta']}
            onToggleCollapsed={() => toggleCollapse('news-cta')}
          >
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
              The text content for this banner (title, description, button labels) is managed via
              the i18n translation files. Use the visibility toggle above to show or hide it entirely.
            </p>
          </CollapsibleSection>
        </>
      )}

      {/* ── Initiatives-only sections ─────────────────────────────────────── */}
      {presentationKey === 'initiatives' && (
        <>
          {/* Explore Topics */}
          <CollapsibleSection
            id="init-topics" title="Explore Topics"
            hint="Cards shown on the Initiatives page"
            visible={initiativesVis('topics')}
            onToggleVisible={() => setInitiativesVis('topics', !initiativesVis('topics'))}
            collapsed={!!collapsed['init-topics']}
            onToggleCollapsed={() => toggleCollapse('init-topics')}
          >
            {(data.initiativesTopics ?? []).map((topic, i) => (
              <div key={i} className="flex flex-col md:flex-row items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={`Topic ${i + 1} — Title`}
                    value={topic.title}
                    onChange={(e) => {
                      const next = [...(data.initiativesTopics ?? [])];
                      next[i] = { ...topic, title: e.target.value };
                      setInitiativesTopics(next);
                    }}
                  />
                </div>
                <div className="w-full md:w-[160px]">
                  <Input
                    label="Count Label"
                    value={topic.videos ?? ''}
                    onChange={(e) => {
                      const next = [...(data.initiativesTopics ?? [])];
                      next[i] = { ...topic, videos: e.target.value };
                      setInitiativesTopics(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setInitiativesTopics((data.initiativesTopics ?? []).filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove topic"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setInitiativesTopics([...(data.initiativesTopics ?? []), { title: '', videos: '' }])}>
              <Plus size={16} /> Add topic
            </Button>
          </CollapsibleSection>

          {/* Trusted Contributors */}
          <CollapsibleSection
            id="init-contributors" title="Trusted Contributors"
            hint="Name cards displayed on the Initiatives page"
            visible={initiativesVis('contributors')}
            onToggleVisible={() => setInitiativesVis('contributors', !initiativesVis('contributors'))}
            collapsed={!!collapsed['init-contributors']}
            onToggleCollapsed={() => toggleCollapse('init-contributors')}
          >
            {(data.initiativesContributors ?? []).map((name, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={`Contributor ${i + 1}`}
                    value={name}
                    placeholder="e.g. Ministry of Community Development"
                    onChange={(e) => {
                      const next = [...(data.initiativesContributors ?? [])];
                      next[i] = e.target.value;
                      setInitiativesContributors(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setInitiativesContributors((data.initiativesContributors ?? []).filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove contributor"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setInitiativesContributors([...(data.initiativesContributors ?? []), ''])}>
              <Plus size={16} /> Add contributor
            </Button>
          </CollapsibleSection>

          {/* FAQs */}
          <CollapsibleSection
            id="init-faqs" title="Frequently Asked Questions"
            hint="Accordion shown on the Initiatives page"
            visible={initiativesVis('faqs')}
            onToggleVisible={() => setInitiativesVis('faqs', !initiativesVis('faqs'))}
            collapsed={!!collapsed['init-faqs']}
            onToggleCollapsed={() => toggleCollapse('init-faqs')}
          >
            {(data.initiativesFaqs ?? []).map((faq, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-secondary/30 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input label="Question (EN)" value={faq.question}      onChange={(e) => { const n=[...(data.initiativesFaqs ?? [])]; n[i]={...faq,question:e.target.value}; setInitiativesFaqs(n); }} />
                  <Input label="Question (AR)" value={faq.questionAr??''} onChange={(e) => { const n=[...(data.initiativesFaqs ?? [])]; n[i]={...faq,questionAr:e.target.value}; setInitiativesFaqs(n); }} />
                  <Input label="Answer (EN)"   value={faq.answer}        onChange={(e) => { const n=[...(data.initiativesFaqs ?? [])]; n[i]={...faq,answer:e.target.value}; setInitiativesFaqs(n); }} />
                  <Input label="Answer (AR)"   value={faq.answerAr??''}  onChange={(e) => { const n=[...(data.initiativesFaqs ?? [])]; n[i]={...faq,answerAr:e.target.value}; setInitiativesFaqs(n); }} />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setInitiativesFaqs((data.initiativesFaqs ?? []).filter((_, idx) => idx !== i))}
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
              onClick={() => setInitiativesFaqs([...(data.initiativesFaqs ?? []), { question: '', questionAr: '', answer: '', answerAr: '' }])}
            >
              <Plus size={16} /> Add FAQ
            </Button>
          </CollapsibleSection>

          {/* CTA Banner */}
          <CollapsibleSection
            id="init-cta" title="Explore More Initiatives"
            hint="Bottom CTA banner on the Initiatives page"
            visible={initiativesVis('cta')}
            onToggleVisible={() => setInitiativesVis('cta', !initiativesVis('cta'))}
            collapsed={!!collapsed['init-cta']}
            onToggleCollapsed={() => toggleCollapse('init-cta')}
          >
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
              The text content for this banner (title, description, button labels) is managed via
              the i18n translation files. Use the visibility toggle above to show or hide it entirely.
            </p>
          </CollapsibleSection>
        </>
      )}

      {/* ── Consultation-only sections ─────────────────────────────────────── */}
      {presentationKey === 'consultation' && (
        <>
          {/* Explore Topics */}
          <CollapsibleSection
            id="cons-topics" title="Explore Topics"
            hint="Cards shown on the Consultation page"
            visible={consultationVis('topics')}
            onToggleVisible={() => setConsultationVis('topics', !consultationVis('topics'))}
            collapsed={!!collapsed['cons-topics']}
            onToggleCollapsed={() => toggleCollapse('cons-topics')}
          >
            {(data.consultationTopics ?? []).map((topic, i) => (
              <div key={i} className="flex flex-col md:flex-row items-end gap-2">
                <div className="flex-1 md:flex md:gap-2">
                  <div className="flex-1">
                    <Input
                      label={`Topic ${i + 1} — Title (EN)`}
                      value={topic.title}
                      onChange={(e) => {
                        const next = [...(data.consultationTopics ?? [])];
                        next[i] = { ...topic, title: e.target.value };
                        setConsultationTopics(next);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label={`Title (AR)`}
                      value={topic.titleAr ?? ''}
                      onChange={(e) => {
                        const next = [...(data.consultationTopics ?? [])];
                        next[i] = { ...topic, titleAr: e.target.value };
                        setConsultationTopics(next);
                      }}
                    />
                  </div>
                </div>
                <div className="w-full md:w-[160px]">
                  <Input
                    label="Count Label"
                    value={topic.videos ?? ''}
                    onChange={(e) => {
                      const next = [...(data.consultationTopics ?? [])];
                      next[i] = { ...topic, videos: e.target.value };
                      setConsultationTopics(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setConsultationTopics((data.consultationTopics ?? []).filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove topic"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setConsultationTopics([...(data.consultationTopics ?? []), { title: '', titleAr: '', videos: '' }])}>
              <Plus size={16} /> Add topic
            </Button>
          </CollapsibleSection>

          {/* Trusted Contributors */}
          <CollapsibleSection
            id="cons-contributors" title="Trusted Contributors"
            hint="Name cards displayed on the Consultation page"
            visible={consultationVis('contributors')}
            onToggleVisible={() => setConsultationVis('contributors', !consultationVis('contributors'))}
            collapsed={!!collapsed['cons-contributors']}
            onToggleCollapsed={() => toggleCollapse('cons-contributors')}
          >
            {(data.consultationContributors ?? []).map((name, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={`Contributor ${i + 1}`}
                    value={name}
                    placeholder="e.g. Licensed Marriage Counselors"
                    onChange={(e) => {
                      const next = [...(data.consultationContributors ?? [])];
                      next[i] = e.target.value;
                      setConsultationContributors(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setConsultationContributors((data.consultationContributors ?? []).filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove contributor"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setConsultationContributors([...(data.consultationContributors ?? []), ''])}>
              <Plus size={16} /> Add contributor
            </Button>
          </CollapsibleSection>

          {/* FAQs */}
          <CollapsibleSection
            id="cons-faqs" title="Frequently Asked Questions"
            hint="Accordion shown on the Consultation page"
            visible={consultationVis('faqs')}
            onToggleVisible={() => setConsultationVis('faqs', !consultationVis('faqs'))}
            collapsed={!!collapsed['cons-faqs']}
            onToggleCollapsed={() => toggleCollapse('cons-faqs')}
          >
            {(data.consultationFaqs ?? []).map((faq, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-secondary/30 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input label="Question (EN)" value={faq.question}      onChange={(e) => { const n=[...(data.consultationFaqs ?? [])]; n[i]={...faq,question:e.target.value}; setConsultationFaqs(n); }} />
                  <Input label="Question (AR)" value={faq.questionAr??''} onChange={(e) => { const n=[...(data.consultationFaqs ?? [])]; n[i]={...faq,questionAr:e.target.value}; setConsultationFaqs(n); }} />
                  <Input label="Answer (EN)"   value={faq.answer}        onChange={(e) => { const n=[...(data.consultationFaqs ?? [])]; n[i]={...faq,answer:e.target.value}; setConsultationFaqs(n); }} />
                  <Input label="Answer (AR)"   value={faq.answerAr??''}  onChange={(e) => { const n=[...(data.consultationFaqs ?? [])]; n[i]={...faq,answerAr:e.target.value}; setConsultationFaqs(n); }} />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setConsultationFaqs((data.consultationFaqs ?? []).filter((_, idx) => idx !== i))}
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
              onClick={() => setConsultationFaqs([...(data.consultationFaqs ?? []), { question: '', questionAr: '', answer: '', answerAr: '' }])}
            >
              <Plus size={16} /> Add FAQ
            </Button>
          </CollapsibleSection>

          {/* CTA Banner */}
          <CollapsibleSection
            id="cons-cta" title="Explore More Consultations"
            hint="Bottom CTA banner on the Consultation page"
            visible={consultationVis('cta')}
            onToggleVisible={() => setConsultationVis('cta', !consultationVis('cta'))}
            collapsed={!!collapsed['cons-cta']}
            onToggleCollapsed={() => toggleCollapse('cons-cta')}
          >
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
              The text content for this banner (title, description, button labels) is managed via
              the i18n translation files. Use the visibility toggle above to show or hide it entirely.
            </p>
          </CollapsibleSection>
        </>
      )}

      {/* ── Emirates-only sections ─────────────────────────────────────────── */}
      {presentationKey === 'emirates' && (
        <>
          {/* Explore Topics */}
          <CollapsibleSection
            id="em-topics" title="Explore Topics"
            hint="Cards shown on the Emirates page"
            visible={emiratesVis('topics')}
            onToggleVisible={() => setEmiratesVis('topics', !emiratesVis('topics'))}
            collapsed={!!collapsed['em-topics']}
            onToggleCollapsed={() => toggleCollapse('em-topics')}
          >
            {(data.emiratesTopics ?? []).map((topic, i) => (
              <div key={i} className="flex flex-col md:flex-row items-end gap-2">
                <div className="flex-1 md:flex md:gap-2">
                  <div className="flex-1">
                    <Input
                      label={`Topic ${i + 1} — Title (EN)`}
                      value={topic.title}
                      onChange={(e) => {
                        const next = [...(data.emiratesTopics ?? [])];
                        next[i] = { ...topic, title: e.target.value };
                        setEmiratesTopics(next);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label={`Title (AR)`}
                      value={topic.titleAr ?? ''}
                      onChange={(e) => {
                        const next = [...(data.emiratesTopics ?? [])];
                        next[i] = { ...topic, titleAr: e.target.value };
                        setEmiratesTopics(next);
                      }}
                    />
                  </div>
                </div>
                <div className="w-full md:w-[160px]">
                  <Input
                    label="Count Label"
                    value={topic.videos ?? ''}
                    onChange={(e) => {
                      const next = [...(data.emiratesTopics ?? [])];
                      next[i] = { ...topic, videos: e.target.value };
                      setEmiratesTopics(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEmiratesTopics((data.emiratesTopics ?? []).filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove topic"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setEmiratesTopics([...(data.emiratesTopics ?? []), { title: '', titleAr: '', videos: '' }])}>
              <Plus size={16} /> Add topic
            </Button>
          </CollapsibleSection>

          {/* Trusted Contributors */}
          <CollapsibleSection
            id="em-contributors" title="Trusted Contributors"
            hint="Name cards displayed on the Emirates page"
            visible={emiratesVis('contributors')}
            onToggleVisible={() => setEmiratesVis('contributors', !emiratesVis('contributors'))}
            collapsed={!!collapsed['em-contributors']}
            onToggleCollapsed={() => toggleCollapse('em-contributors')}
          >
            {(data.emiratesContributors ?? []).map((name, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={`Contributor ${i + 1}`}
                    value={name}
                    placeholder="e.g. Abu Dhabi Family Development"
                    onChange={(e) => {
                      const next = [...(data.emiratesContributors ?? [])];
                      next[i] = e.target.value;
                      setEmiratesContributors(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEmiratesContributors((data.emiratesContributors ?? []).filter((_, idx) => idx !== i))}
                  className="mb-[2px] w-10 h-10 shrink-0 rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                  aria-label="Remove contributor"
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setEmiratesContributors([...(data.emiratesContributors ?? []), ''])}>
              <Plus size={16} /> Add contributor
            </Button>
          </CollapsibleSection>

          {/* FAQs */}
          <CollapsibleSection
            id="em-faqs" title="Frequently Asked Questions"
            hint="Accordion shown on the Emirates page"
            visible={emiratesVis('faqs')}
            onToggleVisible={() => setEmiratesVis('faqs', !emiratesVis('faqs'))}
            collapsed={!!collapsed['em-faqs']}
            onToggleCollapsed={() => toggleCollapse('em-faqs')}
          >
            {(data.emiratesFaqs ?? []).map((faq, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-secondary/30 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input label="Question (EN)" value={faq.question}      onChange={(e) => { const n=[...(data.emiratesFaqs ?? [])]; n[i]={...faq,question:e.target.value}; setEmiratesFaqs(n); }} />
                  <Input label="Question (AR)" value={faq.questionAr??''} onChange={(e) => { const n=[...(data.emiratesFaqs ?? [])]; n[i]={...faq,questionAr:e.target.value}; setEmiratesFaqs(n); }} />
                  <Input label="Answer (EN)"   value={faq.answer}        onChange={(e) => { const n=[...(data.emiratesFaqs ?? [])]; n[i]={...faq,answer:e.target.value}; setEmiratesFaqs(n); }} />
                  <Input label="Answer (AR)"   value={faq.answerAr??''}  onChange={(e) => { const n=[...(data.emiratesFaqs ?? [])]; n[i]={...faq,answerAr:e.target.value}; setEmiratesFaqs(n); }} />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEmiratesFaqs((data.emiratesFaqs ?? []).filter((_, idx) => idx !== i))}
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
              onClick={() => setEmiratesFaqs([...(data.emiratesFaqs ?? []), { question: '', questionAr: '', answer: '', answerAr: '' }])}
            >
              <Plus size={16} /> Add FAQ
            </Button>
          </CollapsibleSection>

          {/* CTA Banner */}
          <CollapsibleSection
            id="em-cta" title="Explore More Emirates"
            hint="Bottom CTA banner on the Emirates page"
            visible={emiratesVis('cta')}
            onToggleVisible={() => setEmiratesVis('cta', !emiratesVis('cta'))}
            collapsed={!!collapsed['em-cta']}
            onToggleCollapsed={() => toggleCollapse('em-cta')}
          >
            <p className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
              The text content for this banner (title, description, button labels) is managed via
              the i18n translation files. Use the visibility toggle above to show or hide it entirely.
            </p>
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
