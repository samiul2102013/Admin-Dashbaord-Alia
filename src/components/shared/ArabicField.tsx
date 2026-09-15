'use client';

import { Languages, Loader2, RotateCcw } from 'lucide-react';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import TranslationStatusBadge from '@/components/shared/TranslationStatusBadge';
import { useOptionalTranslation } from '@/components/shared/TranslationProvider';
import { getTranslationState, hasText } from '@/lib/translation';

interface ArabicFieldProps {
  label: string;
  /** English source value, used to derive the status and enable translation. */
  englishValue: string;
  value: string;
  onChange: (value: string) => void;
  /** Backend `<key>IsMachine` flag for this field. */
  isMachine?: boolean;
  /** True when a retranslation attempt in this session left the field blank. */
  failed?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  /**
   * Show the status but no retranslate action. Used for nested JSON values
   * (topics, FAQs, contributors) that the engine translates at read time and
   * therefore cannot report a machine flag for.
   */
  statusOnly?: boolean;
}

export default function ArabicField({
  label,
  englishValue,
  value,
  onChange,
  isMachine,
  failed,
  multiline = false,
  rows = 3,
  placeholder,
  required = false,
  statusOnly = false,
}: ArabicFieldProps) {
  const translation = useOptionalTranslation();
  const enabled = translation?.enabled ?? false;
  const pending = translation?.pending ?? false;
  const translateMissing = translation?.translateMissing ?? (() => {});
  const retranslateMachine = translation?.retranslateMachine ?? (() => {});
  const state = getTranslationState(englishValue, value, isMachine, failed);

  const showAction =
    !statusOnly && enabled && hasText(englishValue) && (state !== 'human' || !hasText(value));

  const action =
    state === 'machine'
      ? { label: 'Retranslate', run: retranslateMachine, icon: <RotateCcw size={13} /> }
      : state === 'failed'
        ? { label: 'Retry translation', run: translateMissing, icon: <RotateCcw size={13} /> }
        : { label: 'Translate missing Arabic', run: translateMissing, icon: <Languages size={13} /> };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </span>
        <TranslationStatusBadge state={state} />
      </div>

      {multiline ? (
        <Textarea
          label=""
          rows={rows}
          dir="rtl"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          label=""
          dir="rtl"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {showAction && (
        <button
          type="button"
          onClick={action.run}
          disabled={pending}
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 font-[family-name:var(--font-poppins)] cursor-pointer"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : action.icon}
          {pending ? 'Translating…' : action.label}
        </button>
      )}
    </div>
  );
}
