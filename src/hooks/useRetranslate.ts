'use client';

import { useMutation } from '@tanstack/react-query';
import { retranslateContent, type RetranslatePayload } from '@/lib/services/translation';

export function useRetranslate() {
  return useMutation({
    mutationFn: (payload: RetranslatePayload) => retranslateContent(payload),
  });
}
