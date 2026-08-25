'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import Button from '@/components/shared/Button';
import Pagination from '@/components/shared/Pagination';
import Select from '@/components/shared/Select';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ConsultationsModal from './ConsultationsModal';
import { STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { useDeleteConsultation, useConsultations } from '@/hooks/useConsultations';
import type { Column } from '@/components/shared/DataTable';
import type { Consultation } from '@/types/consultations';

const columns: Column<Consultation>[] = [
  {
    header: 'Session Title',
    accessor: 'sessionTitle',
    className: 'font-semibold text-black max-w-[250px] truncate',
  },
  { header: 'Session Type', accessor: 'sessionType' },
  { header: 'Emirates', accessor: 'emirates' },
  { header: 'Date', accessor: 'date' },
  { header: 'Status', accessor: 'status' },
];

const ITEMS_PER_PAGE = 10;

export default function ConsultationsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Consultation | null>(null);

  const deleteConsultation = useDeleteConsultation();

  const { data, isLoading, isError, error } = useConsultations({
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
    search: search || undefined,
    status: status || undefined,
  });

  function handleEdit(consultation: Consultation) {
    setEditingConsultation(consultation);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditingConsultation(null);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingConsultation(null);
  }

  function handleConfirmDelete() {
    if (deleteTarget) {
      deleteConsultation.mutate(deleteTarget.id, {
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
              placeholder="Search sessions..."
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
          Add New Session
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
          <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <ConsultationsModal isOpen={modalOpen} onClose={handleClose} consultation={editingConsultation} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete consultation"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.sessionTitle}"? This action cannot be undone.`
            : undefined
        }
        isLoading={deleteConsultation.isPending}
      />
    </div>
  );
}