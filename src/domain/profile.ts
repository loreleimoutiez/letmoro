export const positiveTraits = ['attentive', 'patient', 'curious', 'resourceful', 'kind', 'brave'] as const;
export const negativeTraits = ['impulsive', 'stubborn', 'distracted', 'distrustful', 'timid', 'proud'] as const;
export const modes = ['free', 'standard', 'hard'] as const;
export type Mode = typeof modes[number];
export interface Profile {
  readonly mode: Mode;
  readonly positive: readonly string[];
  readonly negative: readonly string[];
}
const conflicts: Record<string, string> = { attentive: 'distracted', patient: 'impulsive', brave: 'timid' };
export function incompatible(positive: readonly string[], negative: readonly string[]): boolean {
  return positive.some(trait => negative.includes(conflicts[trait]));
}
export function parseProfile(value: unknown): Profile {
  if (!value || typeof value !== 'object') throw new Error('Invalid profile');
  const data = value as Record<string, unknown>;
  const valid = (items: unknown, allowed: readonly string[]): items is string[] =>
    Array.isArray(items) && items.length === 3 && new Set(items).size === 3 && items.every(item => allowed.includes(item));
  if (!modes.includes(data.mode as Mode) || !valid(data.positive, positiveTraits) || !valid(data.negative, negativeTraits) || incompatible(data.positive, data.negative)) throw new Error('Invalid profile');
  return { mode: data.mode as Mode, positive: [...data.positive], negative: [...data.negative] };
}
