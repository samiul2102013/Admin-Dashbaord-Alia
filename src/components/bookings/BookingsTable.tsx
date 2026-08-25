'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import Select from '@/components/shared/Select';
import BookingModal from './BookingModal';
import { BOOKING_STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { useBookings } from '@/hooks/useBookings';
import type { Column } from '@/components/shared/DataTable';
import type { Booking } from '@/types/booking';

function formatAmount(booking: Booking): string {
  const value = Number(booking.amount || 0);
  if (booking.paymentSuccess && Number(booking.amount) === 0) return 'Free';
  return `AED ${value.toFixed(2)}`;
}

const columns: Column<Booking>[] = [
  {
    header: 'Reference',
    accessor: 'reference',
    className: 'font-semibold text-black whitespace-nowrap',
  },
  {
    header: 'Session',
    accessor: (row) => (
      <span className="block max-w-[240px] truncate text-black">
        {row.sessionSnapshot?.sessionTitle || row.consultationId || '-'}
      </span>
    ),
  },
  {
    header: 'Attendee',
    accessor: (row) => (
      <span className="block max-w-[200px] truncate">
        <span className="block font-medium text-black">{row.fullName}</span>
        <span className="block text-text-secondary">{row.contactNumber || row.email}</span>
      </span>
    ),
  },
  {
    header: 'Session Date',
    accessor: (row) => row.sessionDate || row.sessionSnapshot?.date || '-',
  },
  { header: 'Seats', accessor: 'seats' },
  { header: 'Amount', accessor: formatAmount },
  {
    header: 'Payment',
    accessor: (row) => (
      <span className={row.paymentSuccess ? 'text-success' : 'text-gold'}>
        {row.paymentSuccess ? 'Paid' : 'Unpaid'}
      </span>
    ),
  },
  { header: 'Status', accessor: 'status' },
];

const ITEMS_PER_PAGE = 10;

export default function BookingsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const { data, isLoading, isError, error } = useBookings({
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
    search: search || undefined,
    status: status || undefined,
  });

  function handleView(booking: Booking) {
    setActiveBooking(booking);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setActiveBooking(null);
  }

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              placeholder="Search name, email, phone, reference..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-9 pr-4 rounded-[10px] border border-secondary/40 bg-surface text-sm outline-none focus:border-primary transition-colors font-[family-name:var(--font-poppins)]"
            />
          </div>
          <div className="w-44">
            <Select
              placeholder="All statuses"
              options={BOOKING_STATUS_OPTIONS}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
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
          statusKey="status"
          onEdit={handleView}
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

      <BookingModal isOpen={modalOpen} onClose={handleClose} booking={activeBooking} />
    </div>
  );
}
