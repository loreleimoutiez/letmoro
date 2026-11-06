import { creditSteps } from '../src/health/credit.ts';
import { apply, createRun } from '../src/domain/prologue.ts';
import { decodeSave, encodeSave } from '../src/adapters/save.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStepSnapshot } from '../src/health/steps.ts';

test('missing health observations stay unknown, including a misleading count field', () => {
  for (const status of ['unavailable', 'permission-required', 'empty', 'error']) {
    assert.equal(parseStepSnapshot({ status, count: 0 }).count, null);
  }
});

test('a confirmed zero is distinct from missing data and corrected totals may decrease', () => {
  assert.equal(parseStepSnapshot({ status: 'ready', count: 0 }).count, 0);
  assert.equal(parseStepSnapshot({ status: 'ready', count: 42 }).count, 42);
  assert.equal(parseStepSnapshot({ status: 'ready', count: 31 }).count, 31);
});

test('invalid health totals and malformed responses are rejected', () => {
  for (const count of [null, -1, 1.5, NaN, Infinity, '30', Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => parseStepSnapshot({ status: 'ready', count }));
  }
  for (const data of [null, {}, { status: 'connected', count: 0 }]) assert.throws(() => parseStepSnapshot(data));
});

const ready = (count: number, dayKey = '2026-11-05|Europe/Paris') => parseStepSnapshot({ status: 'ready', count, dayKey });

test('first import places Moro on the path but starts the quest only after meeting', () => {
  let run = creditSteps(createRun(5000), ready(37));
  assert.equal(run.walkedSteps, 37);
  assert.equal(run.reserve, 0);
  run = apply(run, { type: 'start-journey' });
  assert.equal(run.journeyOrigin, 37);
  assert.equal(run.simulatedSteps, 0);
  assert.equal(run.stage, 'street');
  run = decodeSave(encodeSave(run));
  assert.equal(creditSteps(run, ready(37)), run);
  assert.equal(creditSteps(run, ready(30)), run);
  const next = creditSteps(run, ready(42));
  assert.equal(next.walkedSteps, 42);
  assert.equal(next.reserve, 5);
  assert.equal(next.events.length, run.events.length + 1);
});

test('spent steps remain spent on reload, errors and duplicate synchronization', () => {
  let run = creditSteps(createRun(1000), ready(27));
  run = apply(run, { type: 'start-journey' });
  run = creditSteps(run, ready(54));
  run = apply(run, { type: 'cross' });
  assert.equal(run.reserve, 7);
  run = decodeSave(encodeSave(run));
  assert.equal(creditSteps(run, ready(54)).reserve, 7);
  assert.equal(creditSteps(run, ready(40)).reserve, 7);
  assert.equal(creditSteps(run, parseStepSnapshot({ status: 'error' })), run);
  assert.equal(creditSteps(run, ready(58)).reserve, 11);
});

test('new days credit their own total; zone changes rebaseline without duplicating overlapping totals', () => {
  let run = creditSteps(createRun(5000), ready(37));
  run = creditSteps(run, ready(4, '2026-11-06|Europe/Paris'));
  assert.equal(run.walkedSteps, 41);
  run = creditSteps(run, ready(200, '2026-11-06|UTC'));
  assert.equal(run.walkedSteps, 41);
  run = decodeSave(encodeSave(run));
  run = creditSteps(run, ready(203, '2026-11-06|UTC'));
  assert.equal(run.walkedSteps, 44);
  run = creditSteps(run, ready(15, '2026-11-06|Europe/Paris'));
  assert.equal(run.walkedSteps, 44);
});

test('legacy health credits are retained and conservatively deducted from the first daily import', () => {
  const old = apply(createRun(5000), { type: 'steps', amount: 12, source: 'health' });
  const restored = decodeSave(encodeSave(old));
  const migrated = creditSteps(restored, ready(37));
  assert.equal(migrated.walkedSteps, 37);
  assert.equal(migrated.reserve, 12);
  assert.equal(creditSteps(decodeSave(encodeSave(migrated)), ready(37)).walkedSteps, 37);
});

test('health synchronization validates day keys and totals without interpreting missing data as zero', () => {
  const run = createRun(100);
  assert.equal(creditSteps(run, parseStepSnapshot({ status: 'ready', count: 3 })), run);
  for (const [dayKey, total] of [['2026-99-99|UTC', 1], ['bad', 1], ['2026-11-05|UTC', -1], ['2026-11-05|UTC', 1.5]]) {
    assert.throws(() => apply(run, { type: 'health-sync', dayKey: String(dayKey), total: Number(total) }));
  }
  assert.equal(creditSteps(run, ready(0)).walkedSteps, 0);
});
test('an explicitly erased game baselines existing daily steps without restoring old travel', async () => {
  const {createRun,apply}=await import('../src/domain/prologue.ts');
  let run=apply(createRun(100),{type:'fresh-start'});
  run=apply(run,{type:'health-sync',dayKey:'2026-01-02|UTC',total:350});
  assert.equal(run.walkedSteps,0);assert.equal(run.reserve,0);
  run=apply(run,{type:'start-journey'});assert.equal(run.journeyOrigin,0);
  run=apply(run,{type:'health-sync',dayKey:'2026-01-02|UTC',total:355});
  assert.equal(run.walkedSteps,5);assert.equal(run.reserve,5);
  assert.throws(()=>apply(run,{type:'fresh-start'}));
});
