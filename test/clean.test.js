'use strict';
// RCDEV-858: ttc clean (PD-0012). One test per AC-1 to AC-10.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-clean-'));
  const work = path.join(base, 'work');
  fs.mkdirSync(work);
  return { base, work, dataDir: path.join(base, 'data'), file: path.join(base, 'data', 'tasks.json') };
}

function ttc(sb, ...args) {
  const env = { PATH: process.env.PATH, HOME: path.join(sb.base, 'home'), TTC_HOME: sb.dataDir };
  return spawnSync(process.execPath, [BIN, ...args], { env, cwd: sb.work, encoding: 'utf8' });
}

// Runs ttc and asserts a success: exit 0, empty stderr. Returns stdout.
function ok(sb, ...args) {
  const r = ttc(sb, ...args);
  assert.equal(r.status, 0, args.join(' ') + ': ' + r.stderr);
  assert.equal(r.stderr, '', args.join(' '));
  return r.stdout;
}

function expectOk(sb, stdout, ...args) {
  assert.equal(ok(sb, ...args), stdout, args.join(' '));
}

function expectFail(sb, stderr, ...args) {
  const r = ttc(sb, ...args);
  assert.equal(r.status, 1, args.join(' '));
  assert.equal(r.stdout, '', args.join(' '));
  if (stderr instanceof RegExp) assert.match(r.stderr, stderr, args.join(' '));
  else assert.equal(r.stderr, stderr, args.join(' '));
}

const lines = (...ls) => ls.map((l) => l + '\n').join('');
const fileBytes = (sb) => fs.readFileSync(sb.file);

function writeStored(sb, text) {
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, text);
}

test('AC-1: clean removes the done tasks and leaves the open one', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Pay rent', '--important');
  ok(sb, 'add', 'Buy milk');
  ok(sb, 'add', 'Call mom');
  ok(sb, 'done', '1');
  ok(sb, 'done', '3');
  expectOk(sb, 'Removed 2 done tasks\n', 'clean');
  expectOk(sb, 'No tasks.\n', 'list', '--done');
  expectOk(sb, '#2 [ ] Buy milk\n', 'list', '--all');
  expectOk(sb, lines('open: 1', 'done: 0', 'overdue: 0'), 'stats');
});

test('AC-2: clean keeps every field of the open tasks', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Pay rent', '--due', '2099-12-30', '--tag', 'home', '--note', 'by card', '--important');
  ok(sb, 'add', 'Buy milk', '--due', '2099-06-01', '--tag', 'shop');
  ok(sb, 'add', 'Call mom');
  ok(sb, 'done', '3');
  ok(sb, 'export', 'before.json');
  expectOk(sb, 'Removed 1 done tasks\n', 'clean');
  ok(sb, 'export', 'after.json');
  const before = fs.readFileSync(path.join(sb.work, 'before.json'), 'utf8');
  const after = fs.readFileSync(path.join(sb.work, 'after.json'), 'utf8');
  const want = JSON.parse(before);
  want.tasks = want.tasks.filter((t) => t.id !== 3);
  assert.deepEqual(want.tasks.map((t) => t.id), [1, 2]);
  assert.deepEqual(JSON.parse(after), want);
});

test('AC-3: ids of removed tasks are not given again', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Task one');
  ok(sb, 'add', 'Task two');
  ok(sb, 'add', 'Task three');
  ok(sb, 'done', '1');
  ok(sb, 'done', '2');
  ok(sb, 'done', '3');
  expectOk(sb, 'Removed 3 done tasks\n', 'clean');
  expectOk(sb, 'Added task 4\n', 'add', 'New task');
  expectOk(sb, '#4 [ ] New task\n', 'list', '--all');
});

test('AC-4: nothing done leaves the file byte-for-byte unchanged', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Buy milk');
  const before = fileBytes(sb);
  expectOk(sb, 'Removed 0 done tasks\n', 'clean');
  assert.ok(fileBytes(sb).equals(before));
});

test('AC-5: a missing data folder stays missing', () => {
  const sb = sandbox();
  expectOk(sb, 'Removed 0 done tasks\n', 'clean');
  assert.equal(fs.existsSync(sb.file), false);
  assert.equal(fs.existsSync(sb.dataDir), false);
});

test('AC-6: a format version 3 file is upgraded when a task is removed', () => {
  const sb = sandbox();
  writeStored(
    sb,
    '{"version":3,"nextId":5,"tasks":[{"id":1,"title":"Pay rent","status":"done","due":null,"tags":[],"note":null},{"id":2,"title":"Buy milk","status":"open","due":null,"tags":[],"note":null}]}',
  );
  expectOk(sb, 'Removed 1 done tasks\n', 'clean');
  const text = fileBytes(sb).toString('utf8');
  assert.equal(JSON.parse(text).version, 4);
  assert.ok(text.includes('"version": 4'));
  expectOk(sb, '#2 [ ] Buy milk\n', 'list', '--all');
  expectOk(sb, 'Added task 5\n', 'add', 'Call mom');
});

test('AC-7: a format version 3 file with nothing to remove is not upgraded', () => {
  const sb = sandbox();
  writeStored(
    sb,
    '{"version":3,"nextId":2,"tasks":[{"id":1,"title":"Buy milk","status":"open","due":null,"tags":[],"note":null}]}',
  );
  const before = fileBytes(sb);
  expectOk(sb, 'Removed 0 done tasks\n', 'clean');
  assert.ok(fileBytes(sb).equals(before));
});

test('AC-8: clean refuses any argument or option and writes nothing', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Buy milk');
  ok(sb, 'add', 'Pay rent');
  ok(sb, 'done', '2');
  const before = fileBytes(sb);
  for (const a of [['2'], ['--all'], ['--done']]) {
    expectFail(sb, /^ttc: [^\n]*\n$/, 'clean', ...a);
    assert.ok(fileBytes(sb).equals(before), a.join(' '));
  }
});

test('AC-9: an unreadable data file fails and is left unchanged', () => {
  const sb = sandbox();
  writeStored(sb, 'not json');
  const before = fileBytes(sb);
  expectFail(sb, /^ttc: cannot read [^\n]*\n$/, 'clean');
  assert.ok(fileBytes(sb).equals(before));
});

test('AC-10: help lists clean right after delete', () => {
  const sb = sandbox();
  expectOk(
    sb,
    'Usage:\n' +
      lines(
        '  ttc help',
        '  ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]',
        '  ttc copy <id> [--due YYYY-MM-DD]',
        '  ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]',
        '  ttc done <id>',
        '  ttc reopen <id>',
        '  ttc important <id>',
        '  ttc unimportant <id>',
        '  ttc postpone <id>',
        '  ttc rename <id> "<title>"',
        '  ttc delete <id>',
        '  ttc clean',
        '  ttc tag <id> +<t> | -<t>',
        '  ttc note <id> ["<text>" | --clear]',
        '  ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]',
        '  ttc import <file>',
        '  ttc stats',
      ),
    'help',
  );
});
