import type { Run } from './prologue.ts';
import { travelCost } from './prologue.ts';

// Trial geometry, independent of GPS. Only traveled portions are revealed.
export function discoveredDistance(run: Run | null): number {
  if (!run) return 0;
  if (run.stage === 'street') return Math.round(Math.min(1, run.reserve / travelCost(run)) * 160);
  if (run.stage === 'delivery') return 160 + Math.round(Math.min(1, run.reserve / travelCost(run)) * 400);
  if (run.stage === 'job' || run.stage === 'rest') return 160;
  return 560;
}
export function clampVisit(position: number, discovered: number) {
  return Math.max(0, Math.min(discovered, position));
}
