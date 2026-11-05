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
