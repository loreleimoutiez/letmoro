export interface SyncPoint { revision: number; fingerprint: string }
export type Reconciliation = 'equal' | 'restore' | 'upload' | 'conflict';
export function reconcileCloud(local: string, remote: string | null, remoteRevision: number, point: SyncPoint | null, emptyLocal: boolean): Reconciliation {
  if (remote === null) return point ? 'conflict' : 'upload';
  if (local === remote) return 'equal';
  if ((!point && emptyLocal) || point?.fingerprint === local) return 'restore';
  if (point?.revision === remoteRevision) return 'upload';
  return 'conflict';
}
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export async function snapshotFingerprint(payload: string | null, locale: string): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify([payload === null ? null : canonical(JSON.parse(payload)), locale]));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
