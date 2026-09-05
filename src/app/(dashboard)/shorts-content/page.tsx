import PageContentEditor from '@/components/shared/PageContentEditor';

export default function ShortsContentPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Shorts Content Management
      </h3>
      <PageContentEditor presentationKey="shorts" />
    </div>
  );
}
