'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getErrorMessage } from '@/lib/api-client';
import { useRetranslate } from '@/hooks/useRetranslate';
import type { TranslationModel } from '@/lib/services/translation';

interface TranslationContextValue {
  model: TranslationModel;
  id?: string;
  /** False while creating a record (no id yet) — actions are disabled. */
  enabled: boolean;
  pending: boolean;
  error: string;
  clearError: () => void;
  /** Fill every blank Arabic field (safe — never overwrites existing Arabic). */
  translateMissing: () => void;
  /** Regenerate machine Arabic only (safe — never touches human Arabic). */
  retranslateMachine: () => void;
  /** Explicit, confirmed overwrite of human-reviewed Arabic too. */
  forceRetranslateAll: () => void;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function useTranslation(): TranslationContextValue {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used inside a <TranslationProvider>');
  }
  return ctx;
}

/**
 * Like `useTranslation` but returns null outside a provider. Used by
 * `ArabicField` so status badges still render on screens whose backend model
 * has no retranslate endpoint (e.g. media).
 */
export function useOptionalTranslation(): TranslationContextValue | null {
  return useContext(TranslationContext);
}

interface TranslationProviderProps {
  model: TranslationModel;
  id?: string;
  /** Called after a successful retranslation so the editor can reload values. */
  onTranslated?: () => void | Promise<void>;
  /** Optionally surface an error message in the editor as well. */
  onError?: (message: string) => void;
  children: React.ReactNode;
}

export default function TranslationProvider({
  model,
  id,
  onTranslated,
  onError,
  children,
}: TranslationProviderProps) {
  const mutation = useRetranslate();
  const [error, setError] = useState('');

  const run = useCallback(
    (force: boolean, forceHuman: boolean) => {
      if (!id) return;
      setError('');
      mutation.mutate(
        { model, id, force, forceHuman },
        {
          onSuccess: () => {
            void Promise.resolve(onTranslated?.());
          },
          onError: (err) => {
            const message = getErrorMessage(err);
            setError(message);
            onError?.(message);
          },
        },
      );
    },
    [id, model, mutation, onTranslated, onError],
  );

  const value = useMemo<TranslationContextValue>(
    () => ({
      model,
      id,
      enabled: Boolean(id),
      pending: mutation.isPending,
      error,
      clearError: () => setError(''),
      translateMissing: () => run(false, false),
      retranslateMachine: () => run(true, false),
      forceRetranslateAll: () => run(true, true),
    }),
    [model, id, mutation.isPending, error, run],
  );

  return (
    <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
  );
}
