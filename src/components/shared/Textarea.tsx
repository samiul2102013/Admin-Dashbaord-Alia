import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export default function Textarea({
  label,
  required,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
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
      <textarea
        id={inputId}
        className={cn(
          'w-full px-[10px] py-[10px] rounded-[10px] border bg-surface outline-none transition-colors resize-none font-[family-name:var(--font-poppins)] text-sm',
          error ? 'border-danger' : 'border-secondary/80 focus:border-primary',
          className,
        )}
        {...props}
      />
      {error && (
        <span className="text-danger text-xs mt-1 font-[family-name:var(--font-poppins)]">
          {error}
        </span>
      )}
    </div>
  );
}
