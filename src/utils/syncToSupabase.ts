import { getSupabaseBrowserClient, isSupabaseConfigured } from '../lib/supabaseClient';
import type { SessionData } from './sessionAnalytics';

export type SyncResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'error'; message: string };

export async function syncSessionToSupabase(sessionData: SessionData): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'Supabase не настроен (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
    };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, reason: 'not_configured', message: 'Не удалось создать клиент Supabase.' };
  }

  const { error } = await supabase.rpc('upsert_game_session', { p_row: sessionData });

  if (error) {
    const hint =
      /row-level security|permission denied|function .* does not exist|PGRST202/i.test(error.message)
        ? ' Выполните заново весь SQL из supabase/schema.sql в Supabase → SQL Editor.'
        : '';
    return { ok: false, reason: 'error', message: `${error.message}${hint}` };
  }

  return { ok: true };
}
