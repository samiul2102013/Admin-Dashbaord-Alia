'use client';

import { useState } from 'react';
import { Search, Plus, Star, StarOff } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import Button from '@/components/shared/Button';
import Pagination from '@/components/shared/Pagination';
import Select from '@/components/shared/Select';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import InitiativesModal from './InitiativesModal';
import { STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { useDeleteInitiative, useInitiatives, useUpdateInitiative } from '@/hooks/useInitiatives';
import type { Column } from '@/components/shared/DataTable';
import type { Initiative } from '@/types/initiatives';

const columns: Column<Initiative>[] = [
  {
    header: 'Cover',
    accessor: (row) =>
      row.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.coverImage}
          alt={row.title || 'Cover'}
          className="h-[54px] w-[96px] rounded-md object-cover bg-secondary/20"
        />
      ) : (
        <div className="flex h-[54px] w-[96px] items-center justify-center rounded-md bg-secondary/20">
          <span className="text-[10px] text-text-secondary font-[family-name:var(--font-poppins)]">No cover</span>
        </div>
      ),
  },
  {
    header: 'Title',
    accessor: 'title',
    className: 'font-semibold text-black max-w-[250px] truncate',
  },
  {
    header: 'Featured',
    accessor: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          row.isFeatured
            ? 'bg-[#ECFDF3] text-[#027A48]'
            : 'bg-secondary/15 text-text-secondary'
        }`}
      >
        {row.isFeatured ? 'Featured' : 'Regular'}
      </span>
    ),
    className: 'whitespace-nowrap',
  },
  { header: 'Category', accessor: 'category' },
  { header: 'Emirates', accessor: 'emirates' },
  { header: 'Start Date', accessor: 'startDate' },
  { header: 'End Date', accessor: 'endDate' },
  { header: 'Status', accessor: 'status' },
];

const ITEMS_PER_PAGE = 10;

export default function InitiativesTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Initiative | null>(null);

  const deleteInitiative = useDeleteInitiative();
  const updateInitiative = useUpdateInitiative();

  const { data, isLoading, isError, error } = useInitiatives({
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
    search: search || undefined,
    status: status || undefined,
  });

  function handleToggleFeatured(row: Initiative) {
    updateInitiative.mutate(
      { id: row.id, payload: { isFeatured: !row.isFeatured } },
      { onSuccess: () => undefined },
    );
  }

  function handleEdit(initiative: Initiative) {
    setEditingInitiative(initiative);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditingInitiative(null);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingInitiative(null);
  }

  function handleConfirmDelete() {
    if (deleteTarget) {
      deleteInitiative.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  }

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              placeholder="Search initiatives..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-9 pr-4 rounded-[10px] border border-secondary/40 bg-surface text-sm outline-none focus:border-primary transition-colors font-[family-name:var(--font-poppins)]"
            />
          </div>
          <div className="w-44">
            <Select
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus size={18} />
          Add New Initiative
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
          onAction={handleToggleFeatured}
          actionIcon={
            <StarOff size={16} className="text-danger" />
          }
          actionTooltip="Show on the website (featured)"
        />
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-end sticky bottom-0 bg-[#F9FAFB] py-2">
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <InitiativesModal isOpen={modalOpen} onClose={handleClose} initiative={editingInitiative} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete initiative"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : undefined
        }
        isLoading={deleteInitiative.isPending}
      />
    </div>
  );
}
