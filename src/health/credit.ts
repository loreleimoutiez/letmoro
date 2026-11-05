import type { StepSnapshot } from './steps.ts';
export interface StepCursor { readonly dayKey: string; readonly high: number }

// Trial session only: establish a baseline first, then credit each new step once.
// Day/zone changes rebaseline; missing/corrected totals never subtract story progress.
export function observeSteps(cursor: StepCursor | null, observation: StepSnapshot): { cursor: StepCursor | null; amount: number } {
  if (observation.status !== 'ready' || observation.count === null || !observation.dayKey) return { cursor, amount: 0 };
  if (!cursor || cursor.dayKey !== observation.dayKey) return { cursor: { dayKey: observation.dayKey, high: observation.count }, amount: 0 };
  if (observation.count <= cursor.high) return { cursor, amount: 0 };
  const amount = observation.count - cursor.high;
  return { cursor: { ...cursor, high: cursor.high + amount }, amount };
}
