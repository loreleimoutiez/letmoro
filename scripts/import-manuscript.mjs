import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['opening.json', 'tree.txt', 'skills-tree.txt', 'arc-one-continuation.md'];
const args = process.argv.slice(2);
const replace = args.includes('--replace');
const check = args.includes('--check');
const paths = args.filter(arg => !arg.startsWith('--'));
if (paths.length > 1 || args.some(arg => arg.startsWith('--') && !['--replace', '--check'].includes(arg)) || (replace && check)) {
  throw new Error('Usage: npm run manuscript:import -- [repository] [--check | --replace]');
}
const source = realpathSync(resolve(paths[0] ?? join(root, '.manuscript')));
const target = join(root, 'src/content/private');
const git = (...args) => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim();
if (realpathSync(git('rev-parse', '--show-toplevel')) !== source) throw new Error('Source must be a separate repository root');
if (source === realpathSync(root) || source === (existsSync(target) ? realpathSync(target) : target)) throw new Error('Source must be separate from application content');
if (git('status', '--porcelain')) throw new Error('Commit manuscript changes before importing');
const commit = git('rev-parse', 'HEAD');
const buffers = new Map();
const hashes = {};
for (const name of files) {
  git('ls-files', '--error-unmatch', '--', name);
  const path = join(source, name);
  if (!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()) throw new Error(`Expected regular manuscript file: ${name}`);
  const bytes = readFileSync(path);
  buffers.set(name, bytes);
  hashes[name] = createHash('sha256').update(bytes).digest('hex');
}
const pack = JSON.parse(buffers.get('opening.json').toString('utf8'));
for (const locale of ['en', 'fr']) {
  if (!pack[locale] || typeof pack[locale].job !== 'string' || !pack[locale].topics || !pack[locale].campaign?.letters) {
    throw new Error(`Missing opening content for ${locale}`);
  }
}
if (existsSync(target) && lstatSync(target).isSymbolicLink()) throw new Error('Target cannot be a symbolic link');
const changed = files.filter(name => existsSync(join(target, name)) && !readFileSync(join(target, name)).equals(buffers.get(name)));
if (check) {
  if (changed.length || files.some(name => !existsSync(join(target, name)))) throw new Error('Local content differs from the manuscript commit');
  console.log(`All four local files match manuscript commit ${commit}.`);
} else {
  if (changed.length && !replace) throw new Error('Local content differs. Commit local edits in the manuscript repository, or use --replace to back up and replace the local files.');
  if (changed.length) {
    const backup = join(root, '.manuscript-backups', randomUUID());
    mkdirSync(backup, { recursive: true, mode: 0o700 });
    for (const name of [...files, 'source-version.json']) if (existsSync(join(target, name))) copyFileSync(join(target, name), join(backup, name));
    console.log(`Previous local content preserved in ${backup}`);
  }
  mkdirSync(target, { recursive: true });
  for (const [name, bytes] of buffers) writeFileSync(join(target, name), bytes);
  writeFileSync(join(target, 'source-version.json'), `${JSON.stringify({ commit, sha256: hashes }, null, 2)}\n`);
  console.log(`Imported four files from manuscript commit ${commit}. Provenance: src/content/private/source-version.json`);
}
