'use client';

import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import Button from '@/components/shared/Button';
import Pagination from '@/components/shared/Pagination';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Select from '@/components/shared/Select';
import ShortsModal from './ShortsModal';
import { useDeleteShort, useShorts } from '@/hooks/useShorts';
import { STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import type { Column } from '@/components/shared/DataTable';
import type { Short } from '@/types/shorts';

const ITEMS_PER_PAGE = 10;

const columns: Column<Short>[] = [
  {
    header: 'Cover',
    accessor: (row) =>
      row.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.coverImage}
          alt={row.videoTitle || 'Cover'}
          className="h-[54px] w-[96px] rounded-md object-cover bg-secondary/20"
        />
      ) : (
        <div className="flex h-[54px] w-[96px] items-center justify-center rounded-md bg-secondary/20">
          <span className="text-[10px] text-text-secondary font-[family-name:var(--font-poppins)]">No cover</span>
        </div>
      ),
  },
  {
    header: 'Video Title',
    accessor: 'videoTitle',
    className: 'font-semibold text-black',
  },
  { header: 'Category', accessor: 'category' },
  { header: 'Language', accessor: 'language' },
  { header: 'Duration', accessor: 'duration' },
  {
    header: 'Views',
    accessor: (row) => String(row.views ?? 0),
    className: 'text-right',
  },
  { header: 'Status', accessor: 'status' },
];

export default function ShortsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShort, setEditingShort] = useState<Short | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Short | null>(null);

  const { data, isLoading, isError, error } = useShorts({
    page,
    perPage: ITEMS_PER_PAGE,
    search: search || undefined,
    status: status || undefined,
  });

  const deleteShort = useDeleteShort();

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const handleEdit = (short: Short) => {
    setEditingShort(short);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingShort(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingShort(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteShort.mutate(deleteTarget.id, {
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
              placeholder="Search videos..."
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
          Add New Short
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

      <ShortsModal isOpen={modalOpen} onClose={handleClose} short={editingShort} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete video"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.videoTitle}"? This action cannot be undone.`
            : undefined
        }
        isLoading={deleteShort.isPending}
      />
    </div>
  );
}