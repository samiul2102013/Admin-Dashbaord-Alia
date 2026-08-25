import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  Published: 'bg-success/10 text-success',
  Draft: 'bg-warning/10 text-warning',
  Pending: 'bg-gold/10 text-gold',
  confirmed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  pending_payment: 'bg-gold/10 text-gold',
  Confirmed: 'bg-success/10 text-success',
  Cancelled: 'bg-danger/10 text-danger',
  'Pending Payment': 'bg-gold/10 text-gold',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  pending_payment: 'Pending Payment',
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = statusLabels[status] || status;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold font-[family-name:var(--font-poppins)]',
        statusStyles[label] || statusStyles[status] || 'bg-gray-100 text-gray-600',
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
