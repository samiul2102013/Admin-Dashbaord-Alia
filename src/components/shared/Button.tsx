import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40',
  secondary:
    'bg-white text-primary border border-primary hover:bg-primary/5',
  ghost:
    'bg-transparent text-text-secondary hover:bg-black/5',
};

const sizes = {
  sm: 'px-4 py-2 text-sm h-[36px] gap-2',
  md: 'px-[10px] py-[10px] text-base h-[40px] gap-[10px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-[10px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none font-[family-name:var(--font-poppins)]',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}