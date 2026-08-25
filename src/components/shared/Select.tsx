import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export default function Select({
  label,
  required,
  error,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-[26px]">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full h-12 px-[10px] py-[10px] rounded-[10px] border bg-surface outline-none transition-colors font-[family-name:var(--font-poppins)] text-sm appearance-none',
          error ? 'border-danger' : 'border-secondary/80 focus:border-primary',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-danger text-xs mt-1 font-[family-name:var(--font-poppins)]">
          {error}
        </span>
      )}
    </div>
  );
}