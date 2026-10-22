'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

// A fresh home folder and data folder per call (C4).
function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-rename-'));
  const dataDir = path.join(base, 'data');
  return { base, dataDir, home: path.join(base, 'home'), file: path.join(dataDir, 'tasks.json') };
}

function envFor(sb) {
  return { PATH: process.env.PATH, HOME: sb.home, TTC_HOME: sb.dataDir };
}

function ttc(sb, ...args) {
  return spawnSync(process.execPath, [BIN, ...args], { env: envFor(sb), encoding: 'utf8' });
}

function seed(sb, list) {
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, JSON.stringify(list, null, 2) + '\n');
}

const BASE = { nextId: 2, tasks: [{ id: 1, title: 'Buy milk', status: 'open', due: null, tags: [] }] };

// Success: rename task 1 to `title`, then `ttc list` shows it.
function assertRenamed(title, shown) {
  const sb = sandbox();
  seed(sb, BASE);
  const r = ttc(sb, 'rename', '1', title);
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, 'Renamed task 1\n');
  const l = ttc(sb, 'list');
  assert.equal(l.status, 0);
  assert.equal(l.stdout, '#1 [ ] ' + shown + '\n');
}

// Failure on the base list: exit 1, nothing on stdout, one stderr line (the
// exact line when given), and tasks.json unchanged.
function assertFails(args, line) {
  const sb = sandbox();
  seed(sb, BASE);
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, 'rename', ...args);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  if (line !== undefined) assert.equal(r.stderr, line + '\n');
  else assert.match(r.stderr, /^ttc: [^\n]+\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
}

test('rename 1 "Buy oat milk" prints Renamed task 1 and list shows it (criterion 1)', () => {
  assertRenamed('Buy oat milk', 'Buy oat milk');
});

test('renaming to the same title succeeds and changes nothing (criterion 2)', () => {
  const sb = sandbox();
  seed(sb, BASE);
  const before = ttc(sb, 'list', '--all').stdout;
  const r = ttc(sb, 'rename', '1', 'Buy milk');
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, 'Renamed task 1\n');
  assert.equal(ttc(sb, 'list', '--all').stdout, before);
});

test('spaces around the title are removed (criterion 3)', () => {
  assertRenamed('  Buy oat milk  ', 'Buy oat milk');
});

test('inner double spaces and non-ASCII letters are kept (criterion 4)', () => {
  assertRenamed('Café  au lait 牛乳', 'Café  au lait 牛乳');
});

for (const [name, title] of [
  ['LF at the end', 'Buy milk\n'],
  ['CR at the end', 'Buy milk\r'],
  ['a line break inside', 'Buy\nmilk'],
  ['an empty title', ''],
  ['spaces only', '   '],
]) {
  test(`a title that is not one non-empty line fails: ${JSON.stringify(name)} (criterion 5)`, () => {
    assertFails(['1', title], 'ttc: title must be one non-empty line');
  });
}

for (const [name, title] of [
  ['a tab', 'Buy \t milk'],
  ['a bell', 'Buy milk\u0007'],
]) {
  test(`a title with ${name} fails (criteria 6 and 7)`, () => {
    assertFails(['1', title], 'ttc: title must not contain control characters');
  });
}

test('only the title of the named task changes (criterion 8)', () => {
  const sb = sandbox();
  seed(sb, {
    nextId: 4,
    tasks: [
      { id: 1, title: 'Buy milk', status: 'open', due: null, tags: [] },
      { id: 2, title: 'Pay rent', status: 'done', due: '2099-12-31', tags: ['bills', 'home'] },
      { id: 3, title: 'Read', status: 'open', due: null, tags: [] },
    ],
  });
  const r = ttc(sb, 'rename', '2', 'Pay landlord');
  assert.equal(r.status, 0);
  assert.equal(r.stdout, 'Renamed task 2\n');
  assert.equal(
    ttc(sb, 'list', '--all').stdout,
    '#1 [ ] Buy milk\n#2 [x] Pay landlord due:2099-12-31 +bills +home\n#3 [ ] Read\n',
  );
});

for (const arg of ['abc', '0', '-1', '1.5']) {
  test(`rename ${arg} fails with invalid task id (criterion 9)`, () => {
    assertFails([arg, 'New'], 'ttc: invalid task id: ' + arg);
  });
}

test('an id that does not exist fails and changes nothing (criterion 10)', () => {
  assertFails(['7', 'New'], 'ttc: no task with id 7');
  const sb = sandbox();
  const r = ttc(sb, 'rename', '7', 'New');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, 'ttc: no task with id 7\n');
  assert.equal(fs.existsSync(sb.file), false);
});

for (const args of [[], ['1'], ['1', 'a', 'b'], ['1', 'New', '--force'], ['1', '--new']]) {
  test(`rename ${JSON.stringify(args)} fails on the arguments (criterion 11)`, () => {
    assertFails(args);
  });
}

test('an unreadable tasks.json fails and stays as it is (criterion 12)', () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, '{');
  const r = ttc(sb, 'rename', '1', 'New');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  const escaped = sb.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(r.stderr, new RegExp('^ttc: cannot read ' + escaped + ': .+\\n$'));
  assert.equal(fs.readFileSync(sb.file, 'utf8'), '{');
});

test('ttc help lists the rename usage line (criterion 13)', () => {
  const r = ttc(sandbox(), 'help');
  assert.equal(r.status, 0);
  const lines = r.stdout.split('\n').map((l) => l.trim());
  assert.ok(lines.includes('ttc help'));
  assert.ok(lines.includes('ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"]'));
  assert.ok(lines.includes('ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]'));
  assert.ok(lines.includes('ttc rename <id> "<title>"'));
});
