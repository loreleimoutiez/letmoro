import { apply } from '../domain/prologue.ts';
import type { Run } from '../domain/prologue.ts';
import type { StepSnapshot } from './steps.ts';

export function creditSteps(run: Run, observation: StepSnapshot): Run {
  if (observation.status !== 'ready' || observation.count === null || !observation.dayKey) return run;
  if (run.healthKey === observation.dayKey && observation.count <= (run.healthLedger[observation.dayKey] ?? 0)) return run;
  return apply(run, { type: 'health-sync', dayKey: observation.dayKey, total: observation.count });
}
