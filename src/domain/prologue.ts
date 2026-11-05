import { parseProfile } from './profile.ts';
import type { Profile } from './profile.ts';
export const CONTENT_VERSION = 'prologue-1';
export const stages = ['street', 'job', 'delivery', 'handover', 'settlement', 'complete', 'rest'] as const;
export type Stage = typeof stages[number];
export type Action =
  | { type: 'steps'; amount: number; source?: 'health' }
  | { type: 'cross' | 'accept' | 'rest' | 'arrive' | 'deliver' | 'settle' };
export interface Run {
  readonly goal: number;
  readonly profile?: Profile;
  readonly stage: Stage;
  readonly reserve: number;
  readonly simulatedSteps: number;
  readonly walkedSteps: number;
  readonly sous: number;
  readonly delivered: number;
  readonly events: readonly Action[];
}
export function createRun(goal: number, profile?: Profile): Run {
  if (!Number.isSafeInteger(goal) || goal < 1 || goal > 100000) throw new Error('Invalid daily goal');
  return { ...(profile ? { profile: parseProfile(profile) } : {}), goal, stage: 'street', reserve: 0, simulatedSteps: 0, walkedSteps: 0, sous: 0, delivered: 0, events: [] };
}
// Trial ratios only; production travel balance and goal changes are undecided.
export function travelCost(run: Run): number {
  return Math.max(1, Math.ceil(run.goal * (run.stage === 'street' ? 0.02 : 0.1)));
}
export function apply(run: Run, action: Action): Run {
  let changes: Partial<Run>;
  switch (action.type) {
    case 'steps':
      if (!Number.isSafeInteger(action.amount) || action.amount < 1 || (action.source !== 'health' && action.amount > 100000) ||
          (action.source === 'health' ? run.walkedSteps : run.simulatedSteps) + action.amount > Number.MAX_SAFE_INTEGER) throw new Error('Invalid simulated steps');
      changes = { ...(action.source === 'health' ? { walkedSteps: run.walkedSteps + action.amount } : { simulatedSteps: run.simulatedSteps + action.amount }), reserve: Math.min(run.goal * 7, run.reserve + action.amount) };
      break;
    case 'cross':
    case 'arrive': {
      const expected = action.type === 'cross' ? 'street' : 'delivery';
      if (run.stage !== expected || run.reserve < travelCost(run)) throw new Error('Journey unavailable');
      changes = { stage: action.type === 'cross' ? 'job' : 'handover', reserve: run.reserve - travelCost(run) };
      break;
    }
    case 'accept':
    case 'rest':
      if (run.stage !== 'job') throw new Error('No job decision pending');
      changes = { stage: action.type === 'accept' ? 'delivery' : 'rest' };
      break;
    case 'deliver':
      if (run.stage !== 'handover') throw new Error('No letter to deliver');
      changes = { stage: 'settlement', delivered: 1 };
      break;
    case 'settle':
      if (run.stage !== 'settlement') throw new Error('No wages pending');
      changes = { stage: 'complete', sous: 8 - 2 - 2 };
      break;
    default: throw new Error('Unknown action');
  }
  return { ...run, ...changes, events: [...run.events, action] };
}
export function isAction(value: unknown): value is Action {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return item.type === 'steps' ? typeof item.amount === 'number' && (item.source === undefined || item.source === 'health') :
    ['cross', 'accept', 'rest', 'arrive', 'deliver', 'settle'].includes(String(item.type));
}
