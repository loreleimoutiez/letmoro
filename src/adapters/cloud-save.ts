import { auth } from './auth.ts';
import { decodeSave } from './save.ts';
import type { Locale } from '../content/ui.ts';

export interface CloudSnapshot { payload: string | null; locale: Locale; revision: number }
export const cloudEnabled = import.meta.env.VITE_CLOUD_SAVES === 'true' && Boolean(auth);
export class SaveConflict extends Error {}
export function parseCloudSnapshot(value: unknown, userId: string): CloudSnapshot {
  if (!value || typeof value !== 'object') throw new Error('Invalid cloud save');
  const row = value as Record<string, unknown>;
  if (row.user_id !== userId || !Number.isSafeInteger(row.revision) || Number(row.revision) < 1 || !['en', 'fr'].includes(String(row.locale))) throw new Error('Invalid cloud save owner or revision');
  const payload = row.payload === null ? null : JSON.stringify(row.payload);
  if (payload !== null) decodeSave(payload);
  return { payload, locale: row.locale as Locale, revision: Number(row.revision) };
}
export async function readCloudSave(userId: string): Promise<CloudSnapshot | null> {
  if (!auth) throw new Error('Authentication unavailable');
  const { data, error } = await auth.from('player_saves').select('user_id,payload,locale,revision').eq('user_id', userId).abortSignal(AbortSignal.timeout(10000)).maybeSingle();
  if (error) throw error;
  return data ? parseCloudSnapshot(data, userId) : null;
}
export async function writeCloudSave(userId: string, snapshot: Omit<CloudSnapshot, 'revision'>, revision: number): Promise<CloudSnapshot> {
  if (!auth) throw new Error('Authentication unavailable');
  const { data, error } = await auth.rpc('save_player_progress', { p_user_id: userId, p_expected_revision: revision, p_payload: snapshot.payload === null ? null : JSON.parse(snapshot.payload), p_locale: snapshot.locale }).abortSignal(AbortSignal.timeout(10000));
  if (error) throw error;
  if (!Array.isArray(data) || data.length !== 1) throw new SaveConflict('Cloud save changed');
  return parseCloudSnapshot(data[0], userId);
}
