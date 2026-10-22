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
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-overdue-'));
  const dataDir = path.join(base, 'data');
  return { base, dataDir, home: path.join(base, 'home'), file: path.join(dataDir, 'tasks.json') };
}

// The zone is pinned from the test side (C3).
function envFor(sb, tz) {
  return { PATH: process.env.PATH, HOME: sb.home, TTC_HOME: sb.dataDir, TZ: tz };
}

function ttc(sb, tz, ...args) {
  return spawnSync(process.execPath, [BIN, ...args], { env: envFor(sb, tz), encoding: 'utf8' });
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

test('an open task due yesterday is marked !overdue (AC1)', () => {
  withDates(UTC, (today, yesterday) => {
    const sb = sandbox();
    assert.equal(ttc(sb, UTC, 'add', 'Pay rent', '--due', yesterday).status, 0);
    assertOut(ttc(sb, UTC, 'list'), `#1 [ ] Pay rent due:${yesterday} !overdue\n`);
  });
});

test('an open task due today is not overdue (AC2)', () => {
  withDates(UTC, (today) => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Pay rent', 'open', today)] });
    assertOut(ttc(sb, UTC, 'list'), `#1 [ ] Pay rent due:${today}\n`);
  });
});

test('an open task due tomorrow is not overdue (AC3)', () => {
  withDates(UTC, (today, yesterday, tomorrow) => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Pay rent', 'open', tomorrow)] });
    assertOut(ttc(sb, UTC, 'list'), `#1 [ ] Pay rent due:${tomorrow}\n`);
  });
});

test('a done task is never overdue (AC4)', () => {
  withDates(UTC, (today, yesterday) => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Pay rent', 'open', yesterday)] });
    assert.equal(ttc(sb, UTC, 'done', '1').status, 0);
    const line = `#1 [x] Pay rent due:${yesterday}\n`;
    assertOut(ttc(sb, UTC, 'list', '--done'), line);
    assertOut(ttc(sb, UTC, 'list', '--all'), line);
  });
});

test('an open task with no due date is not overdue (AC5)', () => {
  withDates(UTC, () => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Pay rent', 'open', null)] });
    assertOut(ttc(sb, UTC, 'list'), '#1 [ ] Pay rent\n');
  });
});

test('the marker comes after the due date and before the tags (AC6)', () => {
  withDates(UTC, (today, yesterday) => {
    const sb = sandbox();
    const a = ttc(sb, UTC, 'add', 'Pay rent', '--due', yesterday, '--tag', 'home', '--tag', 'bills');
    assert.equal(a.status, 0);
    assertOut(ttc(sb, UTC, 'list'), `#1 [ ] Pay rent due:${yesterday} !overdue +bills +home\n`);
  });
});

test('done drops the marker and reopen brings it back (AC7)', () => {
  withDates(UTC, (today, yesterday) => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Pay rent', 'open', yesterday)] });
    assert.equal(ttc(sb, UTC, 'done', '1').status, 0);
    assertOut(ttc(sb, UTC, 'list', '--all'), `#1 [x] Pay rent due:${yesterday}\n`);
    assert.equal(ttc(sb, UTC, 'reopen', '1').status, 0);
    assertOut(ttc(sb, UTC, 'list', '--all'), `#1 [ ] Pay rent due:${yesterday} !overdue\n`);
  });
});

test('the marker shows in every list view (AC8)', () => {
  withDates(UTC, (today, yesterday) => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Pay rent', 'open', yesterday, ['home'])] });
    const line = `#1 [ ] Pay rent due:${yesterday} !overdue +home\n`;
    for (const args of [[], ['--open'], ['--all'], ['--tag', 'home']]) {
      assertOut(ttc(sb, UTC, 'list', ...args), line);
    }
  });
});

// The five tasks of AC9 and AC10; task 3 is marked done with `ttc done 3`.
function seedFive(sb, yesterday, today) {
  seed(sb, {
    nextId: 6,
    tasks: [
      task(1, 'A', 'open', yesterday, ['home']),
      task(2, 'B', 'open', today),
      task(3, 'C', 'open', yesterday),
      task(4, 'D', 'open', null),
      task(5, 'E', 'open', '2020-01-01', ['work']),
    ],
  });
  assert.equal(ttc(sb, UTC, 'done', '3').status, 0);
}

test('list --overdue shows only the overdue tasks in id order (AC9)', () => {
  withDates(UTC, (today, yesterday) => {
    const sb = sandbox();
    seedFive(sb, yesterday, today);
    assertOut(
      ttc(sb, UTC, 'list', '--overdue'),
      `#1 [ ] A due:${yesterday} !overdue +home\n#5 [ ] E due:2020-01-01 !overdue +work\n`,
    );
  });
});

test('list --overdue combines with --tag in either order (AC10)', () => {
  withDates(UTC, (today, yesterday) => {
    const sb = sandbox();
    seedFive(sb, yesterday, today);
    assertOut(
      ttc(sb, UTC, 'list', '--overdue', '--tag', 'home'),
      `#1 [ ] A due:${yesterday} !overdue +home\n`,
    );
    assertOut(
      ttc(sb, UTC, 'list', '--tag', 'work', '--overdue'),
      '#5 [ ] E due:2020-01-01 !overdue +work\n',
    );
  });
});

test('list --overdue with nothing overdue prints No tasks. (AC11)', () => {
  withDates(UTC, (today) => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'B', 'open', today)] });
    assertOut(ttc(sb, UTC, 'list', '--overdue'), 'No tasks.\n');
  });
});

test('list --overdue with no tasks.json prints No tasks. and creates nothing (AC11)', () => {
  const sb = sandbox();
  assertOut(ttc(sb, UTC, 'list', '--overdue'), 'No tasks.\n');
  assert.equal(fs.existsSync(sb.dataDir), false);
  assert.equal(fs.existsSync(path.join(sb.home, '.ttc')), false);
});

for (const args of [
  ['--overdue', '--open'],
  ['--open', '--overdue'],
  ['--overdue', '--done'],
  ['--all', '--overdue'],
  ['--overdue', '--overdue'],
]) {
  test(`list ${args.join(' ')} fails and leaves tasks.json unchanged (AC12)`, () => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'A', 'open', '2020-01-01')] });
    const before = fs.readFileSync(sb.file);
    const r = ttc(sb, UTC, 'list', ...args);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.match(r.stderr, /^ttc: [^\n]+\n$/);
    assert.deepEqual(fs.readFileSync(sb.file), before);
  });
}

test('today is the local date of the process time zone, not the UTC date (AC13)', () => {
  const west = 'Pacific/Pago_Pago';
  const east = 'Pacific/Kiritimati';
  withDates(west, (d) => {
    const sb = sandbox();
    seed(sb, { nextId: 2, tasks: [task(1, 'Pay rent', 'open', d)] });
    assertOut(ttc(sb, west, 'list'), `#1 [ ] Pay rent due:${d}\n`);
    assertOut(ttc(sb, east, 'list'), `#1 [ ] Pay rent due:${d} !overdue\n`);
  });
});

test('list --overdue with an unreadable tasks.json fails and leaves it as it is (AC14)', () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, '{');
  const r = ttc(sb, UTC, 'list', '--overdue');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  const escaped = sb.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(r.stderr, new RegExp('^ttc: cannot read ' + escaped + ': .+\\n$'));
  assert.equal(fs.readFileSync(sb.file, 'utf8'), '{');
});

test('ttc help lists the new list usage line and not the old one (AC15)', () => {
  const r = ttc(sandbox(), UTC, 'help');
  assert.equal(r.status, 0);
  const lines = r.stdout.split('\n').map((l) => l.trim());
  assert.ok(lines.includes('ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]'));
  assert.ok(!lines.includes('ttc list [--open|--done|--all] [--tag <t>]'));
  assert.ok(lines.includes('ttc help'));
  assert.ok(lines.includes('ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...'));
  assert.ok(lines.includes('ttc done <id>'));
  assert.ok(lines.includes('ttc reopen <id>'));
});
