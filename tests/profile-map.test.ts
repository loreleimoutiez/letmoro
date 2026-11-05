import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProfile } from '../src/domain/profile.ts';
import { apply, createRun } from '../src/domain/prologue.ts';
import { encodeSave, decodeSave } from '../src/adapters/save.ts';
import { discoveredDistance } from '../src/domain/map.ts';

const profile = { mode: 'standard', positive: ['patient', 'curious', 'kind'], negative: ['stubborn', 'timid', 'proud'] };
test('run setup requires exactly three unique compatible traits on each side and a valid mode', () => {
  assert.equal(parseProfile(profile).mode, 'standard');
  for (const invalid of [
    { ...profile, mode: 'impossible' }, { ...profile, positive: ['patient'] },
    { ...profile, negative: ['proud', 'proud', 'timid'] },
    { ...profile, negative: ['impulsive', 'timid', 'proud'] },
  ]) assert.throws(() => parseProfile(invalid));
});
test('setup survives event replay while old saves without setup remain readable', () => {
  const run = apply(createRun(100, parseProfile(profile)), { type: 'steps', amount: 50 });
  assert.deepEqual(decodeSave(encodeSave(run)), run);
  assert.deepEqual(decodeSave(encodeSave(createRun(100))), createRun(100));
  const corrupt = JSON.parse(encodeSave(run)); corrupt.profile.positive = ['patient'];
  assert.throws(() => decodeSave(JSON.stringify(corrupt)));
});
test('map starts with no traveled distance and reveals progressively without skipping story choices', () => {
  let run = createRun(1000);
  assert.equal(discoveredDistance(run), 0);
  run = apply(run, { type: 'steps', amount: 10 });
  assert.equal(discoveredDistance(run), 10);
  assert.equal(run.reserve, 10);
  assert.equal(run.stage, 'street');
  run = apply(apply(run, { type: 'steps', amount: 10 }), { type: 'cross' });
  assert.equal(discoveredDistance(run), 20);
  run = apply(apply(run, { type: 'accept' }), { type: 'steps', amount: 50 });
  assert.equal(discoveredDistance(run), 70);
  assert.equal(run.stage, 'delivery');
});

test('one step reveals one world pixel at different personal goals, stopping at explicit decisions', () => {
  for (const goal of [100, 5000, 100000]) {
    const run = apply(createRun(goal), { type: 'steps', amount: 1 });
    assert.equal(discoveredDistance(run), 1);
  }
  const pending = apply(createRun(5000), { type: 'steps', amount: 1000 });
  assert.equal(discoveredDistance(pending), 100);
  assert.equal(pending.stage, 'street');
});

test('office distance starts after meeting Moro, independently of existing daily steps', () => {
  let run = apply(createRun(5000), { type: 'health-sync', dayKey: '2026-01-15|UTC', total: 230 });
  assert.equal(discoveredDistance(run), 230);
  assert.equal(run.reserve, 0);
  run = apply(run, { type: 'start-journey' });
  assert.equal(run.journeyOrigin, 230);
  assert.equal(discoveredDistance(run), 230);
  assert.throws(() => apply(run, { type: 'cross' }));
  run = apply(run, { type: 'health-sync', dayKey: '2026-01-15|UTC', total: 270 });
  assert.equal(discoveredDistance(run), 270);
  assert.equal(run.reserve, 40);
  run = decodeSave(encodeSave(run));
  assert.equal(run.journeyOrigin, 230);
  assert.throws(() => apply(run, { type: 'cross' }));
});
