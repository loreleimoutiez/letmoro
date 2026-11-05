import { observeSteps } from '../src/health/credit.ts';
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

test('travel credits use a session baseline and never double-credit duplicate or corrected readings', () => {
  const ready = (count: number, dayKey = '2026-11-05|Europe/Paris') => parseStepSnapshot({ status: 'ready', count, dayKey });
  let credit = observeSteps(null, ready(1000));
  assert.equal(credit.amount, 0);
  credit = observeSteps(credit.cursor, ready(1012));
  assert.equal(credit.amount, 12);
  let run = apply(createRun(100), { type: 'steps', amount: credit.amount, source: 'health' });
  assert.equal(run.walkedSteps, 12);
  assert.equal(run.simulatedSteps, 0);
  assert.equal(run.reserve, 12);
  for (const count of [1012, 1000, 1010]) {
    const correction = observeSteps(credit.cursor, ready(count));
    assert.equal(correction.amount, 0);
  }
  const next = observeSteps(credit.cursor, ready(1017));
  assert.equal(next.amount, 5);
  run = apply(run, { type: 'steps', amount: next.amount, source: 'health' });
  assert.equal(run.walkedSteps, 17);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
  assert.equal(observeSteps(next.cursor, ready(2, '2026-11-06|Europe/Paris')).amount, 0);
  assert.equal(observeSteps(next.cursor, ready(1200, '2026-11-05|UTC')).amount, 0);
  assert.equal(observeSteps(next.cursor, parseStepSnapshot({ status: 'error' })).amount, 0);
  assert.equal(observeSteps(null, ready(1017)).amount, 0);
});
