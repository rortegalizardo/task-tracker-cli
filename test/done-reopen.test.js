'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');
const COMMANDS = ['done', 'reopen'];

// A fresh home folder and data folder per call (C4).
function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-status-'));
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

function task(id, title, status, due = null, tags = []) {
  return { id, title, status, due, tags };
}

function assertOk(r, stdout) {
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, stdout);
}

// Failure: exit 1, nothing on stdout, one stderr line (exact when given).
function assertFailed(r, line) {
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  if (line !== undefined) assert.equal(r.stderr, line + '\n');
  else assert.match(r.stderr, /^ttc: [^\n]+\n$/);
}

test('done marks the task done (criterion 1)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk', 'open')] });
  assertOk(ttc(sb, 'done', '1'), 'Completed task 1\n');
  assertOk(ttc(sb, 'list', '--all'), '#1 [x] Buy milk\n');
  assertOk(ttc(sb, 'list'), 'No tasks.\n');
});

test('done on a done task says so and changes nothing (criterion 2)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk', 'done')] });
  const before = ttc(sb, 'list', '--all').stdout;
  const bytes = fs.readFileSync(sb.file);
  assertOk(ttc(sb, 'done', '1'), 'Task 1 is already done\n');
  assert.equal(ttc(sb, 'list', '--all').stdout, before);
  assert.deepEqual(fs.readFileSync(sb.file), bytes);
});

test('reopen marks the task open (criterion 3)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk', 'done')] });
  assertOk(ttc(sb, 'reopen', '1'), 'Reopened task 1\n');
  assertOk(ttc(sb, 'list'), '#1 [ ] Buy milk\n');
});

test('reopen on an open task says so and changes nothing (criterion 4)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk', 'open')] });
  const before = ttc(sb, 'list', '--all').stdout;
  const bytes = fs.readFileSync(sb.file);
  assertOk(ttc(sb, 'reopen', '1'), 'Task 1 is already open\n');
  assert.equal(ttc(sb, 'list', '--all').stdout, before);
  assert.deepEqual(fs.readFileSync(sb.file), bytes);
});

test('done and reopen change only the named task (criterion 5)', () => {
  const sb = sandbox();
  assertOk(ttc(sb, 'add', 'Buy milk'), 'Added task 1\n');
  assertOk(ttc(sb, 'add', 'Pay rent', '--due', '2099-12-31', '--tag', 'bills'), 'Added task 2\n');
  assertOk(ttc(sb, 'add', 'Read'), 'Added task 3\n');
  assertOk(ttc(sb, 'done', '2'), 'Completed task 2\n');
  assertOk(
    ttc(sb, 'list', '--all'),
    '#1 [ ] Buy milk\n#2 [x] Pay rent due:2099-12-31 +bills\n#3 [ ] Read\n',
  );
  assertOk(ttc(sb, 'reopen', '2'), 'Reopened task 2\n');
  assertOk(
    ttc(sb, 'list', '--all'),
    '#1 [ ] Buy milk\n#2 [ ] Pay rent due:2099-12-31 +bills\n#3 [ ] Read\n',
  );
});

for (const cmd of COMMANDS) {
  for (const arg of ['abc', '0', '-1', '1.5']) {
    test(`${cmd} ${arg} is an invalid id (criterion 6)`, () => {
      const sb = sandbox();
      seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk', 'open')] });
      const before = fs.readFileSync(sb.file);
      assertFailed(ttc(sb, cmd, arg), 'ttc: invalid task id: ' + arg);
      assert.deepEqual(fs.readFileSync(sb.file), before);
    });
  }
}

test('done 007 is task 7 (criterion 7)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 8, tasks: [task(7, 'Buy milk', 'open')] });
  assertOk(ttc(sb, 'done', '007'), 'Completed task 7\n');
  assertOk(ttc(sb, 'list', '--all'), '#7 [x] Buy milk\n');
});

for (const cmd of COMMANDS) {
  test(`${cmd} 9007199254740992 is an invalid id (criterion 8)`, () => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk', 'open')] });
    const before = fs.readFileSync(sb.file);
    assertFailed(ttc(sb, cmd, '9007199254740992'), 'ttc: invalid task id: 9007199254740992');
    assert.deepEqual(fs.readFileSync(sb.file), before);
  });
}

for (const cmd of COMMANDS) {
  test(`${cmd} 7 with no such task fails and creates nothing (criterion 9)`, () => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk', 'open')] });
    const before = fs.readFileSync(sb.file);
    assertFailed(ttc(sb, cmd, '7'), 'ttc: no task with id 7');
    assert.deepEqual(fs.readFileSync(sb.file), before);

    const empty = sandbox();
    assertFailed(ttc(empty, cmd, '7'), 'ttc: no task with id 7');
    assert.equal(fs.existsSync(empty.dataDir), false);
    assert.equal(fs.existsSync(empty.file), false);
  });
}

for (const cmd of COMMANDS) {
  for (const args of [[], ['1', '2'], ['1', '--force']]) {
    test(`${cmd} ${args.join(' ')} breaks the argument rules (criterion 10)`, () => {
      const sb = sandbox();
      seed(sb, { nextId: 2, tasks: [task(1, 'Buy milk', 'open')] });
      const before = fs.readFileSync(sb.file);
      assertFailed(ttc(sb, cmd, ...args));
      assert.deepEqual(fs.readFileSync(sb.file), before);
    });
  }
}

for (const cmd of COMMANDS) {
  test(`${cmd} 1 with an unreadable tasks.json fails (criterion 11)`, () => {
    const sb = sandbox();
    fs.mkdirSync(sb.dataDir, { recursive: true });
    fs.writeFileSync(sb.file, '{');
    const escaped = sb.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const r = ttc(sb, cmd, '1');
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.match(r.stderr, new RegExp('^ttc: cannot read ' + escaped + ': .+\\n$'));
    assert.equal(fs.readFileSync(sb.file, 'utf8'), '{');
  });
}

test('help lists done and reopen after the earlier commands (criterion 12)', () => {
  const sb = sandbox();
  const r = ttc(sb, 'help');
  assert.equal(r.status, 0);
  const lines = r.stdout.split('\n').map((l) => l.trim());
  const at = (pred) => lines.findIndex(pred);
  const idx = {
    help: at((l) => l.startsWith('ttc help')),
    add: at((l) => l.startsWith('ttc add ')),
    list: at((l) => l.startsWith('ttc list ')),
    done: at((l) => l === 'ttc done <id>'),
    reopen: at((l) => l === 'ttc reopen <id>'),
  };
  for (const [name, i] of Object.entries(idx)) assert.notEqual(i, -1, name + ' usage line');
  assert.ok(idx.list < idx.done && idx.done < idx.reopen);
});
