/**
 * Shared helpers for the bilingual (English / Arabic) translation status UI.
 *
 * The backend exposes a read-only `<key>IsMachine` flag next to every Arabic
 * field of the admin payloads. `true` means the value was produced by the
 * machine translation engine; `false` means a human wrote/reviewed it (or the
 * field is blank). A retranslation attempt that leaves the Arabic blank marks
 * the field as failed for the current editing session only.
 */

export type TranslationState = 'human' | 'machine' | 'missing' | 'failed';

export interface TranslationStateMeta {
  label: string;
  description: string;
  /** Tailwind classes for the badge. */
  badge: string;
  /** Tailwind dot color. */
  dot: string;
}

export const TRANSLATION_STATE_META: Record<TranslationState, TranslationStateMeta> = {
  human: {
    label: 'Human',
    description: 'Human-written / reviewed Arabic. Never replaced automatically.',
    badge: 'bg-success/10 text-success border-success/20',
    dot: 'bg-success',
  },
  machine: {
    label: 'Machine',
    description: 'Machine-translated Arabic. Can be safely retranslated.',
    badge: 'bg-gold/10 text-gold border-gold/20',
    dot: 'bg-gold',
  },
  missing: {
    label: 'Missing',
    description: 'No Arabic yet. The public site may auto-translate this from English.',
    badge: 'bg-secondary/20 text-text-secondary border-secondary/30',
    dot: 'bg-text-secondary',
  },
  failed: {
    label: 'Failed',
    description: 'Translation was attempted but no Arabic was produced. You can retry.',
    badge: 'bg-danger/10 text-danger border-danger/20',
    dot: 'bg-danger',
  },
};

export function hasText(value: string | null | undefined): boolean {
  return Boolean((value ?? '').trim());
}

/**
 * Read the backend `<key>IsMachine` flag from an arbitrary admin payload
 * without widening every entity interface with translation-only fields.
 */
export function getIsMachineFlag(record: unknown, arKey: string): boolean {
  if (!record || typeof record !== 'object') return false;
  return Boolean((record as Record<string, unknown>)[`${arKey}IsMachine`]);
}

/**
 * Determine the translation state for one Arabic field.
 *
 * @param english  The English source value.
 * @param arabic   The current Arabic value.
 * @param isMachine Backend `<key>IsMachine` flag.
 * @param failed   True when a retranslation was attempted in this session and
 *                 the Arabic is still blank.
 */
export function getTranslationState(
  english: string | null | undefined,
  arabic: string | null | undefined,
  isMachine?: boolean,
  failed?: boolean,
): TranslationState {
  if (hasText(arabic)) return isMachine ? 'machine' : 'human';
  if (failed && hasText(english)) return 'failed';
  return 'missing';
}

export interface TranslationSummary {
  human: number;
  machine: number;
  missing: number;
  failed: number;
  total: number;
}

export function summarizeTranslationStates(states: TranslationState[]): TranslationSummary {
  return states.reduce<TranslationSummary>(
    (acc, state) => {
      acc[state] += 1;
      acc.total += 1;
      return acc;
    },
    { human: 0, machine: 0, missing: 0, failed: 0, total: 0 },
  );
}
