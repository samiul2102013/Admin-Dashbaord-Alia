import ContactContentPanel from '@/components/contact/ContactContentPanel';

export default function ContactContentPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Contact Content
      </h3>
      <ContactContentPanel />
    </div>
  );
}
