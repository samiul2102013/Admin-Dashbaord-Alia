import apiClient from '@/lib/api-client';

/**
 * Backend model keys accepted by `POST /api/admin/retranslate`
 * (see content/views_admin.py RetranslateAdminView.MODEL_MAP).
 */
export type TranslationModel =
  | 'short'
  | 'news'
  | 'initiative'
  | 'consultation'
  | 'emirate'
  | 'category'
  | 'presentation'
  | 'homepage'
  | 'about'
  | 'contact'
  | 'footer';

export interface RetranslatePayload {
  model: TranslationModel;
  /** Record id. Omit for singleton page content (homepage/about/contact/footer). */
  id?: string;
  /** Regenerate existing machine Arabic (never touches human Arabic). */
  force?: boolean;
  /**
   * Also overwrite human-reviewed Arabic. Destructive — only ever send after an
   * explicit confirmation warning.
   */
  forceHuman?: boolean;
}

export interface RetranslateResult {
  model: string;
  id: string;
  force: boolean;
  force_human: boolean;
  updated_fields: Record<string, string>;
}

export async function retranslateContent(
  payload: RetranslatePayload,
): Promise<RetranslateResult> {
  const { data } = await apiClient.post<RetranslateResult>('/admin/retranslate', {
    model: payload.model,
    id: payload.id,
    force: payload.force ?? false,
    force_human: payload.forceHuman ?? false,
  });
  return data;
}
