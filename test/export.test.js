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

for (const args of [['export', 'a.json', 'b.json'], ['export', 'a.json', '--force'], ['export', '--out']]) {
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

// RCDEV-840: filters, --format and stdout.

// Stored out of id order, tags out of order, so stored-order output is visible.
const OUT_OF_ORDER = { nextId: 5, tasks: [
  { id: 3, title: 'Third', status: 'open', due: '2026-01-15', tags: ['work', 'home'] },
  { id: 1, title: 'First', status: 'done', due: null, tags: ['home'] },
  { id: 4, title: 'Fourth', status: 'open', due: null, tags: [] },
] };

function canonical(list) {
  return JSON.stringify({ version: 2, nextId: list.nextId, tasks: list.tasks }, null, 2) + '\n';
}

function listing(dir) {
  return fs.readdirSync(dir).sort();
}

test('export with no file prints the whole list as tasks.json text and writes no file (AC-2)', () => {
  const sb = sandbox();
  seed(sb, OUT_OF_ORDER);
  const r = ttc(sb, ['export']);
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, canonical(OUT_OF_ORDER));
  assert.deepEqual(listing(sb.work), []);
});

test('export <file> with no option writes the stored list byte for byte and import restores it (AC-1)', () => {
  const sb = sandbox();
  seed(sb, OUT_OF_ORDER);
  assertExported(ttc(sb, ['export', 'backup.json']), 3, 'backup.json');
  assert.equal(fs.readFileSync(path.join(sb.work, 'backup.json'), 'utf8'), canonical(OUT_OF_ORDER));
  const other = path.join(sb.base, 'other');
  const imported = ttc(sb, ['import', 'backup.json'], other);
  assert.equal(imported.status, 0);
  assert.equal(ttc(sb, ['list', '--all'], other).stdout, ttc(sb, ['list', '--all']).stdout);
});

test('stdout of export imported into another home gives the same export (round trip)', () => {
  const sb = sandbox();
  seed(sb, OUT_OF_ORDER);
  const first = ttc(sb, ['export']);
  fs.writeFileSync(path.join(sb.work, 'copy.json'), first.stdout);
  const other = path.join(sb.base, 'other');
  assert.equal(ttc(sb, ['import', 'copy.json'], other).status, 0);
  assert.equal(fs.readFileSync(path.join(other, 'tasks.json'), 'utf8'), first.stdout);
});

test('export --format csv --tag home --open prints the header and the open home rows in id order (AC-3)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 6, tasks: [
    { id: 4, title: 'Open home', status: 'open', due: null, tags: ['home'] },
    { id: 2, title: 'Done home', status: 'done', due: null, tags: ['home'] },
    { id: 5, title: 'Open other', status: 'open', due: null, tags: ['other'] },
    { id: 1, title: 'Another open home', status: 'open', due: '2026-02-01', tags: ['work', 'home'] },
  ] });
  const r = ttc(sb, ['export', '--format', 'csv', '--tag', 'home', '--open']);
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(
    r.stdout,
    'id,title,status,due,tags\r\n1,Another open home,open,2026-02-01,home work\r\n4,Open home,open,,home\r\n',
  );
});

test('export <file> --format csv with a due range and a search writes only the matches (AC-5)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 7, tasks: [
    { id: 1, title: 'Pay rent', status: 'open', due: '2026-01-05', tags: [] },
    { id: 2, title: 'Pay rent late', status: 'done', due: '2026-02-05', tags: [] },
    { id: 3, title: 'Buy milk', status: 'open', due: '2026-01-10', tags: [] },
    { id: 4, title: 'Rent car', status: 'open', due: null, tags: [] },
    { id: 5, title: 'Rent bike', status: 'done', due: '2026-01-31', tags: ['fun'] },
    { id: 6, title: 'Rent old', status: 'open', due: '2025-12-31', tags: [] },
  ] });
  const r = ttc(sb, ['export', 'out.csv', '--format', 'csv', '--due-from', '2026-01-01', '--due-to', '2026-01-31', '--search', 'rent']);
  assertExported(r, 2, 'out.csv');
  assert.equal(
    fs.readFileSync(path.join(sb.work, 'out.csv'), 'utf8'),
    'id,title,status,due,tags\r\n1,Pay rent,open,2026-01-05,\r\n5,Rent bike,done,2026-01-31,fun\r\n',
  );
});

test('export --done prints a valid tasks.json with only the done tasks and the original nextId', () => {
  const sb = sandbox();
  seed(sb, OUT_OF_ORDER);
  const r = ttc(sb, ['export', '--done']);
  assert.equal(r.status, 0);
  assert.equal(r.stdout, canonical({ nextId: 5, tasks: [OUT_OF_ORDER.tasks[1]] }));
});

test('export --format xml fails with the invalid-format line (AC-6)', () => {
  const sb = sandbox();
  assertFails(sb, ['export', '--format', 'xml'], 'ttc: invalid format: xml (use json or csv)');
  assert.deepEqual(listing(sb.work), []);
});

test('export --format is case-sensitive', () => {
  const sb = sandbox();
  assertFails(sb, ['export', '--format', 'CSV'], 'ttc: invalid format: CSV (use json or csv)');
});

test('export with a bad date fails and writes nothing (AC-6)', () => {
  const sb = sandbox();
  assertFails(sb, ['export', '--due-from', '2026-13-01'], 'ttc: invalid date: 2026-13-01');
  assert.deepEqual(listing(sb.work), []);
});

test('export into a missing folder fails and leaves the work folder unchanged (AC-6)', () => {
  const sb = sandbox();
  assertFails(sb, ['export', 'missing-folder/out.json']);
  assert.deepEqual(listing(sb.work), []);
});

test('export --format given twice and with no value are one-line errors', () => {
  const sb = sandbox();
  assertFails(sb, ['export', '--format', 'csv', '--format', 'json'], 'ttc: option given twice: --format');
  assertFails(sb, ['export', '--format'], 'ttc: option needs a value: --format');
  assert.deepEqual(listing(sb.work), []);
});

test('export - writes a file named - (not stdout)', () => {
  const sb = sandbox();
  seed(sb, MILK);
  assertExported(ttc(sb, ['export', '-']), 1, '-');
  assert.ok(fs.existsSync(path.join(sb.work, '-')));
});
