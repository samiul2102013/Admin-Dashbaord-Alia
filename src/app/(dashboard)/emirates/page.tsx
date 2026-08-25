import EmiratesTable from '@/components/emirates/EmiratesTable';

export default function EmiratesPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Emirates
      </h3>
      <EmiratesTable />
    </div>
  );
}
