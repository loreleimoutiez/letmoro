import { isHealthDayKey } from '../domain/health.ts';
export type StepSnapshot = {
  status: 'unavailable' | 'permission-required' | 'ready' | 'empty' | 'error';
  count: number | null;
  checkedAt: string | null;
  dayKey?: string;
  live?: boolean;
  providerCount?: number | null;
  providerCheckedAt?: string | null;
  samsungShared?: boolean;
};

export function parseStepSnapshot(value: unknown): StepSnapshot {
  if (!value || typeof value !== 'object') throw new Error('Invalid step response');
  const data = value as Record<string, unknown>;
  if (!['unavailable', 'permission-required', 'ready', 'empty', 'error'].includes(String(data.status))) throw new Error('Invalid step status');
  if (data.status === 'ready' && (!Number.isSafeInteger(data.count) || Number(data.count) < 0)) throw new Error('Invalid step count');
  return {
    live: data.live === true,
    ...(data.providerCount === null || Number.isSafeInteger(data.providerCount) && Number(data.providerCount)>=0 ? {providerCount:data.providerCount as number | null} : {}),
    ...(typeof data.providerCheckedAt==='string' && Number.isFinite(Date.parse(data.providerCheckedAt)) ? {providerCheckedAt:data.providerCheckedAt} : {}),
    ...(typeof data.samsungShared==='boolean' ? {samsungShared:data.samsungShared} : {}),
    status: data.status as StepSnapshot['status'],
    count: data.status === 'ready' ? data.count as number : null,
    ...(isHealthDayKey(data.dayKey) ? { dayKey: data.dayKey } : {}),
    checkedAt: typeof data.checkedAt === 'string' ? data.checkedAt : null,
  };
}
