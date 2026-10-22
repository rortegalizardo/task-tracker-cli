'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

// A fresh home folder, data folder and working folder per call (C4).
function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-import-'));
  const work = path.join(base, 'work');
  fs.mkdirSync(work);
  const dataDir = path.join(base, 'data');
  return { base, work, dataDir, file: path.join(dataDir, 'tasks.json') };
}

function ttc(sb, args, dataDir = sb.dataDir) {
  const env = { PATH: process.env.PATH, HOME: path.join(sb.base, 'home'), TTC_HOME: dataDir };
  return spawnSync(process.execPath, [BIN, ...args], { env, cwd: sb.work, encoding: 'utf8' });
}

function seed(sb, list) {
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, JSON.stringify(list, null, 2) + '\n');
}

const KEEP = { nextId: 2, tasks: [{ id: 1, title: 'Keep', status: 'open', due: null, tags: [] }] };

// Makes <name> in the working folder by running `ttc add` for each title in a
// second TTC_HOME, then `ttc export`. Returns the exported text.
function exportFrom(sb, name, titles) {
  const other = path.join(sb.base, 'src-' + name);
  for (const t of titles) assert.equal(ttc(sb, ['add', t], other).status, 0);
  assert.equal(ttc(sb, ['export', name], other).status, 0);
  return fs.readFileSync(path.join(sb.work, name), 'utf8');
}

function listAll(sb) {
  const r = ttc(sb, ['list', '--all']);
  assert.equal(r.status, 0);
  return r.stdout;
}

function assertImported(r, n, file) {
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, 'Imported ' + n + ' tasks from ' + file + '\n');
}

// Failure with Keep stored: the exact invalid-import line shape, and
// tasks.json unchanged.
function assertInvalid(sb, text) {
  seed(sb, KEEP);
  const before = fs.readFileSync(sb.file);
  fs.writeFileSync(path.join(sb.work, 'bad.json'), text);
  const r = ttc(sb, ['import', 'bad.json']);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /^ttc: invalid import file bad\.json: .+\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
  return r;
}

// The exported One/Two list as text, with `change` applied to the parsed object.
function variant(sb, change) {
  const data = JSON.parse(exportFrom(sb, 'base.json', ['One', 'Two']));
  change(data);
  return JSON.stringify(data, null, 2) + '\n';
}

test('a list with a done task and next id 7 imports into a new home and keeps its next id (AC12)', () => {
  const sb = sandbox();
  const src = path.join(sb.base, 'src');
  fs.mkdirSync(src);
  const list = {
    nextId: 7,
    tasks: [
      { id: 1, title: 'Buy milk', status: 'open', due: null, tags: [] },
      { id: 2, title: 'Pay rent', status: 'done', due: '2099-12-31', tags: ['bills', 'home'] },
      { id: 3, title: 'Read', status: 'open', due: null, tags: [] },
    ],
  };
  fs.writeFileSync(path.join(src, 'tasks.json'), JSON.stringify(list, null, 2) + '\n');
  assert.equal(ttc(sb, ['export', 'backup.json'], src).status, 0);
  assert.equal(fs.existsSync(sb.dataDir), false);
  assertImported(ttc(sb, ['import', 'backup.json']), 3, 'backup.json');
  assert.equal(listAll(sb), '#1 [ ] Buy milk\n#2 [x] Pay rent due:2099-12-31 +bills +home\n#3 [ ] Read\n');
  assert.equal(ttc(sb, ['add', 'Fresh']).stdout, 'Added task 7\n');
});

test('import replaces the list and merges nothing (AC13)', () => {
  const sb = sandbox();
  for (const t of ['Old one', 'Old two']) ttc(sb, ['add', t]);
  const other = path.join(sb.base, 'other');
  ttc(sb, ['add', 'New'], other);
  ttc(sb, ['add', 'Second', '--tag', 'home'], other);
  assert.equal(ttc(sb, ['export', 'b.json'], other).status, 0);
  assertImported(ttc(sb, ['import', 'b.json']), 2, 'b.json');
  assert.equal(listAll(sb), '#1 [ ] New\n#2 [ ] Second +home\n');
});

test('import restores ids and the next id, and leaves the file alone (AC14)', () => {
  const sb = sandbox();
  for (const t of ['One', 'Two', 'Three']) ttc(sb, ['add', t]);
  assert.equal(ttc(sb, ['export', 'backup.json']).status, 0);
  const backup = fs.readFileSync(path.join(sb.work, 'backup.json'));
  assert.equal(ttc(sb, ['add', 'Four']).stdout, 'Added task 4\n');
  assertImported(ttc(sb, ['import', 'backup.json']), 3, 'backup.json');
  assert.equal(listAll(sb), '#1 [ ] One\n#2 [ ] Two\n#3 [ ] Three\n');
  assert.equal(ttc(sb, ['add', 'Four again']).stdout, 'Added task 4\n');
  assert.deepEqual(fs.readFileSync(path.join(sb.work, 'backup.json')), backup);
});

test('importing an empty list leaves no tasks (AC15)', () => {
  const sb = sandbox();
  for (const t of ['One', 'Two']) ttc(sb, ['add', t]);
  assert.equal(ttc(sb, ['export', 'empty.json'], path.join(sb.base, 'none')).status, 0);
  assertImported(ttc(sb, ['import', 'empty.json']), 0, 'empty.json');
  assert.equal(listAll(sb), 'No tasks.\n');
});

// AC16-AC23: each change to the exported One/Two list is refused as a whole.
const CHANGES = {
  'task 2 id 0 (AC16)': (d) => { d.tasks[1].id = 0; },
  'task 2 id -1 (AC16)': (d) => { d.tasks[1].id = -1; },
  'task 2 id 1.5 (AC16)': (d) => { d.tasks[1].id = 1.5; },
  'task 2 id equal to task 1 (AC16)': (d) => { d.tasks[1].id = 1; },
  'task 2 title empty (AC17)': (d) => { d.tasks[1].title = ''; },
  'task 2 title with a line break (AC17)': (d) => { d.tasks[1].title = 'a\nb'; },
  'task 2 status pending (AC18)': (d) => { d.tasks[1].status = 'pending'; },
  'task 2 status closed (AC18)': (d) => { d.tasks[1].status = 'closed'; },
  'task 2 due 2026-02-30 (AC19)': (d) => { d.tasks[1].due = '2026-02-30'; },
  'task 2 due 2026-1-5 (AC19)': (d) => { d.tasks[1].due = '2026-1-5'; },
  'task 2 due tomorrow (AC19)': (d) => { d.tasks[1].due = 'tomorrow'; },
  'tag with a space (AC20)': (d) => { d.tasks[1].tags = ['two words']; },
  'tag of 33 letters (AC20)': (d) => { d.tasks[1].tags = ['abcdefghijklmnopqrstuvwxyzabcdefa']; },
  'tag café (AC20)': (d) => { d.tasks[1].tags = ['café']; },
  'tag home twice (AC20)': (d) => { d.tasks[1].tags = ['home', 'home']; },
  'tag HOME (AC21)': (d) => { d.tasks[1].tags = ['HOME']; },
  'next id equal to the highest id (AC22)': (d) => { d.nextId = 2; },
  'next id lower than the highest id (AC22)': (d) => { d.nextId = 1; },
  'task 2 id 9007199254740992 (AC23)': (d) => { d.tasks[1].id = 9007199254740992; d.nextId = 9007199254740992; },
  'task 2 title with a tab (AC23)': (d) => { d.tasks[1].title = 'T\tw'; },
  'task 2 title with a space before (AC23)': (d) => { d.tasks[1].title = ' Two'; },
  'task 2 title with a space after (AC23)': (d) => { d.tasks[1].title = 'Two '; },
  'task 2 title three spaces (AC23)': (d) => { d.tasks[1].title = '   '; },
};

for (const [name, change] of Object.entries(CHANGES)) {
  test(`import refuses a file with ${name}`, () => {
    const sb = sandbox();
    assertInvalid(sb, variant(sb, change));
  });
}

test('import refuses next id 9007199254740993, which JSON.parse would round (AC23)', () => {
  const sb = sandbox();
  const text = variant(sb, () => {}).replace('"nextId": 3', '"nextId": 9007199254740993');
  assert.ok(text.includes('9007199254740993'));
  assertInvalid(sb, text);
});

for (const [name, text] of [['{', '{'], ['an empty file', ''], ['42', '42']]) {
  test(`import refuses a file holding ${name} (AC24)`, () => {
    assertInvalid(sandbox(), text);
  });
}

test('import reports only the first problem when there are two (AC25)', () => {
  const sb = sandbox();
  const r = assertInvalid(sb, variant(sb, (d) => { d.tasks[0].id = 0; d.tasks[1].status = 'pending'; }));
  assert.equal(r.stderr.trimEnd().split('\n').length, 1);
});

test('a refused file with no tasks.json creates neither tasks.json nor the folder (AC26)', () => {
  const sb = sandbox();
  fs.writeFileSync(path.join(sb.work, 'bad.json'), '{');
  const r = ttc(sb, ['import', 'bad.json']);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /^ttc: invalid import file bad\.json: .+\n$/);
  assert.equal(fs.existsSync(sb.file), false);
  assert.equal(fs.existsSync(sb.dataDir), false);
});

test('import replaces a tasks.json holding { (AC27)', () => {
  const sb = sandbox();
  exportFrom(sb, 'a.json', ['One', 'Two']);
  fs.mkdirSync(sb.dataDir);
  fs.writeFileSync(sb.file, '{');
  assertImported(ttc(sb, ['import', 'a.json']), 2, 'a.json');
  assert.equal(listAll(sb), '#1 [ ] One\n#2 [ ] Two\n');
});

test('import of a missing file fails and changes nothing (AC28)', () => {
  const sb = sandbox();
  seed(sb, KEEP);
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, ['import', 'nope.json']);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /^ttc: [^\n]+\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

test('the import path is relative to the working folder (AC29)', () => {
  const sb = sandbox();
  seed(sb, KEEP);
  const text = exportFrom(sb, 'one.json', ['One']);
  fs.mkdirSync(path.join(sb.work, 'sub'));
  fs.writeFileSync(path.join(sb.work, 'sub', 'a.json'), text);
  assertImported(ttc(sb, ['import', 'sub/a.json']), 1, 'sub/a.json');
  assert.equal(listAll(sb), '#1 [ ] One\n');
});

for (const args of [['import'], ['import', 'a.json', 'b.json'], ['import', 'a.json', '--force'], ['import', '--in']]) {
  test(`ttc ${args.join(' ')} is a one-line error (AC30)`, () => {
    const sb = sandbox();
    exportFrom(sb, 'a.json', ['One']);
    seed(sb, KEEP);
    const before = fs.readFileSync(sb.file);
    const r = ttc(sb, args);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.match(r.stderr, /^ttc: [^\n]+\n$/);
    assert.deepEqual(fs.readFileSync(sb.file), before);
  });
}

test('import of a version 1, a version 2 and a version 3 file all store version 3, and export -> import -> export is byte-identical (RCDEV-837, RCDEV-841)', () => {
  const body = { nextId: 3, tasks: [{ id: 2, title: 'Pay rent', status: 'done', due: '2099-12-31', tags: ['home'] }] };
  const v3 = { version: 3, nextId: 3, tasks: [{ ...body.tasks[0], note: 'bank, transfer' }] };
  for (const doc of [body, { version: 2, ...body }, v3]) {
    const sb = sandbox();
    fs.writeFileSync(path.join(sb.work, 'in.json'), JSON.stringify(doc, null, 2) + '\n');
    assertImported(ttc(sb, ['import', 'in.json']), 1, 'in.json');
    assert.ok(fs.readFileSync(sb.file, 'utf8').startsWith('{\n  "version": 3,\n'));
    assert.equal(ttc(sb, ['export', 'a.json']).status, 0);
    assertImported(ttc(sb, ['import', 'a.json']), 1, 'a.json');
    assert.equal(ttc(sb, ['export', 'b.json']).status, 0);
    const a = fs.readFileSync(path.join(sb.work, 'a.json'));
    assert.ok(a.toString().startsWith('{\n  "version": 3,\n'));
    assert.deepEqual(fs.readFileSync(path.join(sb.work, 'b.json')), a);
  }
});

test('a version 3 file whose note has a line break is refused as a whole (AC-5)', () => {
  const sb = sandbox();
  seed(sb, KEEP);
  const before = fs.readFileSync(sb.file);
  const doc = { version: 3, nextId: 2, tasks: [{ id: 1, title: 'Keep', status: 'open', due: null, tags: [], note: 'a\nb' }] };
  fs.writeFileSync(path.join(sb.work, 'bad.json'), JSON.stringify(doc, null, 2) + '\n');
  const r = ttc(sb, ['import', 'bad.json']);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /^ttc: invalid import file bad\.json: [^\n]+\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
});
