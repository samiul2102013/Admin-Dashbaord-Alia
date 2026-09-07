import ContactContentEditor from '@/components/contact/ContactContentEditor';

export default function ContactContentPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Contact Content Management
      </h3>
      <ContactContentEditor />
    </div>
  );
}
