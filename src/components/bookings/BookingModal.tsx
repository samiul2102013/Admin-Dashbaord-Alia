'use client';

import { useState } from 'react';
import Modal from '@/components/shared/Modal';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import Select from '@/components/shared/Select';
import { BOOKING_STATUS_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api-client';
import { useUpdateBooking } from '@/hooks/useBookings';
import type { Booking, BookingStatusValue } from '@/types/booking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

function field(label: string, value: string | undefined, full = false) {
  return (
    <div className={`flex flex-col gap-2 ${full ? 'col-span-2' : ''}`}>
      <span className="text-[12px] font-semibold font-[family-name:var(--font-poppins)] text-text-secondary">
        {label}
      </span>
      <span className="text-sm text-black font-[family-name:var(--font-poppins)]">
        {value || '-'}
      </span>
    </div>
  );
}

function BookingForm({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const updateBooking = useUpdateBooking();
  const [status, setStatus] = useState<string>(booking.status || '');
  const [notes, setNotes] = useState(booking.notes || '');

  const session = booking.sessionSnapshot ?? {};
  const amount = Number(booking.amount || 0);
  const hasError = updateBooking.isError;

  function handleSubmit() {
    if (!status) return;
    const payload: Partial<Booking> = {
      status: status as BookingStatusValue,
      notes: notes.trim(),
    };
    updateBooking.mutate({ id: booking.id, payload }, { onSuccess: () => onClose() });
  }

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={updateBooking.isPending}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={updateBooking.isPending}>
        Save
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        {hasError && (
          <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">
            {getErrorMessage(updateBooking.error)}
          </p>
        )}

        <div className="rounded-xl border border-secondary/40 overflow-hidden">
          <div className="px-5 py-3 bg-primary/5 font-semibold text-navy text-[13px] font-[family-name:var(--font-poppins)]">
            Session Details
          </div>
          <div className="grid grid-cols-2 gap-5 p-5">
            {field('Session Title', session.sessionTitle, true)}
            {field('Session Type', session.sessionType)}
            {field('Format', session.meetingFormat)}
            {field('Session Date', session.date || booking.sessionDate)}
            {field('Start Time', session.startTime)}
            {field('End Time', session.endTime)}
            {field('Duration', session.duration)}
            {field('Time Zone', session.timeZone)}
            {field('Counselor', session.counselor)}
            {field('Location', session.location)}
          </div>
        </div>

        <div className="rounded-xl border border-secondary/40 overflow-hidden">
          <div className="px-5 py-3 bg-primary/5 font-semibold text-navy text-[13px] font-[family-name:var(--font-poppins)]">
            Attendee Details
          </div>
          <div className="grid grid-cols-2 gap-5 p-5">
            {field('Full Name', booking.fullName)}
            {field('Email', booking.email)}
            {field('Contact Number', booking.contactNumber)}
            {field('Type', booking.userType)}
            {field('Company / Organization', booking.companyOrOrganization)}
            {field('Seats', String(booking.seats))}
            {field('Reference', booking.reference)}
          </div>
        </div>

        <div className="rounded-xl border border-secondary/40 overflow-hidden">
          <div className="px-5 py-3 bg-primary/5 font-semibold text-navy text-[13px] font-[family-name:var(--font-poppins)]">
            Payment Details
          </div>
          <div className="grid grid-cols-2 gap-5 p-5">
            {field('Amount', amount > 0 ? `AED ${amount.toFixed(2)}` : 'Free')}
            {field('Payment Method', booking.paymentMethod)}
            {field('Payment Reference', booking.paymentReference)}
            {field('Payment Status', booking.paymentSuccess ? 'Paid' : 'Unpaid')}
          </div>
        </div>

        <div className="flex flex-col gap-[26px]">
          <span className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
            Update Status
          </span>
          <Select
            label="Status"
            options={BOOKING_STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>

        <Textarea
          label="Internal Notes"
          placeholder="Add or update internal notes for this booking"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mt-6 flex justify-end border-t border-border-soft/50 pt-4">
        {footer}
      </div>
    </>
  );
}

export default function BookingModal({ isOpen, onClose, booking }: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={booking ? `Booking ${booking.reference}` : 'Booking'}
      size="lg"
    >
      {booking && <BookingForm key={booking.id} booking={booking} onClose={onClose} />}
    </Modal>
  );
}
