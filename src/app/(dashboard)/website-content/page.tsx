import WebsiteContentPanel from '@/components/website-content/WebsiteContentPanel';

export default function WebsiteContentPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Website Content
      </h3>
      <WebsiteContentPanel />
    </div>
  );
}
