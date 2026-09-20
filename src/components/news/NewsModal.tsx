'use client';

import { useCallback, useEffect, useState } from 'react';
import { Info, LayoutGrid, Link2, Loader2, Plus, Share2, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import StatusField from '@/components/shared/StatusField';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import {
  EMIRATES_OPTIONS,
  LANGUAGE_OPTIONS,
  NEWS_CATEGORY_OPTIONS,
  NEWS_SOURCE_OPTIONS,
} from '@/lib/constants';
import { useCreateNewsArticle, useUpdateNewsArticle } from '@/hooks/useNewsArticles';
import { useUpload } from '@/hooks/useMeta';
import { getErrorMessage } from '@/lib/api-client';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import VisibilityGroups, {
  countHidden,
  visibilityKeys,
  type VisibilityGroup,
} from '@/components/shared/VisibilityGroups';
import { getNewsArticle } from '@/lib/services/news';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import type { NewsArticle, NewsResource } from '@/types/news';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: NewsArticle | null;
}

const emptyResources: NewsResource[] = [{ title: '', titleAr: '', url: '', type: '' }];

type NewsSectionKey = 'media' | 'content' | 'resources' | 'display';

const initialSections: Record<NewsSectionKey, boolean> = {
  media: false,
  content: false,
  resources: false,
  display: false,
};

// Groups mirror the order sections appear on the public article page.
const NEWS_VISIBILITY_GROUPS: VisibilityGroup[] = [
  {
    title: 'Article Info',
    description: 'the sidebar facts card',
    icon: Info,
    items: [
      { key: 'showArticleInfo', label: 'Article Info Card', description: 'Shows the card with author, organization, city and published date.' },
    ],
  },
  {
    title: 'Related Resources',
    description: 'the links card',
    icon: Link2,
    items: [
      { key: 'showRelatedResources', label: 'Resources List', description: 'Shows the "Related Resources" card with its external links.' },
    ],
  },
  {
    title: 'Share',
    description: 'the social sharing action',
    icon: Share2,
    items: [
      { key: 'showShare', label: 'Share Button', description: 'Shows the share action for the article.' },
    ],
  },
  {
    title: 'Related Stories',
    description: 'other articles at the bottom',
    icon: LayoutGrid,
    items: [
      { key: 'showRelatedStories', label: 'Related Stories List', description: 'Shows the list of other articles from the same category.' },
    ],
  },
];

const TOGGLE_KEYS: string[] = visibilityKeys(NEWS_VISIBILITY_GROUPS);

export default function NewsModal({ isOpen, onClose, article }: NewsModalProps) {
  const createNewsArticle = useCreateNewsArticle();
  const updateNewsArticle = useUpdateNewsArticle();
  const upload = useUpload();

  const [articleTitle, setArticleTitle] = useState('');
  const [articleTitleAr, setArticleTitleAr] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [language, setLanguage] = useState('en');
  const [content, setContent] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('');
  const [authorAr, setAuthorAr] = useState('');
  const [editorialTeam, setEditorialTeam] = useState('');
  const [organization, setOrganization] = useState('');
  const [organizationAr, setOrganizationAr] = useState('');
  const [moc, setMoc] = useState('');
  const [city, setCity] = useState('');
  const [cityAr, setCityAr] = useState('');
  const [emirate, setEmirate] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');
  const [resources, setResources] = useState<NewsResource[]>(emptyResources);
  const [shareUrl, setShareUrl] = useState('');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    showArticleInfo: true,
    showRelatedResources: true,
    showShare: true,
    showRelatedStories: true,
  });
  const [status, setStatus] = useState('Draft');
  const [error, setError] = useState('');
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Record<NewsSectionKey, boolean>>(initialSections);

  function toggleSection(key: NewsSectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  useEffect(() => {
    if (article) {
      setArticleTitle(article.articleTitle || '');
      setArticleTitleAr(article.articleTitleAr || '');
      setCategory(article.category || '');
      setSource(article.source || '');
      setLanguage(article.language || 'en');
      setContent(article.content || '');
      setContentAr(article.contentAr || '');
      setCoverImage(article.coverImage || '');
      setAuthor(article.author || '');
      setAuthorAr(article.authorAr || '');
      setEditorialTeam(article.editorialTeam || '');
      setOrganization(article.organization || '');
      setOrganizationAr(article.organizationAr || '');
      setMoc(article.moc || '');
      setCity(article.city || '');
      setCityAr(article.cityAr || '');
      setEmirate(article.emirate || '');
      setPublishedDate(article.publishedDate || '');
      setUpdatedDate(article.updatedDate || '');
      setMachineFlags({
        articleTitleAr: getIsMachineFlag(article, 'articleTitleAr'),
        contentAr: getIsMachineFlag(article, 'contentAr'),
        authorAr: getIsMachineFlag(article, 'authorAr'),
        organizationAr: getIsMachineFlag(article, 'organizationAr'),
        cityAr: getIsMachineFlag(article, 'cityAr'),
      });
      setFailedFields(new Set());
      setResources(article.resources?.length ? article.resources as NewsResource[] : emptyResources);
      setShareUrl(article.shareUrl || '');
      setToggles({
        showArticleInfo: article.showArticleInfo ?? true,
        showRelatedResources: article.showRelatedResources ?? true,
        showShare: article.showShare ?? true,
        showRelatedStories: article.showRelatedStories ?? true,
      });
      setStatus(article.status || 'Draft');
    } else {
      setArticleTitle('');
      setArticleTitleAr('');
      setCategory('');
      setSource('');
      setLanguage('en');
      setContent('');
      setContentAr('');
      setCoverImage('');
      setAuthor('');
      setAuthorAr('');
      setEditorialTeam('');
      setOrganization('');
      setOrganizationAr('');
      setMoc('');
      setCity('');
      setCityAr('');
      setEmirate('');
      setPublishedDate('');
      setUpdatedDate('');
      setMachineFlags({});
      setFailedFields(new Set());
      setResources(emptyResources);
      setShareUrl('');
      setToggles({
        showArticleInfo: true,
        showRelatedResources: true,
        showShare: true,
        showRelatedStories: true,
      });
      setStatus('Draft');
    }
    setError('');
    setOpenSections(initialSections);
    updateNewsArticle.reset();
    createNewsArticle.reset();
  }, [article, isOpen]);

  const mutation = article ? updateNewsArticle : createNewsArticle;
  const isPending = mutation.isPending || upload.isPending;

  async function handleCoverFile(file: File) {
    setError('');
    try {
      const res = await upload.mutateAsync(file);
      setCoverImage(res.url);
    } catch (uploadError) {
      setError(`Cover upload failed: ${getErrorMessage(uploadError)}`);
    }
  }

  function handleSubmit() {
    if (!articleTitle.trim()) {
      setError('Article Title is required.');
      return;
    }
    const payload: Record<string, unknown> = {
      articleTitle: articleTitle.trim(),
      articleTitleAr: articleTitleAr.trim(),
      category,
      source,
      language,
      content,
      contentAr,
      coverImage,
      author,
      authorAr,
      editorialTeam,
      organization,
      organizationAr,
      moc,
      city,
      cityAr,
      emirate,
      publishedDate: publishedDate || null,
      updatedDate: updatedDate || null,
      resources: resources.filter((r) => r.title || r.titleAr || r.url || r.type),
      shareUrl,
      ...Object.fromEntries(TOGGLE_KEYS.map((k) => [k, Boolean(toggles[k])])),
      status,
    };
    if (article) {
      updateNewsArticle.mutate(
        { id: article.id, payload: payload as Partial<NewsArticle> },
        { onSuccess: () => onClose() },
      );
    } else {
      createNewsArticle.mutate(payload as Partial<NewsArticle>, { onSuccess: () => onClose() });
    }
  }

  useEffect(() => {
    if (mutation.isError) {
      setError(getErrorMessage(mutation.error));
    }
  }, [mutation.isError, mutation.error]);

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    if (!article) return;
    const fresh = await getNewsArticle(article.id);
    setArticleTitleAr(fresh.articleTitleAr || '');
    setContentAr(fresh.contentAr || '');
    setAuthorAr(fresh.authorAr || '');
    setOrganizationAr(fresh.organizationAr || '');
    setCityAr(fresh.cityAr || '');
    setMachineFlags({
      articleTitleAr: getIsMachineFlag(fresh, 'articleTitleAr'),
      contentAr: getIsMachineFlag(fresh, 'contentAr'),
      authorAr: getIsMachineFlag(fresh, 'authorAr'),
      organizationAr: getIsMachineFlag(fresh, 'organizationAr'),
      cityAr: getIsMachineFlag(fresh, 'cityAr'),
    });
    const failed = new Set<string>();
    if ((fresh.articleTitle || '').trim() && !(fresh.articleTitleAr || '').trim()) failed.add('articleTitleAr');
    if ((fresh.content || '').trim() && !(fresh.contentAr || '').trim()) failed.add('contentAr');
    if ((fresh.author || '').trim() && !(fresh.authorAr || '').trim()) failed.add('authorAr');
    if ((fresh.organization || '').trim() && !(fresh.organizationAr || '').trim()) failed.add('organizationAr');
    if ((fresh.city || '').trim() && !(fresh.cityAr || '').trim()) failed.add('cityAr');
    setFailedFields(failed);
  }, [article]);

  const translationStates: TranslationState[] = [
    getTranslationState(articleTitle, articleTitleAr, machineFlags.articleTitleAr, failedFields.has('articleTitleAr')),
    getTranslationState(content, contentAr, machineFlags.contentAr, failedFields.has('contentAr')),
    getTranslationState(author, authorAr, machineFlags.authorAr, failedFields.has('authorAr')),
    getTranslationState(organization, organizationAr, machineFlags.organizationAr, failedFields.has('organizationAr')),
    getTranslationState(city, cityAr, machineFlags.cityAr, failedFields.has('cityAr')),
  ];

  const hiddenCount = countHidden(NEWS_VISIBILITY_GROUPS, toggles);

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={isPending}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
        {article ? 'Update' : 'Publish'}
      </Button>
    </div>
  );

  return (
    <TranslationProvider model="news" id={article?.id} onTranslated={reloadTranslations}>
    <Modal isOpen={isOpen} onClose={onClose} title={article ? 'Edit News Article' : 'Add News Article'} footer={footer}>
      <div className="flex flex-col gap-8">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        <TranslationToolbar states={translationStates} title={articleTitle || undefined} />

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Article Title" required placeholder="Enter article title" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} />
          </div>
          <div className="flex-1">
            <ArabicField
              label="Article Title (Arabic)"
              placeholder="عنوان المقال"
              englishValue={articleTitle}
              value={articleTitleAr}
              onChange={setArticleTitleAr}
              isMachine={machineFlags.articleTitleAr}
              failed={failedFields.has('articleTitleAr')}
            />
          </div>
        </div>

        <CollapsibleSection
          title="Media & URLs"
          hint="Cover image and links"
          isOpen={openSections.media}
          onToggle={() => toggleSection('media')}
        >
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="flex flex-col gap-[26px]">
                <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
                  Cover Image
                </label>
                <FileUpload
                  value={coverImage}
                  onUpload={handleCoverFile}
                  isUploading={upload.isPending}
                  label="Upload Cover Image"
                />
              </div>
            </div>
            <div className="flex-1">
              <Input label="Share URL" placeholder="https://..." value={shareUrl} onChange={(e) => setShareUrl(e.target.value)} />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Content Details"
          hint="Article information"
          isOpen={openSections.content}
          onToggle={() => toggleSection('content')}
        >
          <div className="flex gap-8">
            <div className="flex-1">
              <Select label="Category" options={NEWS_CATEGORY_OPTIONS} placeholder="Select category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="flex-1">
              <Select label="Source" options={NEWS_SOURCE_OPTIONS} placeholder="Select source" value={source} onChange={(e) => setSource(e.target.value)} />
            </div>
          </div>

          <div className="flex-1">
            <Select label="Language" options={LANGUAGE_OPTIONS} value={language} onChange={(e) => setLanguage(e.target.value)} />
          </div>
          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Author" placeholder="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="flex-1">
              <ArabicField
                label="Author (Arabic)"
                placeholder="اسم المؤلف"
                englishValue={author}
                value={authorAr}
                onChange={setAuthorAr}
                isMachine={machineFlags.authorAr}
                failed={failedFields.has('authorAr')}
              />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Editorial Team" placeholder="Editorial team name" value={editorialTeam} onChange={(e) => setEditorialTeam(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="MoC" placeholder="Ministry of Culture" value={moc} onChange={(e) => setMoc(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="Organization" placeholder="Organization name" value={organization} onChange={(e) => setOrganization(e.target.value)} />
            </div>
            <div className="flex-1">
              <ArabicField
                label="Organization (Arabic)"
                placeholder="اسم المؤسسة"
                englishValue={organization}
                value={organizationAr}
                onChange={setOrganizationAr}
                isMachine={machineFlags.organizationAr}
                failed={failedFields.has('organizationAr')}
              />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input label="City" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="flex-1">
              <ArabicField
                label="City (Arabic)"
                placeholder="المدينة"
                englishValue={city}
                value={cityAr}
                onChange={setCityAr}
                isMachine={machineFlags.cityAr}
                failed={failedFields.has('cityAr')}
              />
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Select label="Emirate" options={EMIRATES_OPTIONS} placeholder="Select emirate" value={emirate} onChange={(e) => setEmirate(e.target.value)} />
            </div>
            <div className="flex-1">
              <StatusField value={status} onChange={setStatus} />
            </div>
          </div>

          <div>
            <Textarea
              label="Content"
              required
              placeholder="Enter article content (English). If Arabic left blank, it will auto-translate on the user panel."
              rows={6}
              className="h-[180px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div>
            <ArabicField
              label="Content (Arabic)"
              placeholder="محتوى المقال (اختياري — سيتم الترجمة تلقائياً إن ترك فارغاً)"
              multiline
              rows={6}
              englishValue={content}
              value={contentAr}
              onChange={setContentAr}
              isMachine={machineFlags.contentAr}
              failed={failedFields.has('contentAr')}
            />
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <Input
                label="Published Date (auto)"
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                disabled
              />
            </div>
            <div className="flex-1">
              <Input
                label="Updated Date (auto)"
                type="date"
                value={updatedDate}
                onChange={(e) => setUpdatedDate(e.target.value)}
                disabled
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Resources & References"
          hint={`${resources.filter((r) => r.title || r.titleAr || r.url || r.type).length} resources`}
          isOpen={openSections.resources}
          onToggle={() => toggleSection('resources')}
        >
          <div className="flex flex-col gap-3">
            {resources.map((resource, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-lg border border-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Title"
                    value={resource.title || ''}
                    onChange={(e) => setResources(updateResource(i, 'title', e.target.value))}
                  />
                  <Input
                    placeholder="URL"
                    value={resource.url || ''}
                    onChange={(e) => setResources(updateResource(i, 'url', e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() => setResources(resources.filter((_, idx) => idx !== i))}
                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-danger hover:bg-[#FDECEA] transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <ArabicField
                  label="Title (Arabic)"
                  statusOnly
                  placeholder="عنوان المورد"
                  englishValue={resource.title || ''}
                  value={resource.titleAr || ''}
                  onChange={(v) => setResources(updateResource(i, 'titleAr', v))}
                />
              </div>
            ))}
            <div>
              <Button variant="ghost" size="sm" onClick={() => setResources([...resources, { title: '', titleAr: '', url: '', type: '' }])}>
                <Plus size={16} />
                Add Resource
              </Button>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Display Options"
          hint={hiddenCount > 0 ? `${hiddenCount} of ${TOGGLE_KEYS.length} sections hidden` : 'All sections visible'}
          isOpen={openSections.display}
          onToggle={() => toggleSection('display')}
        >
          <VisibilityGroups
            groups={NEWS_VISIBILITY_GROUPS}
            toggles={toggles}
            onChange={(key, checked) => setToggles({ ...toggles, [key]: checked })}
            intro="Each group below controls one section of the public article page, in the order it appears. Hiding a section removes it for visitors — the article and its content are not affected."
          />
        </CollapsibleSection>
      </div>
    </Modal>
    </TranslationProvider>
  );
}

function updateResource(index: number, field: keyof NewsResource, value: string) {
  return (prev: NewsResource[]) => {
    const next = prev.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    return next;
  };
}

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
      {value && (
        <p className="text-xs text-primary break-all font-[family-name:var(--font-poppins)]">
          {value.split('/').pop() || value}
        </p>
      )}
    </div>
  );
}