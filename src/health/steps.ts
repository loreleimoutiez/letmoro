export type StepSnapshot = {
  status: 'unavailable' | 'permission-required' | 'ready' | 'empty' | 'error';
  count: number | null;
  checkedAt: string | null;
};

export function parseStepSnapshot(value: unknown): StepSnapshot {
  if (!value || typeof value !== 'object') throw new Error('Invalid step response');
  const data = value as Record<string, unknown>;
  if (!['unavailable', 'permission-required', 'ready', 'empty', 'error'].includes(String(data.status))) throw new Error('Invalid step status');
  if (data.status === 'ready' && (!Number.isSafeInteger(data.count) || Number(data.count) < 0)) throw new Error('Invalid step count');
  return {
    status: data.status as StepSnapshot['status'],
    count: data.status === 'ready' ? data.count as number : null,
    checkedAt: typeof data.checkedAt === 'string' ? data.checkedAt : null,
  };
}
