'use client';

import { CircleCheck, CircleDashed } from 'lucide-react';
import Select, { type SelectOption } from '@/components/shared/Select';
import { STATUS_OPTIONS } from '@/lib/constants';

interface StatusFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** Override the options (defaults to the shared Published/Draft/Pending list). */
  options?: SelectOption[];
}

const STATUS_HINTS: Record<string, { text: string; publicVisible: boolean }> = {
  Published: { text: 'Published — available publicly on the website.', publicVisible: true },
  Draft: { text: 'Draft — not available on the public site.', publicVisible: false },
  Pending: { text: 'Pending — not available on the public site.', publicVisible: false },
};

/**
 * Status picker that spells out the real public-visibility consequence:
 * only "Published" reaches the public site; Draft and Pending never do.
 */
export default function StatusField({
  label = 'Status',
  value,
  onChange,
  required = false,
  options = STATUS_OPTIONS,
}: StatusFieldProps) {
  const hint = STATUS_HINTS[value] ?? {
    text: 'Unknown status — public visibility is not guaranteed.',
    publicVisible: false,
  };
  return (
    <div className="flex flex-col gap-2">
      <Select
        label={label}
        required={required}
        options={options}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p
        className={`flex items-center gap-1.5 text-xs font-[family-name:var(--font-poppins)] ${
          hint.publicVisible ? 'text-success' : 'text-text-secondary'
        }`}
      >
        {hint.publicVisible ? <CircleCheck size={13} /> : <CircleDashed size={13} />}
        {hint.text}
      </p>
    </div>
  );
}
