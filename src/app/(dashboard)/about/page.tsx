import AboutContentPanel from '@/components/about/AboutContentPanel';

export default function AboutContentPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        About Us Content
      </h3>
      <AboutContentPanel />
    </div>
  );
}
