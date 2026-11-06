import { decodeSave, encodeSave, SAVE_KEY } from './save.ts';
import type { Run } from '../domain/prologue.ts';
const LEGACY_OWNER = 'letmoro.legacy-owner.v1';
export function accountSaveKey(userId: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) throw new Error('Invalid account identifier');
  return `letmoro.run.v2.${userId}`;
}
export function loadAccountRun(userId: string): Run | null {
  const key = accountSaveKey(userId);
  const current = localStorage.getItem(key);
  if (current !== null) return decodeSave(current);
  const legacy = localStorage.getItem(SAVE_KEY);
  const owner = localStorage.getItem(LEGACY_OWNER);
  if (legacy === null || (owner !== null && owner !== userId)) return null;
  // Claim before copying: a failed write cannot expose the same save to another account.
  localStorage.setItem(LEGACY_OWNER, userId);
  const run = decodeSave(legacy);
  localStorage.setItem(key, encodeSave(run));
  localStorage.removeItem(SAVE_KEY);
  return run;
}
export function saveAccountRun(userId: string, run: Run) { localStorage.setItem(accountSaveKey(userId), encodeSave(run)); }
export function resetAccountRun(userId: string) {
  localStorage.removeItem(accountSaveKey(userId));
  if (localStorage.getItem(LEGACY_OWNER) === userId) localStorage.removeItem(SAVE_KEY);
}

// Explicit account-owned game erasure never touches Auth storage or another account.
export function eraseAccountProgress(userId: string) {
  accountSaveKey(userId);
  localStorage.setItem(`letmoro.fresh-start.v1.${userId}`, '1');
  resetAccountRun(userId);
  localStorage.removeItem(`letmoro.cloud.v1.${userId}.backup`);
  localStorage.removeItem(`letmoro.life-history-cursor.${userId}`);
}
