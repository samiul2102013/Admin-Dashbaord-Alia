'use client';

import { useState } from 'react';
import { Languages, Loader2, RotateCcw, ShieldAlert, TriangleAlert } from 'lucide-react';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Button from '@/components/shared/Button';
import { useTranslation } from '@/components/shared/TranslationProvider';
import { summarizeTranslationStates, type TranslationState } from '@/lib/translation';

interface TranslationToolbarProps {
  /** One state per translatable Arabic field shown on this screen. */
  states: TranslationState[];
  /** Optional label for the record being translated. */
  title?: string;
}

/**
 * Record-level translation actions. Safe actions only touch blank or
 * machine-generated Arabic; the destructive action is gated behind an explicit
 * confirmation that calls out the human-reviewed content it will replace.
 */
export default function TranslationToolbar({ states, title }: TranslationToolbarProps) {
  const {
    enabled,
    pending,
    error,
    clearError,
    translateMissing,
    retranslateMachine,
    forceRetranslateAll,
  } = useTranslation();
  const [confirmForce, setConfirmForce] = useState(false);
  const summary = summarizeTranslationStates(states);
  const canSafeFill = summary.missing > 0 || summary.failed > 0;
  const canRetranslateMachine = summary.machine > 0;

  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-secondary/30 bg-surface p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-bold text-black font-[family-name:var(--font-poppins)]">
            <Languages size={15} className="text-primary" />
            Arabic translation{title ? ` — ${title}` : ''}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Chip tone="human" label={`Human ${summary.human}`} />
            <Chip tone="machine" label={`Machine ${summary.machine}`} />
            <Chip tone="missing" label={`Missing ${summary.missing}`} />
            <Chip tone="failed" label={`Failed ${summary.failed}`} />
          </div>
        </div>
        <span className="text-xs text-text-secondary font-[family-name:var(--font-poppins)]">
          {enabled
            ? 'Translate blank Arabic or regenerate machine Arabic. Human-reviewed Arabic is never changed unless you explicitly force it.'
            : 'Save this item first to enable translation.'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={translateMissing}
          disabled={!enabled || pending || !canSafeFill}
          title="Fill only the blank Arabic fields. Safe: never replaces existing Arabic."
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
          Translate missing Arabic
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={retranslateMachine}
          disabled={!enabled || pending || !canRetranslateMachine}
          title="Regenerate machine-generated Arabic only. Safe: human Arabic is untouched."
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Retranslate machine Arabic
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setConfirmForce(true)}
          disabled={!enabled || pending}
          className="!border-danger/40 !text-danger hover:!bg-danger/5"
          title="Dangerous: also overwrites human-reviewed Arabic. Asks for confirmation first."
        >
          <ShieldAlert size={14} />
          Force retranslate…
        </Button>
      </div>

      {error && (
        <p className="flex items-start gap-2 text-xs text-danger font-[family-name:var(--font-poppins)]">
          <TriangleAlert size={13} className="mt-0.5 shrink-0" />
          <span>
            {error}{' '}
            <button
              type="button"
              onClick={clearError}
              className="underline cursor-pointer"
            >
              dismiss
            </button>
          </span>
        </p>
      )}

      <ConfirmDialog
        isOpen={confirmForce}
        onClose={() => setConfirmForce(false)}
        onConfirm={() => {
          setConfirmForce(false);
          forceRetranslateAll();
        }}
        title="Force retranslate all Arabic?"
        message="This replaces machine-translated Arabic AND human-written/reviewed Arabic on this item with fresh machine output. It cannot be silently undone. Only continue if you intend to discard the existing human Arabic."
        confirmLabel="Force retranslate"
        cancelLabel="Cancel"
        isLoading={pending}
      />
    </div>
  );
}

function Chip({ tone, label }: { tone: TranslationState; label: string }) {
  const styles: Record<TranslationState, string> = {
    human: 'bg-success/10 text-success',
    machine: 'bg-gold/10 text-gold',
    missing: 'bg-secondary/20 text-text-secondary',
    failed: 'bg-danger/10 text-danger',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold font-[family-name:var(--font-poppins)] ${styles[tone]}`}
    >
      {label}
    </span>
  );
}
