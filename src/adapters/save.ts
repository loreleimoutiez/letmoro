import { parseProfile } from '../domain/profile.ts';
import { apply, CONTENT_VERSION, createRun, isAction } from '../domain/prologue.ts';
import type { Run } from '../domain/prologue.ts';
export const SAVE_KEY = 'letmoro.internal-prologue.v1';
export function encodeSave(run: Run): string {
  return JSON.stringify({ schema: 1, content: CONTENT_VERSION, goal: run.goal, ...(run.profile ? { profile: run.profile } : {}), events: run.events });
}
export function decodeSave(raw: string): Run {
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object') throw new Error('Invalid save');
  const save = data as Record<string, unknown>;
  if (save.schema !== 1 || !['prologue-1', 'prologue-2', 'prologue-3', 'prologue-4', 'prologue-5', 'prologue-6', 'prologue-7', 'prologue-8', CONTENT_VERSION].includes(String(save.content)) || typeof save.goal !== 'number' ||
      !Array.isArray(save.events) || save.events.length > 50000) throw new Error('Unsupported save');
  let run = createRun(save.goal, save.profile === undefined ? undefined : parseProfile(save.profile));
  for (const event of save.events) {
    if (!isAction(event)) throw new Error('Invalid event');
    run = apply(run, event);
  }
  return run;
}
