import ShortsTable from '@/components/shorts/ShortsTable';

export default function ShortsPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Shorts Management
      </h3>
      <ShortsTable />
    </div>
  );
}
