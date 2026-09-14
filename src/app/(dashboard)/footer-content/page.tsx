import FooterContentPanel from '@/components/footer/FooterContentPanel';

export default function FooterContentPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Footer Content
      </h3>
      <FooterContentPanel />
    </div>
  );
}
