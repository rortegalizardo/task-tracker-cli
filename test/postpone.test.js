'use strict';
// RCDEV-857: ttc postpone (PD-0011). One test per AC-1 to AC-12.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');
const UTC = 'UTC';

function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-postpone-'));
  const work = path.join(base, 'work');
  fs.mkdirSync(work);
  return { base, work, dataDir: path.join(base, 'data'), file: path.join(base, 'data', 'tasks.json') };
}

// The zone is pinned from the test side (C7).
function ttc(sb, ...args) {
  const env = { PATH: process.env.PATH, HOME: path.join(sb.base, 'home'), TTC_HOME: sb.dataDir, TZ: UTC };
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

// The local date in `timeZone`, as YYYY-MM-DD.
function dateIn(timeZone, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

// The calendar date `days` away from `date`, moved by whole days on its parts.
function shift(date, days) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

// Runs body(today, tomorrow) for the date in `timeZone`; if the date changes
// while it runs, runs it once more (midnight guard).
function withDates(timeZone, body) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const today = dateIn(timeZone);
    body(today, shift(today, 1));
    if (dateIn(timeZone) === today) return;
  }
}

test('AC-1: postpone moves the due date one day', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Pay rent', '--due', '2099-12-30');
  expectOk(sb, 'Postponed task 1 to 2099-12-31\n', 'postpone', '1');
  expectOk(sb, '#1 [ ] Pay rent due:2099-12-31\n', 'list');
});

test('AC-2: an overdue task moves to tomorrow', () => {
  withDates(UTC, (today, tomorrow) => {
    const sb = sandbox();
    ok(sb, 'add', 'Pay rent', '--due', '2000-01-01');
    expectOk(sb, `Postponed task 1 to ${tomorrow}\n`, 'postpone', '1');
    expectOk(sb, `#1 [ ] Pay rent due:${tomorrow}\n`, 'list');
    expectOk(sb, 'No tasks.\n', 'list', '--overdue');
  });
});

test('AC-3: a task due today moves to tomorrow', () => {
  withDates(UTC, (today, tomorrow) => {
    const sb = sandbox();
    ok(sb, 'add', 'Pay rent', '--due', today);
    expectOk(sb, `Postponed task 1 to ${tomorrow}\n`, 'postpone', '1');
  });
});

test('AC-4: month, year and leap-day rollover', () => {
  const sb = sandbox();
  for (const due of ['2096-02-28', '2099-02-28', '2099-12-31', '2100-02-28']) ok(sb, 'add', 'Pay rent', '--due', due);
  expectOk(sb, 'Postponed task 1 to 2096-02-29\n', 'postpone', '1');
  expectOk(sb, 'Postponed task 2 to 2099-03-01\n', 'postpone', '2');
  expectOk(sb, 'Postponed task 3 to 2100-01-01\n', 'postpone', '3');
  expectOk(sb, 'Postponed task 4 to 2100-03-01\n', 'postpone', '4');
});

test('AC-5: postpone works on a done task', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Pay rent', '--due', '2099-12-30');
  ok(sb, 'done', '1');
  expectOk(sb, 'Postponed task 1 to 2099-12-31\n', 'postpone', '1');
  expectOk(sb, '#1 [x] Pay rent due:2099-12-31\n', 'list', '--done');
});

test('AC-6: only the due date changes', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Pay rent', '--due', '2099-12-30', '--tag', 'home', '--note', 'by card', '--important');
  ok(sb, 'add', 'Buy milk', '--due', '2099-06-01');
  ok(sb, 'export', 'before.json');
  ok(sb, 'postpone', '1');
  ok(sb, 'export', 'after.json');
  const before = fs.readFileSync(path.join(sb.work, 'before.json'), 'utf8');
  const after = fs.readFileSync(path.join(sb.work, 'after.json'), 'utf8');
  assert.notEqual(after, before);
  assert.equal(after, before.replace('"due": "2099-12-30"', '"due": "2099-12-31"'));
});

test('AC-7: a task with no due date is refused', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Buy milk');
  const before = fileBytes(sb);
  expectFail(sb, 'ttc: task 1 has no due date\n', 'postpone', '1');
  assert.ok(fileBytes(sb).equals(before));
});

test('AC-8: a task due 9999-12-31 is refused', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Pay rent', '--due', '9999-12-31');
  const before = fileBytes(sb);
  expectFail(sb, 'ttc: task 1 cannot be postponed past 9999-12-31\n', 'postpone', '1');
  assert.ok(fileBytes(sb).equals(before));
});

test('AC-9: an invalid or unknown id is refused', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Pay rent', '--due', '2099-12-30');
  const before = fileBytes(sb);
  expectFail(sb, 'ttc: invalid task id: abc\n', 'postpone', 'abc');
  expectFail(sb, 'ttc: no task with id 7\n', 'postpone', '7');
  assert.ok(fileBytes(sb).equals(before));
});

test('AC-10: an extra argument or option is refused', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Pay rent', '--due', '2099-12-30');
  const before = fileBytes(sb);
  expectFail(sb, /^ttc: [^\n]*\n$/, 'postpone', '1', '2');
  expectFail(sb, /^ttc: [^\n]*\n$/, 'postpone', '1', '--days', '2');
  assert.ok(fileBytes(sb).equals(before));
});

test('AC-11: postpone rewrites a version 3 file as version 4', () => {
  const sb = sandbox();
  const v3 = {
    version: 3,
    nextId: 2,
    tasks: [{ id: 1, title: 'Pay rent', status: 'open', due: '2099-12-30', tags: [], note: null }],
  };
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, JSON.stringify(v3, null, 2) + '\n');
  expectOk(sb, 'Postponed task 1 to 2099-12-31\n', 'postpone', '1');
  assert.equal(JSON.parse(fileBytes(sb).toString('utf8')).version, 4);
  expectOk(sb, '#1 [ ] Pay rent due:2099-12-31\n', 'list');
});

test('AC-12: help lists postpone after unimportant', () => {
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
