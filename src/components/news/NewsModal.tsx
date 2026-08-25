'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Select from '@/components/shared/Select';
import Button from '@/components/shared/Button';
import {
  EMIRATES_OPTIONS,
  LANGUAGE_OPTIONS,
  NEWS_CATEGORY_OPTIONS,
  NEWS_SOURCE_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/constants';
import { useCreateNewsArticle, useUpdateNewsArticle } from '@/hooks/useNewsArticles';
import { useUpload } from '@/hooks/useMeta';
import { getErrorMessage } from '@/lib/api-client';
import type { NewsArticle } from '@/types/news';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: NewsArticle | null;
}

interface NewsResource {
  title?: string;
  url?: string;
  type?: string;
}

const emptyResources: NewsResource[] = [{ title: '', url: '', type: '' }];

const TOGGLE_KEYS = [
  'showArticleInfo',
  'showRelatedResources',
  'showShare',
  'showRelatedStories',
] as const;

const TOGGLE_LABELS: Record<(typeof TOGGLE_KEYS)[number], string> = {
  showArticleInfo: 'Show Article Info',
  showRelatedResources: 'Show Related Resources',
  showShare: 'Show Share',
  showRelatedStories: 'Show Related Stories',
};

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
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('');
  const [editorialTeam, setEditorialTeam] = useState('');
  const [organization, setOrganization] = useState('');
  const [moc, setMoc] = useState('');
  const [city, setCity] = useState('');
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

  useEffect(() => {
    if (article) {
      setArticleTitle(article.articleTitle || '');
      setArticleTitleAr(article.articleTitleAr || '');
      setCategory(article.category || '');
      setSource(article.source || '');
      setLanguage(article.language || 'en');
      setContent(article.content || '');
      setCoverImage(article.coverImage || '');
      setAuthor(article.author || '');
      setEditorialTeam(article.editorialTeam || '');
      setOrganization(article.organization || '');
      setMoc(article.moc || '');
      setCity(article.city || '');
      setEmirate(article.emirate || '');
      setPublishedDate(article.publishedDate || '');
      setUpdatedDate(article.updatedDate || '');
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
      setCoverImage('');
      setAuthor('');
      setEditorialTeam('');
      setOrganization('');
      setMoc('');
      setCity('');
      setEmirate('');
      setPublishedDate('');
      setUpdatedDate('');
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
      coverImage,
      author,
      editorialTeam,
      organization,
      moc,
      city,
      emirate,
      publishedDate: publishedDate || null,
      updatedDate: updatedDate || null,
      resources: resources.filter((r) => r.title || r.url || r.type),
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
    <Modal isOpen={isOpen} onClose={onClose} title={article ? 'Edit News Article' : 'Add News Article'} footer={footer}>
      <div className="flex flex-col gap-8">
        {error && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
        )}

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Article Title" required placeholder="Enter article title" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Article Title (Arabic)" placeholder="عنوان المقال" value={articleTitleAr} onChange={(e) => setArticleTitleAr(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Select label="Category" options={NEWS_CATEGORY_OPTIONS} placeholder="Select category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="flex-1">
            <Select label="Source" options={NEWS_SOURCE_OPTIONS} placeholder="Select source" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Select label="Language" options={LANGUAGE_OPTIONS} value={language} onChange={(e) => setLanguage(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Author" placeholder="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Editorial Team" placeholder="Editorial team name" value={editorialTeam} onChange={(e) => setEditorialTeam(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Organization" placeholder="Organization name" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="MoC" placeholder="Ministry of Culture" value={moc} onChange={(e) => setMoc(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="City" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Select label="Emirate" options={EMIRATES_OPTIONS} placeholder="Select emirate" value={emirate} onChange={(e) => setEmirate(e.target.value)} />
          </div>
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
        </div>

        <div>
          <Textarea
            label="Content"
            required
            placeholder="Enter article content"
            rows={6}
            className="h-[180px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Published Date" type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Updated Date" type="date" value={updatedDate} onChange={(e) => setUpdatedDate(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Share URL" placeholder="https://..." value={shareUrl} onChange={(e) => setShareUrl(e.target.value)} />
          </div>
          <div className="flex-1">
            <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
            Resources
          </label>
          <div className="flex flex-col gap-3">
            {resources.map((resource, i) => (
              <div key={i} className="flex items-center gap-3">
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
            ))}
            <div>
              <Button variant="ghost" size="sm" onClick={() => setResources([...resources, { title: '', url: '', type: '' }])}>
                <Plus size={16} />
                Add Resource
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
            Display Options
          </label>
          <div className="grid grid-cols-2 gap-4">
            {TOGGLE_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(toggles[key])}
                  onChange={(e) => setToggles({ ...toggles, [key]: e.target.checked })}
                  className="w-4 h-4 accent-[#781E36]"
                />
                <span className="text-sm font-medium text-text-primary font-[family-name:var(--font-poppins)]">
                  {TOGGLE_LABELS[key]}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
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