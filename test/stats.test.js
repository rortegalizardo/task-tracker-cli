'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

// A fresh home folder and data folder per call (C4). The data folder is nested
// and missing, so a stray write shows up.
function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-stats-'));
  const dataDir = path.join(base, 'nested', 'data');
  return { base, dataDir, home: path.join(base, 'home'), file: path.join(dataDir, 'tasks.json') };
}

// The zone is pinned from the test side (C3).
function ttc(sb, tz, ...args) {
  const env = { PATH: process.env.PATH, HOME: sb.home, TTC_HOME: sb.dataDir, TZ: tz };
  return spawnSync(process.execPath, [BIN, ...args], { env, encoding: 'utf8' });
}

function seed(sb, list) {
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, JSON.stringify(list, null, 2) + '\n');
}

function task(id, title, status, due, tags = []) {
  return { id, title, status, due, tags };
}

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

const UTC = 'UTC';

// Runs body(today, yesterday, tomorrow) for the date in `timeZone`; if the date
// changes while it runs, runs it once more (midnight guard).
function withDates(timeZone, body) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const today = dateIn(timeZone);
    body(today, shift(today, -1), shift(today, 1));
    if (dateIn(timeZone) === today) return;
  }
}

// Success: exact stdout, empty stderr, exit 0.
function assertOut(r, stdout) {
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, stdout);
}

const counts = (open, done, overdue) => `open: ${open}\ndone: ${done}\noverdue: ${overdue}\n`;

function add(sb, ...args) {
  assert.equal(ttc(sb, UTC, 'add', ...args).status, 0);
}

function lines(r) {
  assert.equal(r.status, 0);
  return r.stdout.split('\n').filter((l) => l !== '');
}

test('an empty list prints zeros and creates nothing (criterion 1)', () => {
  const sb = sandbox();
  assertOut(ttc(sb, UTC, 'stats'), counts(0, 0, 0));
  assert.equal(fs.existsSync(sb.dataDir), false);
  assert.equal(fs.existsSync(sb.file), false);
  assert.equal(fs.existsSync(path.join(sb.home, '.ttc')), false);
});

test('three added, one done counts 2 open and 1 done (criterion 2)', () => {
  const sb = sandbox();
  for (const t of ['A', 'B', 'C']) add(sb, t);
  assert.equal(ttc(sb, UTC, 'done', '2').status, 0);
  assertOut(ttc(sb, UTC, 'stats'), counts(2, 1, 0));
});

test('reopen moves a task back to open (criterion 3)', () => {
  const sb = sandbox();
  for (const t of ['A', 'B', 'C']) add(sb, t);
  assert.equal(ttc(sb, UTC, 'done', '2').status, 0);
  assert.equal(ttc(sb, UTC, 'reopen', '2').status, 0);
  assertOut(ttc(sb, UTC, 'stats'), counts(3, 0, 0));
});

test('overdue counts open tasks due before today and matches list --overdue (criterion 4)', () => {
  withDates(UTC, (today, yesterday, tomorrow) => {
    const sb = sandbox();
    add(sb, 'A', '--due', yesterday);
    add(sb, 'B', '--due', today);
    add(sb, 'C', '--due', tomorrow);
    add(sb, 'D');
    add(sb, 'E', '--due', yesterday);
    assert.equal(ttc(sb, UTC, 'done', '5').status, 0);
    assertOut(ttc(sb, UTC, 'stats'), counts(4, 1, 1));
    assert.equal(lines(ttc(sb, UTC, 'list')).length, 4);
    assert.equal(lines(ttc(sb, UTC, 'list', '--done')).length, 1);
    assert.equal(lines(ttc(sb, UTC, 'list', '--overdue')).length, 1);
  });
});

test('overdue tasks are also counted as open (criterion 5)', () => {
  withDates(UTC, (today, yesterday) => {
    const sb = sandbox();
    add(sb, 'A', '--due', '2020-01-01');
    add(sb, 'B', '--due', yesterday);
    assertOut(ttc(sb, UTC, 'stats'), counts(2, 0, 2));
  });
});

test('counts are plain numbers with more than nine tasks (criterion 6)', () => {
  const sb = sandbox();
  for (let i = 1; i <= 12; i++) add(sb, 'T' + i);
  assert.equal(ttc(sb, UTC, 'done', '1').status, 0);
  assert.equal(ttc(sb, UTC, 'done', '2').status, 0);
  assertOut(ttc(sb, UTC, 'stats'), counts(10, 2, 0));
});

test('overdue uses the local date of the process time zone (criterion 7)', () => {
  const west = 'Pacific/Pago_Pago';
  const east = 'Pacific/Kiritimati';
  withDates(west, (d) => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Pay rent', 'open', d)] });
    assertOut(ttc(sb, west, 'stats'), counts(1, 0, 0));
    assertOut(ttc(sb, east, 'stats'), counts(1, 0, 1));
  });
});

test('stats twice prints the same and never changes the file (criterion 8)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 3, tasks: [task(1, 'A', 'open', '2020-01-01'), task(2, 'B', 'done', null)] });
  const before = fs.readFileSync(sb.file);
  const first = ttc(sb, UTC, 'stats');
  assertOut(first, counts(1, 1, 1));
  assertOut(ttc(sb, UTC, 'stats'), first.stdout);
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

for (const arg of ['now', '--all', '--json']) {
  test(`stats ${arg} is a one-line error and changes nothing (criterion 9)`, () => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'A', 'open', null)] });
    const before = fs.readFileSync(sb.file);
    const r = ttc(sb, UTC, 'stats', arg);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.match(r.stderr, /^ttc: [^\n]+\n$/);
    assert.deepEqual(fs.readFileSync(sb.file), before);
  });
}

test('stats now with no tasks.json is an error and creates nothing (criterion 9)', () => {
  const sb = sandbox();
  const r = ttc(sb, UTC, 'stats', 'now');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /^ttc: [^\n]+\n$/);
  assert.equal(fs.existsSync(sb.file), false);
  assert.equal(fs.existsSync(sb.dataDir), false);
});

test('an unreadable tasks.json fails and is left as it is (criterion 10)', () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, '{');
  const r = ttc(sb, UTC, 'stats');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  const escaped = sb.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(r.stderr, new RegExp('^ttc: cannot read ' + escaped + ': .+\\n$'));
  assert.equal(fs.readFileSync(sb.file, 'utf8'), '{');
});

test('ttc help lists ttc stats and the other usages (criterion 11)', () => {
  const r = ttc(sandbox(), UTC, 'help');
  assert.equal(r.status, 0);
  const out = r.stdout.split('\n').map((l) => l.trim());
  for (const usage of [
    'ttc stats',
    'ttc help',
    'ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]',
    'ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]',
    'ttc done <id>',
    'ttc reopen <id>',
  ]) {
    assert.ok(out.includes(usage), usage);
  }
});
