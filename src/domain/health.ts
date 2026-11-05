import type { Run } from './prologue.ts';

export function isHealthDayKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}\|[A-Za-z0-9_+:/-]+$/.test(value)) return false;
  const day = value.split('|')[0];
  const parsed = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day;
}

// Stored in the same event transaction as travel credit, so reload cannot replay it.
export function healthChanges(run: Run, dayKey: string, total: number): Partial<Run> {
  if (!isHealthDayKey(dayKey) || !Number.isSafeInteger(total) || total < 0) throw new Error('Invalid health observation');
  const previous = run.healthLedger[dayKey] ?? 0;
  const firstImport = Object.keys(run.healthLedger).length === 0;
  const changedZone = run.healthKey !== undefined && run.healthKey.split('|')[1] !== dayKey.split('|')[1];
  // Legacy saves have credits but no daily ledger. Conservatively retain those credits.
  const baseline = firstImport ? Math.min(total, run.walkedSteps) : changedZone ? total : previous;
  const amount = Math.max(0, total - Math.max(previous, baseline));
  if (!Number.isSafeInteger(run.walkedSteps + amount)) throw new Error('Step total overflow');
  return {
    walkedSteps: run.walkedSteps + amount,
    reserve: Math.min(run.goal * 7, run.reserve + (run.journeyOrigin === undefined ? 0 : amount)),
    healthLedger: { ...run.healthLedger, [dayKey]: Math.max(previous, baseline, total) },
    healthKey: dayKey,
  };
}
