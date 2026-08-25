import BookingsTable from '@/components/bookings/BookingsTable';

export default function BookingsPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Booked Consultations
      </h3>
      <BookingsTable />
    </div>
  );
}
