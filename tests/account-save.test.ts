import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadAccountRun, saveAccountRun, resetAccountRun } from '../src/adapters/account-save.ts';
import { createRun } from '../src/domain/prologue.ts';
import { encodeSave, SAVE_KEY } from '../src/adapters/save.ts';

const first = '00000000-0000-4000-8000-000000000001';
const second = '00000000-0000-4000-8000-000000000002';
function storage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  } });
  return values;
}
test('legacy progress is claimed once, and each account has independent local saves', () => {
  const values = storage();
  values.set(SAVE_KEY, encodeSave(createRun(1200)));
  assert.equal(loadAccountRun(first)?.goal, 1200);
  assert.equal(loadAccountRun(second), null);
  saveAccountRun(second, createRun(2400));
  assert.equal(loadAccountRun(first)?.goal, 1200);
  assert.equal(loadAccountRun(second)?.goal, 2400);
  resetAccountRun(second);
  assert.equal(loadAccountRun(second), null);
  assert.equal(loadAccountRun(first)?.goal, 1200);
});
test('corrupt legacy data is preserved for its owner until explicit reset', () => {
  const values = storage();
  values.set(SAVE_KEY, '{unreadable');
  assert.throws(() => loadAccountRun(first));
  assert.equal(values.get(SAVE_KEY), '{unreadable');
  assert.equal(loadAccountRun(second), null);
  resetAccountRun(first);
  assert.equal(loadAccountRun(first), null);
});
