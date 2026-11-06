import type { Mode } from './profile.ts';

export interface LifeCalendar { readonly startedAt: string; readonly zone: string }
export interface LifeDay {
  readonly date: string;
  readonly steps: number | null;
  readonly complete: boolean;
  readonly closedAt: string;
  readonly observedAt: string;
  readonly source: 'health' | 'test';
}
export type DayResult = 'unknown' | 'incomplete' | 'goal' | 'short' | 'rest' | 'loss' | 'ended' | 'free';
export interface LifeState {
  readonly calendar?: LifeCalendar;
  readonly days: Readonly<Record<string, LifeDay>>;
  readonly outcomes: Readonly<Record<string, DayResult>>;
  readonly lives: number;
  readonly recovery: number;
  readonly pendingRecovery: number;
  readonly restUsed: Readonly<Record<string, number>>;
  readonly finalMode?: Mode;
}
export function initialLives(): LifeState { return { days: {}, outcomes: {}, lives: 3, recovery: 0, pendingRecovery: 0, restUsed: {} }; }
export function validDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(`${date}T12:00:00Z`)) && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
}
const formatters = new Map<string, Intl.DateTimeFormat>();
export function civilDate(instant: string | number, zone: string): string {
  let formatter = formatters.get(zone);
  if (!formatter) { formatter = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }); formatters.set(zone, formatter); }
  const parts = formatter.formatToParts(new Date(instant));
  const part = (name: string) => parts.find(item => item.type === name)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function addDays(date: string, amount: number): string { return new Date(Date.parse(`${date}T12:00:00Z`) + amount * 86400000).toISOString().slice(0, 10); }
export function weekOf(date: string): string {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addDays(date, -(weekday + 6) % 7);
}
const boundaryCache = new Map<string, string>();
// Find the local date boundary, including 23/25-hour days and non-hour offsets.
export function closedAt(date: string, zone: string): string {
  if (!validDate(date)) throw new Error('Invalid calendar date');
  const key = `${zone}|${date}`, cached = boundaryCache.get(key);
  if (cached) return cached;
  const next = addDays(date, 1), noon = Date.parse(`${next}T12:00:00Z`);
  let low = noon - 48 * 3600000, high = noon + 24 * 3600000;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (civilDate(middle, zone) < next) low = middle + 1; else high = middle;
  }
  const result = new Date(low).toISOString();
  if (boundaryCache.size > 4096) boundaryCache.clear();
  boundaryCache.set(key, result); return result;
}
export function beginLifeCalendar(startedAt: string, zone: string): LifeState {
  if (!Number.isFinite(Date.parse(startedAt)) || !zone || zone.length > 100) throw new Error('Invalid life calendar');
  civilDate(startedAt, zone);
  return { ...initialLives(), calendar: { startedAt, zone } };
}
export function recordLifeDay(state: LifeState, day: LifeDay, goal: number, mode: Mode): LifeState {
  if (!state.calendar || !validDate(day.date) || !['health', 'test'].includes(day.source) || typeof day.complete !== 'boolean' ||
    (day.steps !== null && (!Number.isSafeInteger(day.steps) || day.steps < 0)) || !Number.isFinite(Date.parse(day.observedAt)) ||
    !Number.isFinite(Date.parse(day.closedAt)) || new Date(day.closedAt).toISOString() !== closedAt(day.date, state.calendar.zone)) throw new Error('Invalid finalized day');
  if (day.complete && Date.parse(day.observedAt) < Date.parse(day.closedAt) + 24 * 3600000) throw new Error('Day is still within synchronization grace');
  const previous = state.days[day.date];
  // Losing access is not evidence that a previously known day had fewer steps.
  if (previous?.complete && previous.steps !== null && (!day.complete || day.steps === null)) return state;
  if (previous && previous.steps === day.steps && previous.complete === day.complete && previous.source === day.source) return state;
  const days = { ...state.days, [day.date]: day }, outcomes: Record<string, DayResult> = {}, restUsed: Record<string, number> = {};
  let lives = 3, recovery = 0, pendingRecovery = 0, previousDate: string | undefined, finalMode: Mode | undefined;
  for (const item of Object.values(days).sort((a, b) => a.date.localeCompare(b.date))) {
    if (previousDate && item.date !== addDays(previousDate, 1)) { pendingRecovery = Math.max(pendingRecovery, recovery); recovery = 0; }
    previousDate = item.date;
    if (!item.complete || item.steps === null) { pendingRecovery = Math.max(pendingRecovery, recovery); recovery = 0; outcomes[item.date] = 'unknown'; continue; }
    if (item.source === 'health' && item.date <= civilDate(state.calendar.startedAt, state.calendar.zone)) { pendingRecovery = Math.max(pendingRecovery, recovery); recovery = 0; outcomes[item.date] = 'incomplete'; continue; }
    if (lives === 0) { outcomes[item.date] = 'ended'; continue; }
    if (mode === 'free') { outcomes[item.date] = 'free'; continue; }
    if (item.steps >= goal) {
      outcomes[item.date] = 'goal';
      if (lives === 3) { recovery = 0; pendingRecovery = 0; }
      else if (++recovery === 3) { lives++; recovery = 0; pendingRecovery = 0; }
    } else if (item.steps === 0) {
      const week = weekOf(item.date), allowance = mode === 'hard' ? 1 : 2;
      if ((restUsed[week] ?? 0) < allowance) { restUsed[week] = (restUsed[week] ?? 0) + 1; outcomes[item.date] = 'rest'; }
      else { lives--; recovery = 0; pendingRecovery = 0; outcomes[item.date] = 'loss'; if (lives === 0) finalMode = mode; }
    } else { recovery = 0; pendingRecovery = 0; outcomes[item.date] = 'short'; }
  }
  return { calendar: state.calendar, days, outcomes, restUsed, lives, recovery, pendingRecovery, ...(finalMode ? { finalMode } : {}) };
}
