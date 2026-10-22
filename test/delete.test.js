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
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-delete-'));
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

function task(id, title, status = 'open') {
  return { id, title, status, due: null, tags: [] };
}

function listS(status2 = 'open') {
  return {
    nextId: 4,
    tasks: [task(1, 'Buy milk'), task(2, 'Pay rent', status2), task(3, 'Read')],
  };
}

// Three tasks added with the real command in an empty sandbox.
function built() {
  const sb = sandbox();
  for (const title of ['Buy milk', 'Pay rent', 'Read']) {
    assert.equal(ttc(sb, 'add', title).status, 0);
  }
  return sb;
}

function assertFails(sb, args, line) {
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, 'delete', ...args);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  if (line !== undefined) assert.equal(r.stderr, line + '\n');
  else assert.match(r.stderr, /^ttc: [^\n]+\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
}

test('delete removes an open task and the others keep their ids (criterion 1)', () => {
  const sb = built();
  const r = ttc(sb, 'delete', '2');
  assert.equal(r.status, 0);
  assert.equal(r.stdout, 'Deleted task 2\n');
  assert.equal(r.stderr, '');
  assert.equal(ttc(sb, 'list', '--all').stdout, '#1 [ ] Buy milk\n#3 [ ] Read\n');
});

test('delete removes a done task (criterion 2)', () => {
  const sb = sandbox();
  seed(sb, listS('done'));
  const r = ttc(sb, 'delete', '2');
  assert.equal(r.status, 0);
  assert.equal(r.stdout, 'Deleted task 2\n');
  assert.equal(ttc(sb, 'list', '--all').stdout, '#1 [ ] Buy milk\n#3 [ ] Read\n');
});

test('deleting the same id twice fails the second time and changes nothing (criterion 3)', () => {
  const sb = sandbox();
  seed(sb, listS());
  assert.equal(ttc(sb, 'delete', '2').status, 0);
  assertFails(sb, ['2'], 'ttc: no task with id 2');
});

test('a deleted highest id is never given out again (criterion 4)', () => {
  const sb = built();
  assert.equal(ttc(sb, 'delete', '3').stdout, 'Deleted task 3\n');
  assert.equal(ttc(sb, 'add', 'New').stdout, 'Added task 4\n');
  assert.equal(ttc(sb, 'list', '--all').stdout, '#1 [ ] Buy milk\n#2 [ ] Pay rent\n#4 [ ] New\n');
});

test('deleting the only task keeps the counter (criterion 5)', () => {
  const sb = sandbox();
  assert.equal(ttc(sb, 'add', 'Only').stdout, 'Added task 1\n');
  assert.equal(ttc(sb, 'delete', '1').stdout, 'Deleted task 1\n');
  assert.equal(ttc(sb, 'list', '--all').stdout, 'No tasks.\n');
  assert.equal(ttc(sb, 'add', 'Next').stdout, 'Added task 2\n');
});

test('delete asks no confirmation (criterion 6)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk')] });
  const r = spawnSync(process.execPath, [BIN, 'delete', '1'], {
    env: envFor(sb),
    encoding: 'utf8',
    input: '',
    timeout: 10000,
  });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, 'Deleted task 1\n');
  assert.equal(r.stderr, '');
});

for (const arg of ['abc', '0', '-1', '1.5']) {
  test(`delete ${arg} is an invalid id (criterion 7)`, () => {
    const sb = sandbox();
    seed(sb, listS());
    assertFails(sb, [arg], 'ttc: invalid task id: ' + arg);
  });
}

test('delete of an unknown id fails and changes nothing (criterion 8)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk')] });
  assertFails(sb, ['7'], 'ttc: no task with id 7');
});

test('delete with no tasks.json fails and creates nothing (criterion 8)', () => {
  const sb = sandbox();
  const r = ttc(sb, 'delete', '7');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, 'ttc: no task with id 7\n');
  assert.equal(fs.existsSync(sb.file), false);
  assert.equal(fs.existsSync(sb.dataDir), false);
  assert.equal(fs.existsSync(path.join(sb.home, '.ttc')), false);
});

for (const args of [[], ['1', '2'], ['1', '--force']]) {
  test(`delete ${args.join(' ')} is a usage error (criterion 9)`, () => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk')] });
    assertFails(sb, args);
  });
}

test('delete on a broken tasks.json fails and leaves it alone (criterion 10)', () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, '{');
  const r = ttc(sb, 'delete', '1');
  const escaped = sb.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, new RegExp('^ttc: cannot read ' + escaped + ': .+\\n$'));
  assert.equal(fs.readFileSync(sb.file, 'utf8'), '{');
});

test('help lists the delete usage (criterion 11)', () => {
  const sb = sandbox();
  const r = ttc(sb, 'help');
  assert.equal(r.status, 0);
  const lines = r.stdout.split('\n').map((l) => l.trim());
  assert.ok(lines.includes('ttc help'));
  assert.ok(lines.includes('ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"]'));
  assert.ok(lines.includes('ttc delete <id>'));
  assert.ok(lines.some((l) => l.startsWith('ttc list [')));
});
