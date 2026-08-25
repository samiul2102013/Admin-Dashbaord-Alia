import CategoriesTable from '@/components/categories/CategoriesTable';

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-5 h-full">
      <h3 className="text-navy text-[14px] font-bold leading-[100%] font-[family-name:var(--font-manrope)] shrink-0">
        Initiative Category
      </h3>
      <CategoriesTable />
    </div>
  );
}
