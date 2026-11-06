import { recordsFor } from '../src/domain/records.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, createRun, travelCost } from '../src/domain/prologue.ts';
import { decodeSave, encodeSave } from '../src/adapters/save.ts';
import { themeAt } from '../src/ui/time.ts';

test('surplus cannot skip decisions; intact delivery settles only once', () => {
  let run = apply(createRun(5000), { type: 'steps', amount: 10000 });
  assert.equal(run.stage, 'street');
  assert.throws(() => apply(run, { type: 'deliver' }));
  run = apply(run, { type: 'cross' });
  assert.equal(run.stage, 'job');
  assert.equal(run.reserve, 9900);
  run = apply(run, { type: 'accept' });
  run = apply(run, { type: 'arrive' });
  assert.equal(run.delivered, 0);
  run = apply(run, { type: 'deliver' });
  assert.equal(run.delivered, 1);
  assert.equal(run.sous, 0);
  run = apply(run, { type: 'settle' });
  assert.equal(run.sous, 4);
  assert.equal(run.reserve, 9400);
  assert.throws(() => apply(run, { type: 'settle' }));
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});
test('goals scale travel without allowing negative or fractional steps', () => {
  for (const goal of [1, 100, 5000, 100000]) {
    const run = createRun(goal);
    assert.equal(travelCost(run), Math.max(1, Math.ceil(goal * 0.02)));
    assert.throws(() => apply(run, { type: 'cross' }));
    for (const amount of [-1, 0, 0.5, Infinity, NaN]) assert.throws(() => apply(run, { type: 'steps', amount }));
  }
  for (const goal of [0, -1, 1.5, NaN, 100001]) assert.throws(() => createRun(goal));
});
test('reserve caps at seven goals, total simulated steps keep counting', () => {
  const run = apply(createRun(100), { type: 'steps', amount: 1000 });
  assert.equal(run.reserve, 700);
  assert.equal(run.simulatedSteps, 1000);
});
test('declining the job records a pause without employment or payment', () => {
  let run = apply(createRun(100), { type: 'steps', amount: 10 });
  run = apply(apply(run, { type: 'cross' }), { type: 'rest' });
  assert.equal(run.stage, 'rest');
  assert.equal(run.delivered, 0);
  assert.equal(run.sous, 0);
  assert.throws(() => apply(run, { type: 'accept' }));
});
test('save decoding rejects incompatible versions and impossible event sequences', () => {
  for (const raw of ['{', 'null', '{}', JSON.stringify({ schema: 2 }),
    JSON.stringify({ schema: 1, content: 'prologue-1', goal: 100, events: [{ type: 'settle' }] }),
    JSON.stringify({ schema: 1, content: 'prologue-1', goal: 100, events: [{ type: 'unknown' }] })]) {
    assert.throws(() => decodeSave(raw));
  }
});
test('presentation follows local clock boundaries without story effects', () => {
  for (const [hour, expected] of [[0, 'night'], [6, 'dusk'], [8, 'day'], [18, 'dusk'], [21, 'night']] as const) {
    assert.equal(themeAt(new Date(2026, 10, 5, hour)), expected);
  }
});

test('records reveal only encountered people and earned badges, preserving sealed letters after reload', () => {
  let run = createRun(100);
  assert.deepEqual(recordsFor(run).characters, []);
  assert.deepEqual(recordsFor(run).letters, []);
  assert.equal(recordsFor(run).badges[0].description, null);
  assert.equal(recordsFor(run).badges[0].title, null);
  run = apply(apply(run, { type: 'steps', amount: 100 }), { type: 'cross' });
  assert.equal(recordsFor(run).characters.length, 1);
  assert.equal(recordsFor(apply(run, { type: 'rest' })).badges[0].description, null);
  run = apply(run, { type: 'accept' });
  assert.equal(recordsFor(run).badges[0].title, 'A first job');
  assert.equal(recordsFor(run).letters[0].opened, false);
  run = apply(apply(run, { type: 'arrive' }), { type: 'deliver' });
  const restored = recordsFor(decodeSave(encodeSave(run)));
  assert.equal(restored.characters.length, 2);
  assert.equal(restored.letters[0].status, 'Delivered intact');
  assert.equal(restored.letters[0].opened, false);
  assert.equal(restored.badges[0].title, 'A first job');
});

test('job questions persist, do not spend steps, and cannot grant employment', () => {
  let run = apply(apply(createRun(100), { type: 'steps', amount: 100 }), { type: 'cross' });
  const reserve = run.reserve;
  for (const topic of ['work', 'pay', 'directions'] as const) run = apply(run, { type: 'ask', topic });
  assert.equal(run.reserve, reserve);
  assert.equal(run.stage, 'job');
  assert.equal(recordsFor(run).letters.length, 0);
  assert.throws(() => apply(run, { type: 'ask', topic: 'pay' }));
  run = apply(run, { type: 'rest' });
  assert.throws(() => apply(run, { type: 'ask', topic: 'work' }));
  run = apply(run, { type: 'reconsider' });
  assert.deepEqual(decodeSave(encodeSave(run)), run);
  assert.equal(apply(run, { type: 'accept' }).stage, 'delivery');
});

test('opened deliveries retain breach of seal and cannot be opened after delivery', () => {
  let run = apply(apply(apply(createRun(100), { type: 'steps', amount: 100 }), { type: 'cross' }), { type: 'accept' });
  run = apply(run, { type: 'open-letter' });
  assert.throws(() => apply(run, { type: 'open-letter' }));
  run = apply(apply(run, { type: 'arrive' }), { type: 'deliver' });
  assert.equal(run.delivered, 1);
  assert.equal(recordsFor(run).letters[0].status, 'Delivered opened');
  assert.throws(() => apply(run, { type: 'open-letter' }));
  assert.throws(() => apply(run, { type: 'destroy-letter' }));
  run = apply(run, { type: 'settle' });
  assert.equal(run.sous, 4);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('destruction before or after reading prevents delivery and payment without erasing knowledge', () => {
  for (const opened of [false, true]) {
    let run = apply(apply(apply(createRun(100), { type: 'steps', amount: 100 }), { type: 'cross' }), { type: 'accept' });
    if (opened) run = apply(run, { type: 'open-letter' });
    run = apply(run, { type: 'destroy-letter' });
    assert.throws(() => apply(run, { type: 'open-letter' }));
    assert.throws(() => apply(run, { type: 'destroy-letter' }));
    assert.throws(() => apply(run, { type: 'report-loss' }));
    run = apply(run, { type: 'arrive' });
    assert.throws(() => apply(run, { type: 'deliver' }));
    run = apply(run, { type: 'report-loss' });
    assert.equal(run.stage, 'failed');
    assert.equal(run.delivered, 0);
    assert.equal(run.sous, 0);
    assert.equal(run.letterOpened, opened);
    assert.equal(recordsFor(run).letters[0].status, 'Destroyed');
    assert.throws(() => apply(run, { type: 'settle' }));
    assert.deepEqual(decodeSave(encodeSave(run)), run);
  }
  for (const type of ['open-letter', 'destroy-letter', 'report-loss', 'reconsider'] as const) assert.throws(() => apply(createRun(100), { type }));
});

test('test controls persist fictional credits separately from health and validate the editable balance', () => {
  let run = apply(createRun(100), { type: 'test-coins', amount: 123 });
  run = apply(run, { type: 'steps', amount: 100 });
  assert.equal(run.simulatedSteps, 100);
  assert.equal(run.walkedSteps, 0);
  assert.deepEqual(run.healthLedger, {});
  for (const amount of [-1, 0.5, NaN, Infinity, 1000000001]) assert.throws(() => apply(run, { type: 'test-coins', amount }));
  run = apply(apply(apply(apply(apply(run, { type: 'cross' }), { type: 'accept' }), { type: 'arrive' }), { type: 'deliver' }), { type: 'settle' });
  assert.equal(run.sous, 127);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});
