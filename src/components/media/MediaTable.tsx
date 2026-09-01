'use client';

import { useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import Select from '@/components/shared/Select';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { getErrorMessage } from '@/lib/api-client';
import { useMediaItems, useDeleteMediaItem } from '@/hooks/useMedia';
import MediaModal from './MediaModal';
import type { Column } from '@/components/shared/DataTable';
import type { MediaItem } from '@/types/media';

const CATEGORY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Document', value: 'document' },
];

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'Published' },
  { label: 'Draft', value: 'Draft' },
];

const columns: Column<MediaItem>[] = [
  { header: 'Filename', accessor: 'filename', className: 'font-semibold text-navy max-w-[240px] truncate' },
  { header: 'Alt', accessor: 'alt', className: 'max-w-[200px] truncate' },
  { header: 'Category', accessor: (row) => <span className="capitalize">{row.category}</span>, className: 'max-w-[100px]' },
  { header: 'Size', accessor: (row) => row.fileSize > 0 ? `${(row.fileSize / 1024).toFixed(1)} KB` : '-', className: 'max-w-[80px]' },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.status} />, className: 'max-w-[100px]' },
];

export default function MediaTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const { data, isLoading, error } = useMediaItems({ page, perPage: 10, search, status, category });
  const deleteMutation = useDeleteMediaItem();

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-[220px]"
          />
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          />
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          />
        </div>
        <Button onClick={handleAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Media
        </Button>
      </div>

      {error && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">
          {getErrorMessage(error)}
        </p>
      )}

      <div className="flex-1 overflow-auto">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      </div>

      {data?.meta && (
        <Pagination
          currentPage={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}

      <MediaModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        item={editingItem}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Media Item"
        message={`Are you sure you want to delete "${deleteTarget?.filename}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
