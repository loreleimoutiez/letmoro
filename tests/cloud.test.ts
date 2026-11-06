import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconcileCloud, snapshotFingerprint } from '../src/domain/cloud.ts';

test('cloud reconciliation restores clean devices but never silently overwrites divergent progress', () => {
  assert.equal(reconcileCloud('local', null, 0, null, false), 'upload');
  assert.equal(reconcileCloud('same', 'same', 3, null, false), 'equal');
  assert.equal(reconcileCloud('empty', 'remote', 3, null, true), 'restore');
  assert.equal(reconcileCloud('local', 'remote', 3, null, false), 'conflict');
  assert.equal(reconcileCloud('clean', 'remote', 4, { revision: 3, fingerprint: 'clean' }, false), 'restore');
  assert.equal(reconcileCloud('edited', 'remote', 3, { revision: 3, fingerprint: 'previous' }, false), 'upload');
  assert.equal(reconcileCloud('edited', 'remote', 4, { revision: 3, fingerprint: 'previous' }, false), 'conflict');
  assert.equal(reconcileCloud('reset', 'remote', 4, { revision: 3, fingerprint: 'previous' }, true), 'conflict');
  assert.equal(reconcileCloud('local', null, 0, { revision: 3, fingerprint: 'local' }, false), 'conflict');
});

test('sync fingerprints distinguish resets, language changes and save changes', async () => {
  assert.equal(await snapshotFingerprint('{"schema":1}', 'en'), await snapshotFingerprint('{ "schema": 1 }', 'en'));
  assert.equal(await snapshotFingerprint('{"b":{"y":1,"x":2},"a":0}', 'en'), await snapshotFingerprint('{"a":0,"b":{"x":2,"y":1}}', 'en'));
  assert.notEqual(await snapshotFingerprint(null, 'en'), await snapshotFingerprint('{"schema":1}', 'en'));
  assert.notEqual(await snapshotFingerprint(null, 'en'), await snapshotFingerprint(null, 'fr'));
});
