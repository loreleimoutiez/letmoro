import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beginLifeCalendar, closedAt, civilDate, recordLifeDay, weekOf } from '../src/domain/lives.ts';
import type { LifeDay, LifeState } from '../src/domain/lives.ts';
import type { Mode } from '../src/domain/profile.ts';
import { apply, createRun } from '../src/domain/prologue.ts';
import { decodeSave, encodeSave } from '../src/adapters/save.ts';
const calendar = () => beginLifeCalendar('2025-12-31T12:00:00Z', 'UTC');
function observation(date: string, steps: number | null, complete = true): LifeDay {
  return { date, steps, complete, source: 'health', closedAt: closedAt(date, 'UTC'), observedAt: '2026-03-01T12:00:00Z' };
}
function record(state: LifeState, date: string, steps: number | null, mode: Mode = 'standard', complete = true) {
  return recordLifeDay(state, observation(date, steps, complete), 100, mode);
}
test('standard consumes two weekly zero-day rests before loss, and nonzero short days never lose a life', () => {
  let state = record(calendar(), '2026-01-05', 0);
  state = record(state, '2026-01-06', 0);
  assert.equal(state.lives, 3);
  state = record(state, '2026-01-07', 0);
  assert.equal(state.lives, 2);
  assert.equal(state.restUsed['2026-01-05'], 2);
  state = record(state, '2026-01-08', 1);
  assert.equal(state.lives, 2);
  assert.equal(state.outcomes['2026-01-08'], 'short');
  state = record(state, '2026-01-12', 0);
  assert.equal(state.lives, 2);
  assert.equal(state.restUsed['2026-01-12'], 1);
});
test('recovery needs three consecutive goals, is capped at three, and never banks full-life days', () => {
  let state = record(calendar(), '2026-01-05', 0, 'hard');
  state = record(state, '2026-01-06', 0, 'hard');
  for (const date of ['2026-01-07', '2026-01-08']) state = record(state, date, 100, 'hard');
  assert.equal(state.lives, 2); assert.equal(state.recovery, 2);
  state = record(state, '2026-01-09', 100, 'hard');
  assert.equal(state.lives, 3); assert.equal(state.recovery, 0);
  state = record(state, '2026-01-10', 100, 'hard');
  state = record(state, '2026-01-11', 0, 'hard');
  assert.equal(state.lives, 2); assert.equal(state.recovery, 0);
});
test('protected rest suspends recovery across Monday, while an unprotected short day interrupts it', () => {
  let state = record(calendar(), '2026-01-01', 0, 'hard');
  state = record(state, '2026-01-02', 0, 'hard');
  state = record(state, '2026-01-03', 100, 'hard');
  state = record(state, '2026-01-04', 100, 'hard');
  state = record(state, '2026-01-05', 0, 'hard');
  assert.equal(state.recovery, 2);
  state = record(state, '2026-01-06', 100, 'hard');
  assert.equal(state.lives, 3);
  state = record(state, '2026-01-07', 0, 'hard');
  state = record(state, '2026-01-08', 100, 'hard');
  state = record(state, '2026-01-09', 1, 'hard');
  assert.equal(state.recovery, 0);
});
test('unknown/incomplete/first days cannot consume rests or lives; missing days cannot prove a recovery', () => {
  let state = record(calendar(), '2025-12-31', 0);
  state = record(state, '2026-01-01', null);
  state = record(state, '2026-01-02', 0, 'standard', false);
  assert.equal(state.lives, 3); assert.deepEqual(state.restUsed, {});
  state = record(state, '2026-01-05', 0, 'hard');
  state = record(state, '2026-01-06', 0, 'hard');
  state = record(state, '2026-01-07', 100, 'hard');
  state = record(state, '2026-01-08', null, 'hard');
  state = record(state, '2026-01-09', 100, 'hard');
  assert.equal(state.lives, 2);
  assert.equal(state.pendingRecovery, 1);
  state = record(state, '2026-01-08', 100, 'hard');
  assert.equal(state.lives, 3);
});
test('late corrections rebuild outcomes once, including rest reassignment and a reversed final loss', () => {
  let state = calendar();
  for (const date of ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08']) state = record(state, date, 0, 'hard');
  assert.equal(state.lives, 0); assert.equal(state.finalMode, 'hard');
  state = record(state, '2026-01-09', 100, 'hard');
  assert.equal(state.lives, 0);
  state = record(state, '2026-01-06', 1, 'hard');
  assert.equal(state.lives, 1); assert.equal(state.finalMode, undefined);
  assert.equal(record(state, '2026-01-06', 1, 'hard').lives, 1);
  const previous = state;
  state = record(state, '2026-01-06', null, 'hard');
  assert.equal(state, previous);
});
test('free mode never consumes rests, loses lives or builds a recovery bank', () => {
  let state = calendar();
  for (const date of ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08']) state = record(state, date, 0, 'free');
  assert.equal(state.lives, 3); assert.deepEqual(state.restUsed, {}); assert.equal(state.recovery, 0);
});
test('closed days respect a full 24-hour grace and the fixed zone across DST', () => {
  assert.equal(closedAt('2026-03-29', 'Europe/Paris'), '2026-03-29T22:00:00.000Z');
  assert.equal(closedAt('2026-10-25', 'Europe/Paris'), '2026-10-25T23:00:00.000Z');
  assert.equal(civilDate('2026-01-04T23:30:00Z', 'Europe/Paris'), '2026-01-05');
  assert.equal(weekOf('2026-01-11'), '2026-01-05');
  assert.equal(weekOf('2026-01-12'), '2026-01-12');
  const day = { ...observation('2026-01-05', 0), observedAt: '2026-01-06T23:59:59Z' };
  assert.throws(() => recordLifeDay(calendar(), day, 100, 'standard'));
  const valid = recordLifeDay(calendar(), { ...day, closedAt: '2026-01-06T00:00:00Z', observedAt: '2026-01-07T00:00:00Z' }, 100, 'standard');
  assert.equal(valid.outcomes['2026-01-05'], 'rest');
});
test('life outcomes replay with the run, freeze gameplay at zero, and corrections can restore the run', () => {
  let run = createRun(100, { mode: 'hard', positive: ['patient', 'curious', 'kind'], negative: ['stubborn', 'timid', 'proud'] });
  run = apply(run, { type: 'begin-life-accounting', startedAt: '2025-12-31T12:00:00Z', zone: 'UTC' });
  for (const date of ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08']) run = apply(run, { type: 'life-day', day: observation(date, 0) });
  assert.equal(run.life.lives, 0);
  assert.throws(() => apply(run, { type: 'steps', amount: 100 }));
  assert.throws(() => apply(run, { type: 'test-coins', amount: 999 }));
  assert.deepEqual(decodeSave(encodeSave(run)), run);
  run = apply(run, { type: 'life-day', day: observation('2026-01-06', 1) });
  assert.equal(run.life.lives, 1);
  assert.equal(apply(run, { type: 'steps', amount: 1 }).simulatedSteps, 1);
});

test('chosen rest weekdays apply next Monday, keep history and enforce a seven-day change delay', async () => {
  const { scheduleRest } = await import('../src/domain/lives.ts');
  let state=scheduleRest(calendar(),[2,4],'2026-01-06T12:00:00Z','standard');
  assert.equal(state.schedules![0].effective,'2026-01-12');
  assert.throws(()=>scheduleRest(state,[1,3],'2026-01-12T12:00:00Z','standard'));
  assert.throws(()=>scheduleRest(state,[1,1],'2026-01-13T12:00:00Z','standard'));
  assert.throws(()=>scheduleRest(state,[1,3],'2026-01-13T12:00:00Z','hard'));
  state=record(state,'2026-01-08',0);assert.equal(state.outcomes['2026-01-08'],'rest');
  state=record(state,'2026-01-12',0);assert.equal(state.outcomes['2026-01-12'],'loss');
  state=record(state,'2026-01-13',0);assert.equal(state.outcomes['2026-01-13'],'rest');
  state=scheduleRest(state,[1,3],'2026-01-13T12:00:00Z','standard');
  assert.equal(state.schedules![1].effective,'2026-01-19');
  state=record(state,'2026-01-12',1);assert.equal(state.lives,3);assert.equal(state.outcomes['2026-01-13'],'rest');
  state=record(state,'2026-01-19',0);assert.equal(state.outcomes['2026-01-19'],'rest');
  assert.equal(state.schedules!.length,2);
});
