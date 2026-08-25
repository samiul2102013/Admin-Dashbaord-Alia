import NewsTable from '@/components/news/NewsTable';

export default function NewsPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        News Management
      </h3>
      <NewsTable />
    </div>
  );
}
