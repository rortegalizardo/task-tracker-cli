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
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-tag-'));
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

// A sandbox seeded with task 1 `Buy milk` holding the given tags.
function withMilk(tags) {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [{ id: 1, title: 'Buy milk', status: 'open', due: null, tags }] });
  return sb;
}

// Success: exact stdout, empty stderr, exit 0.
function assertOk(r, stdout) {
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, stdout);
}

// Failure: exit 1, nothing on stdout, one stderr line (the exact line when
// given), and tasks.json equal to the bytes seeded.
function assertFailsUnchanged(sb, before, r, line) {
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  if (line !== undefined) assert.equal(r.stderr, line + '\n');
  else assert.match(r.stderr, /^ttc: [^\n]+\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
}

function listOut(sb, ...args) {
  const r = ttc(sb, 'list', ...args);
  assert.equal(r.status, 0);
  return r.stdout;
}

// A no-op prints its line, exits 0, and leaves tasks.json byte-for-byte as it was.
function assertNoOp(tags, arg, stdout) {
  const sb = withMilk(tags);
  const before = fs.readFileSync(sb.file);
  const listBefore = listOut(sb, '--all');
  assertOk(ttc(sb, 'tag', '1', arg), stdout);
  assert.equal(listOut(sb, '--all'), listBefore);
  assert.deepEqual(fs.readFileSync(sb.file), before);
}

test('tag +home adds a tag to a task without tags (criterion 1)', () => {
  const sb = withMilk([]);
  assertOk(ttc(sb, 'tag', '1', '+home'), 'Added tag home to task 1\n');
  assert.equal(listOut(sb), '#1 [ ] Buy milk +home\n');
});

test('tag +bills lists the tags alphabetically (criterion 2)', () => {
  const sb = withMilk(['home']);
  assertOk(ttc(sb, 'tag', '1', '+bills'), 'Added tag bills to task 1\n');
  assert.equal(listOut(sb), '#1 [ ] Buy milk +bills +home\n');
});

test('tag +home on a task holding home is a no-op (criterion 3)', () => {
  assertNoOp(['home'], '+home', 'Task 1 already has tag home\n');
});

test('tag -home removes one of two tags (criterion 4)', () => {
  const sb = withMilk(['bills', 'home']);
  assertOk(ttc(sb, 'tag', '1', '-home'), 'Removed tag home from task 1\n');
  assert.equal(listOut(sb), '#1 [ ] Buy milk +bills\n');
});

test('removing the last tag leaves no tags (criterion 5)', () => {
  const sb = withMilk(['home']);
  assertOk(ttc(sb, 'tag', '1', '-home'), 'Removed tag home from task 1\n');
  assert.equal(listOut(sb), '#1 [ ] Buy milk\n');
  assert.equal(listOut(sb, '--tag', 'home'), 'No tasks.\n');
});

test('tag -bills on a task without bills is a no-op (criterion 6)', () => {
  assertNoOp(['home'], '-bills', 'Task 1 has no tag bills\n');
});

test('tag -home on a task without tags is a no-op (criterion 7)', () => {
  assertNoOp([], '-home', 'Task 1 has no tag home\n');
});

test('add then remove shows in list --tag (criterion 8)', () => {
  const sb = withMilk([]);
  assertOk(ttc(sb, 'tag', '1', '+home'), 'Added tag home to task 1\n');
  assert.equal(listOut(sb, '--tag', 'home'), '#1 [ ] Buy milk +home\n');
  assertOk(ttc(sb, 'tag', '1', '-home'), 'Removed tag home from task 1\n');
  assert.equal(listOut(sb, '--tag', 'home'), 'No tasks.\n');
});

test('tag +HOME stores the tag in lower case (criterion 9)', () => {
  const sb = withMilk([]);
  assertOk(ttc(sb, 'tag', '1', '+HOME'), 'Added tag home to task 1\n');
  assert.equal(listOut(sb), '#1 [ ] Buy milk +home\n');
});

test('tag +HOME on a task holding home adds no second tag (criterion 10)', () => {
  const sb = withMilk(['home']);
  assertOk(ttc(sb, 'tag', '1', '+HOME'), 'Task 1 already has tag home\n');
  assert.equal(listOut(sb), '#1 [ ] Buy milk +home\n');
});

test('tag -HOME removes home (criterion 11)', () => {
  const sb = withMilk(['home']);
  assertOk(ttc(sb, 'tag', '1', '-HOME'), 'Removed tag home from task 1\n');
  assert.equal(listOut(sb, '--all'), '#1 [ ] Buy milk\n');
});

for (const t of ['a', 'abcdefghijklmnopqrstuvwxyzabcdef', 'my-tag_2', '2026']) {
  test(`tag +${t} is a valid tag (criterion 12)`, () => {
    const sb = withMilk([]);
    assertOk(ttc(sb, 'tag', '1', '+' + t), `Added tag ${t} to task 1\n`);
  });
}

for (const t of ['abcdefghijklmnopqrstuvwxyzabcdefa', 'two words', 'café', 'a.b']) {
  for (const sign of ['+', '-']) {
    test(`tag ${sign}${t} fails with invalid tag (criterion 13)`, () => {
      const sb = withMilk(['home']);
      const before = fs.readFileSync(sb.file);
      assertFailsUnchanged(sb, before, ttc(sb, 'tag', '1', sign + t), 'ttc: invalid tag: ' + t);
    });
  }
}

test('tag +_x fails with invalid tag (criterion 14)', () => {
  const sb = withMilk(['home']);
  const before = fs.readFileSync(sb.file);
  assertFailsUnchanged(sb, before, ttc(sb, 'tag', '1', '+_x'), 'ttc: invalid tag: _x');
});

test('tag on a done task changes only its tags (criterion 15)', () => {
  const sb = sandbox();
  seed(sb, {
    nextId: 2,
    tasks: [{ id: 1, title: 'Pay rent', status: 'done', due: '2099-12-31', tags: ['bills'] }],
  });
  assertOk(ttc(sb, 'tag', '1', '+home'), 'Added tag home to task 1\n');
  assert.equal(listOut(sb, '--all'), '#1 [x] Pay rent due:2099-12-31 +bills +home\n');
  assertOk(ttc(sb, 'tag', '1', '-bills'), 'Removed tag bills from task 1\n');
  assert.equal(listOut(sb, '--all'), '#1 [x] Pay rent due:2099-12-31 +home\n');
});

test('tag changes only the named task (criterion 16)', () => {
  const sb = sandbox();
  assert.equal(ttc(sb, 'add', 'Buy milk').status, 0);
  assert.equal(ttc(sb, 'add', 'Pay rent', '--due', '2099-12-31', '--tag', 'bills').status, 0);
  assert.equal(ttc(sb, 'add', 'Read').status, 0);
  assertOk(ttc(sb, 'tag', '2', '+home'), 'Added tag home to task 2\n');
  assert.equal(
    listOut(sb, '--all'),
    '#1 [ ] Buy milk\n#2 [ ] Pay rent due:2099-12-31 +bills +home\n#3 [ ] Read\n',
  );
});

for (const arg of ['abc', '0', '-1', '1.5']) {
  test(`tag ${arg} +home fails with invalid task id (criterion 17)`, () => {
    const sb = withMilk(['home']);
    const before = fs.readFileSync(sb.file);
    assertFailsUnchanged(sb, before, ttc(sb, 'tag', arg, '+home'), 'ttc: invalid task id: ' + arg);
  });
}

for (const arg of ['+home', '-home']) {
  test(`tag 7 ${arg} fails with no task with id 7 (criterion 18)`, () => {
    const sb = withMilk(['home']);
    const before = fs.readFileSync(sb.file);
    assertFailsUnchanged(sb, before, ttc(sb, 'tag', '7', arg), 'ttc: no task with id 7');

    const empty = sandbox();
    const r = ttc(empty, 'tag', '7', arg);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.equal(r.stderr, 'ttc: no task with id 7\n');
    assert.equal(fs.existsSync(empty.file), false);
  });
}

for (const args of [
  [],
  ['1'],
  ['1', '+a', '+b'],
  ['1', '+a', '-b'],
  ['1', '+home', '--force'],
  ['1', 'home'],
  ['1', '--home'],
  ['1', '+'],
  ['1', '-'],
]) {
  test(`tag ${args.join(' ')} fails (criterion 19)`, () => {
    const sb = withMilk(['home']);
    const before = fs.readFileSync(sb.file);
    assertFailsUnchanged(sb, before, ttc(sb, 'tag', ...args));
  });
}

for (const arg of ['+home', '-home']) {
  test(`tag 1 ${arg} on an unreadable tasks.json fails (criterion 20)`, () => {
    const sb = sandbox();
    fs.mkdirSync(sb.dataDir, { recursive: true });
    fs.writeFileSync(sb.file, '{');
    const r = ttc(sb, 'tag', '1', arg);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    const escaped = sb.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(r.stderr, new RegExp('^ttc: cannot read ' + escaped + ': .+\\n$'));
    assert.equal(fs.readFileSync(sb.file, 'utf8'), '{');
  });
}

test('ttc help lists the tag usage line (criterion 21)', () => {
  const r = ttc(sandbox(), 'help');
  assert.equal(r.status, 0);
  const lines = r.stdout.split('\n').map((l) => l.trim());
  assert.ok(lines.includes('ttc help'));
  assert.ok(lines.includes('ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"]'));
  assert.ok(lines.includes('ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]'));
  assert.ok(lines.includes('ttc tag <id> +<t> | -<t>'));
});
