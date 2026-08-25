'use client';

import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import Button from '@/components/shared/Button';
import Pagination from '@/components/shared/Pagination';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Select from '@/components/shared/Select';
import NewsModal from './NewsModal';
import { useDeleteNewsArticle, useNewsArticles } from '@/hooks/useNewsArticles';
import { STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import type { Column } from '@/components/shared/DataTable';
import type { NewsArticle } from '@/types/news';

const ITEMS_PER_PAGE = 10;

const columns: Column<NewsArticle>[] = [
  {
    header: 'Cover',
    accessor: (row) =>
      row.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.coverImage}
          alt={row.articleTitle || 'Cover'}
          className="h-[54px] w-[96px] rounded-md object-cover bg-secondary/20"
        />
      ) : (
        <div className="flex h-[54px] w-[96px] items-center justify-center rounded-md bg-secondary/20">
          <span className="text-[10px] text-text-secondary font-[family-name:var(--font-poppins)]">No cover</span>
        </div>
      ),
  },
  {
    header: 'Article Title',
    accessor: 'articleTitle',
    className: 'font-semibold text-black max-w-[280px] truncate',
  },
  { header: 'Category', accessor: 'category' },
  { header: 'Language', accessor: 'language' },
  { header: 'Source', accessor: 'source' },
  {
    header: 'Published',
    accessor: (row) => row.publishedDate || '—',
    className: 'whitespace-nowrap',
  },
  { header: 'Status', accessor: 'status' },
];

export default function NewsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);

  const { data, isLoading, isError, error } = useNewsArticles({
    page,
    perPage: ITEMS_PER_PAGE,
    search: search || undefined,
    status: status || undefined,
  });

  const deleteNewsArticle = useDeleteNewsArticle();

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingArticle(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingArticle(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteNewsArticle.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-[10px] border border-secondary/40 bg-surface text-sm outline-none focus:border-primary transition-colors font-[family-name:var(--font-poppins)]"
            />
          </div>
          <div className="w-44">
            <Select
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus size={18} />
          Add New Article
        </Button>
      </div>

      {isError && error && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">
          {getErrorMessage(error)}
        </p>
      )}

      <div className="flex-1 overflow-auto">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={(row) => setDeleteTarget(row)}
        />
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-end sticky bottom-0 bg-[#F9FAFB] py-2">
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <NewsModal isOpen={modalOpen} onClose={handleClose} article={editingArticle} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete article"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.articleTitle}"? This action cannot be undone.`
            : undefined
        }
        isLoading={deleteNewsArticle.isPending}
      />
    </div>
  );
}