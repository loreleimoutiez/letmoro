import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('manuscript imports require committed content and preserve divergent local files before replacement', () => {
  const root = mkdtempSync(join(tmpdir(), 'letmoro-manuscript-'));
  try {
    mkdirSync(join(root, 'scripts'));
    copyFileSync(new URL('../scripts/import-manuscript.mjs', import.meta.url), join(root, 'scripts/import-manuscript.mjs'));
    const source = join(root, '.manuscript');
    mkdirSync(source);
    const git = (...args: string[]) => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    git('init', '-b', 'main');
    git('config', 'user.name', 'Synthetic test');
    git('config', 'user.email', 'test@example.invalid');
    const localized = { job: 'Synthetic job', topics: {}, campaign: { letters: {} } };
    writeFileSync(join(source, 'opening.json'), JSON.stringify({ en: localized, fr: localized }));
    for (const name of ['tree.txt', 'skills-tree.txt', 'arc-one-continuation.md']) writeFileSync(join(source, name), 'Synthetic content');
    git('add', '.');
    git('commit', '-m', 'test: create synthetic manuscript');
    const run = (...args: string[]) => spawnSync(process.execPath, [join(root, 'scripts/import-manuscript.mjs'), ...args], { encoding: 'utf8' });
    assert.equal(run().status, 0);
    assert.equal(run('--check').status, 0);
    const target = join(root, 'src/content/private');
    assert.equal(JSON.parse(readFileSync(join(target, 'source-version.json'), 'utf8')).commit, git('rev-parse', 'HEAD').trim());
    writeFileSync(join(source, 'tree.txt'), 'Uncommitted edit');
    assert.notEqual(run().status, 0);
    assert.equal(readFileSync(join(target, 'tree.txt'), 'utf8'), 'Synthetic content');
    git('add', 'tree.txt');
    git('commit', '-m', 'test: change synthetic tree');
    assert.notEqual(run().status, 0);
    assert.notEqual(run('--check').status, 0);
    assert.equal(run('--replace').status, 0);
    const backups = readdirSync(join(root, '.manuscript-backups'));
    assert.equal(backups.length, 1);
    assert.equal(readFileSync(join(root, '.manuscript-backups', backups[0], 'tree.txt'), 'utf8'), 'Synthetic content');
    assert.equal(run('--check').status, 0);
    git('rm', 'opening.json');
    git('commit', '-m', 'test: remove required content');
    assert.notEqual(run('--replace').status, 0);
    assert.equal(readFileSync(join(target, 'tree.txt'), 'utf8'), 'Uncommitted edit');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
