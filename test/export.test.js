'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');
const INTERRUPTED_EXPORT = path.join(__dirname, 'fixtures', 'interrupted-export.js');

// A fresh home folder, data folder and working folder per call (C4).
function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-export-'));
  const work = path.join(base, 'work');
  fs.mkdirSync(work);
  const dataDir = path.join(base, 'data');
  return { base, work, dataDir, file: path.join(dataDir, 'tasks.json') };
}

function envFor(sb, dataDir = sb.dataDir) {
  return { PATH: process.env.PATH, HOME: path.join(sb.base, 'home'), TTC_HOME: dataDir };
}

function ttc(sb, args, dataDir) {
  return spawnSync(process.execPath, [BIN, ...args], { env: envFor(sb, dataDir), cwd: sb.work, encoding: 'utf8' });
}

function seed(sb, list) {
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, JSON.stringify(list, null, 2) + '\n');
}

const MILK = { nextId: 2, tasks: [{ id: 1, title: 'Buy milk', status: 'open', due: null, tags: [] }] };
const THREE = { nextId: 4, tasks: [
  { id: 1, title: 'Buy milk', status: 'open', due: null, tags: [] },
  { id: 2, title: 'Pay rent', status: 'open', due: '2099-12-31', tags: ['bills'] },
  { id: 3, title: 'Read', status: 'open', due: null, tags: [] },
] };

function assertExported(r, n, file) {
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, 'Exported ' + n + ' tasks to ' + file + '\n');
}

// Failure: exit 1, nothing on stdout, one stderr line, tasks.json unchanged.
function assertFails(sb, args, line) {
  seed(sb, MILK);
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, args);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  if (line !== undefined) assert.equal(r.stderr, line + '\n');
  else assert.match(r.stderr, /^ttc: [^\n]+\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
  return r;
}

test('export writes backup.json to the working folder and leaves tasks.json (AC1)', () => {
  const sb = sandbox();
  seed(sb, THREE);
  const before = fs.readFileSync(sb.file);
  assertExported(ttc(sb, ['export', 'backup.json']), 3, 'backup.json');
  assert.ok(fs.existsSync(path.join(sb.work, 'backup.json')));
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

test('the exported file works as a tasks.json (AC2)', () => {
  const sb = sandbox();
  seed(sb, THREE);
  assertExported(ttc(sb, ['export', 'backup.json']), 3, 'backup.json');
  const other = path.join(sb.base, 'other');
  fs.mkdirSync(other);
  fs.copyFileSync(path.join(sb.work, 'backup.json'), path.join(other, 'tasks.json'));
  const r = ttc(sb, ['list', '--all'], other);
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '#1 [ ] Buy milk\n#2 [ ] Pay rent due:2099-12-31 +bills\n#3 [ ] Read\n');
});

test('a done task is counted and one task still says tasks (AC3)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [{ id: 1, title: 'Pay rent', status: 'done', due: '2099-12-31', tags: [] }] });
  assertExported(ttc(sb, ['export', 'backup.json']), 1, 'backup.json');
});

test('export with no list writes an empty list and creates no tasks.json or folder (AC4)', () => {
  const sb = sandbox();
  assertExported(ttc(sb, ['export', 'empty.json']), 0, 'empty.json');
  assert.ok(fs.existsSync(path.join(sb.work, 'empty.json')));
  assert.equal(fs.existsSync(sb.file), false);
  assert.equal(fs.existsSync(sb.dataDir), false);
});

test('export replaces an existing file whole (AC5)', () => {
  const sb = sandbox();
  seed(sb, MILK);
  fs.writeFileSync(path.join(sb.work, 'backup.json'), 'old');
  assertExported(ttc(sb, ['export', 'backup.json']), 1, 'backup.json');
  assert.notEqual(fs.readFileSync(path.join(sb.work, 'backup.json'), 'utf8'), 'old');
  const other = path.join(sb.base, 'other');
  const r = ttc(sb, ['import', 'backup.json'], other);
  assert.equal(r.status, 0);
  assert.equal(ttc(sb, ['list', '--all'], other).stdout, '#1 [ ] Buy milk\n');
});

test('export over a symlink makes a regular file and leaves the target (AC6)', () => {
  const sb = sandbox();
  seed(sb, MILK);
  fs.writeFileSync(path.join(sb.work, 'real.json'), 'old');
  fs.symlinkSync('real.json', path.join(sb.work, 'backup.json'));
  assertExported(ttc(sb, ['export', 'backup.json']), 1, 'backup.json');
  assert.equal(fs.lstatSync(path.join(sb.work, 'backup.json')).isSymbolicLink(), false);
  assert.equal(fs.readFileSync(path.join(sb.work, 'real.json'), 'utf8'), 'old');
});

test('a relative path is resolved against the working folder, not TTC_HOME (AC7)', () => {
  const sb = sandbox();
  seed(sb, MILK);
  fs.mkdirSync(path.join(sb.work, 'out'));
  assertExported(ttc(sb, ['export', 'out/backup.json']), 1, 'out/backup.json');
  assert.ok(fs.existsSync(path.join(sb.work, 'out', 'backup.json')));
  assert.equal(fs.existsSync(path.join(sb.dataDir, 'backup.json')), false);
});

test('export into a missing folder fails and creates nothing (AC8)', () => {
  const sb = sandbox();
  assertFails(sb, ['export', 'nope/backup.json']);
  assert.equal(fs.existsSync(path.join(sb.work, 'nope')), false);
});

test('export onto a folder fails (AC9)', () => {
  const sb = sandbox();
  fs.mkdirSync(path.join(sb.work, 'dir'));
  assertFails(sb, ['export', 'dir']);
  assert.deepEqual(fs.readdirSync(path.join(sb.work, 'dir')), []);
});

for (const args of [['export'], ['export', 'a.json', 'b.json'], ['export', 'a.json', '--force'], ['export', '--out']]) {
  test(`ttc ${args.join(' ')} is a one-line error (AC10)`, () => {
    const sb = sandbox();
    assertFails(sb, args);
    assert.equal(fs.existsSync(path.join(sb.work, 'a.json')), false);
  });
}

test('an unreadable stored list fails with the cannot-read line (AC11)', () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir);
  fs.writeFileSync(sb.file, '{');
  const r = ttc(sb, ['export', 'backup.json']);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, new RegExp('^ttc: cannot read ' + sb.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ': [^\\n]+\\n$'));
  assert.equal(fs.readFileSync(sb.file, 'utf8'), '{');
  assert.equal(fs.existsSync(path.join(sb.work, 'backup.json')), false);
});

function interrupt(sb, step) {
  const r = spawnSync(process.execPath, [INTERRUPTED_EXPORT, step], { env: envFor(sb), cwd: sb.work, encoding: 'utf8' });
  // The kill must really have cut the write off.
  assert.equal(r.signal, 'SIGKILL', 'step ' + step + ' did not fire: ' + r.stderr);
}

// Export creates no folder, so there is no after-mkdir step.
for (const step of ['after-open', 'mid-write', 'after-fsync', 'before-rename']) {
  test(`an export killed at ${step} keeps the old backup.json (AC32)`, () => {
    const sb = sandbox();
    seed(sb, MILK);
    fs.writeFileSync(path.join(sb.work, 'backup.json'), 'old');
    interrupt(sb, step);
    assert.equal(fs.readFileSync(path.join(sb.work, 'backup.json'), 'utf8'), 'old');
  });

  test(`an export killed at ${step} leaves no backup.json when there was none (AC33)`, () => {
    const sb = sandbox();
    seed(sb, MILK);
    interrupt(sb, step);
    assert.equal(fs.existsSync(path.join(sb.work, 'backup.json')), false);
  });
}
