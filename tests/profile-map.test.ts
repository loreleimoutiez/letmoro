import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProfile } from '../src/domain/profile.ts';
import { apply, createRun } from '../src/domain/prologue.ts';
import { encodeSave, decodeSave } from '../src/adapters/save.ts';
import { clampVisit, discoveredDistance } from '../src/domain/map.ts';

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
test('map starts with no traveled distance, reveals progressively and clamps revisits without changing the story', () => {
  let run = createRun(1000);
  assert.equal(discoveredDistance(run), 0);
  run = apply(run, { type: 'steps', amount: 10 });
  assert.equal(discoveredDistance(run), 80);
  assert.equal(clampVisit(-10, 80), 0);
  assert.equal(clampVisit(500, 80), 80);
  assert.equal(clampVisit(40, 80), 40);
  assert.equal(run.reserve, 10);
  assert.equal(run.stage, 'street');
  run = apply(apply(run, { type: 'steps', amount: 10 }), { type: 'cross' });
  assert.equal(discoveredDistance(run), 160);
  run = apply(apply(run, { type: 'accept' }), { type: 'steps', amount: 50 });
  assert.equal(discoveredDistance(run), 360);
  assert.equal(run.stage, 'delivery');
});
