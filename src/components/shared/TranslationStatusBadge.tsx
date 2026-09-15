'use client';

import { TRANSLATION_STATE_META, type TranslationState } from '@/lib/translation';
import { cn } from '@/lib/utils';

interface TranslationStatusBadgeProps {
  state: TranslationState;
  /** Shorter label without the "Arabic:" prefix. */
  compact?: boolean;
  className?: string;
}

export default function TranslationStatusBadge({
  state,
  compact = true,
  className,
}: TranslationStatusBadgeProps) {
  const meta = TRANSLATION_STATE_META[state];
  return (
    <span
      title={meta.description}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold font-[family-name:var(--font-poppins)]',
        meta.badge,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {compact ? meta.label : `Arabic: ${meta.label}`}
    </span>
  );
}
