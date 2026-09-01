import HomepageContentPanel from '@/components/homepage/HomepageContentPanel';

export default function HomepageContentPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Homepage Content
      </h3>
      <HomepageContentPanel />
    </div>
  );
}
