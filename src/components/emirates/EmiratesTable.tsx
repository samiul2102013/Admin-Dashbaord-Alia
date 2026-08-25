'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import Button from '@/components/shared/Button';
import Pagination from '@/components/shared/Pagination';
import Select from '@/components/shared/Select';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmiratesModal from './EmiratesModal';
import { STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { useDeleteEmirate, useEmirates } from '@/hooks/useEmirates';
import type { Column } from '@/components/shared/DataTable';
import type { Emirates } from '@/types/emirates';

const columns: Column<Emirates>[] = [
  {
    header: 'Cover',
    accessor: (row) =>
      row.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.image}
          alt={row.emiratesName || 'Cover'}
          className="h-[54px] w-[96px] rounded-md object-cover bg-secondary/20"
        />
      ) : (
        <div className="flex h-[54px] w-[96px] items-center justify-center rounded-md bg-secondary/20">
          <span className="text-[10px] text-text-secondary font-[family-name:var(--font-poppins)]">No image</span>
        </div>
      ),
  },
  {
    header: 'Emirates Name',
    accessor: 'emiratesName',
    className: 'font-semibold text-black',
  },
  {
    header: 'Title',
    accessor: 'title',
    className: 'max-w-[200px] truncate text-text-secondary',
  },
  {
    header: 'Description',
    accessor: (row) => (
      <span className="block max-w-[320px] truncate text-text-secondary">
        {row.description}
      </span>
    ),
  },
  { header: 'Centers', accessor: 'centerCount' },
  { header: 'Status', accessor: 'status' },
];

const ITEMS_PER_PAGE = 10;

export default function EmiratesTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmirates, setEditingEmirates] = useState<Emirates | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Emirates | null>(null);

  const deleteEmirate = useDeleteEmirate();

  const { data, isLoading, isError, error } = useEmirates({
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
    search: search || undefined,
  });

  function handleEdit(emirates: Emirates) {
    setEditingEmirates(emirates);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditingEmirates(null);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingEmirates(null);
  }

  function handleConfirmDelete() {
    if (deleteTarget) {
      deleteEmirate.mutate(deleteTarget.id, {
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
              placeholder="Search emirates..."
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
          Add New Record
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
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <EmiratesModal isOpen={modalOpen} onClose={handleClose} emirates={editingEmirates} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete emirate"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.emiratesName}"? This action cannot be undone.`
            : undefined
        }
        isLoading={deleteEmirate.isPending}
      />
    </div>
  );
}