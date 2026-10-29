'use strict';
// RCDEV-859: copy command workflows from AC-1 through AC-13 (PD-0013).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

function sandbox(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-copy-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const work = path.join(base, 'work');
  fs.mkdirSync(work);
  return { base, work, dataDir: path.join(base, 'data'), file: path.join(base, 'data', 'tasks.json') };
}

function ttc(sb, ...args) {
  const env = { PATH: process.env.PATH, HOME: path.join(sb.base, 'home'), TTC_HOME: sb.dataDir, TZ: 'UTC' };
  return spawnSync(process.execPath, [BIN, ...args], { env, cwd: sb.work, encoding: 'utf8' });
}

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
const stored = (sb) => JSON.parse(fileBytes(sb).toString('utf8'));
const exported = (sb, name) => JSON.parse(fs.readFileSync(path.join(sb.work, name), 'utf8'));

test('AC-1–2: copy a done, important task without changing existing tasks or stored tag order', (t) => {
  const sb = sandbox(t);
  ok(sb, 'add', 'Pay rent', '--due', '2099-10-01', '--tag', 'home', '--tag', 'bills', '--note', 'by card', '--important');
  ok(sb, 'add', 'Buy milk');
  ok(sb, 'done', '1');
  ok(sb, 'export', 'before.json');
  expectOk(sb, 'Copied task 1 as task 3\n', 'copy', '1');
  ok(sb, 'export', 'after.json');

  const before = exported(sb, 'before.json');
  const after = exported(sb, 'after.json');
  assert.deepEqual(after, {
    version: 4,
    nextId: 4,
    tasks: [...before.tasks, {
      id: 3, title: 'Pay rent', status: 'open', due: '2099-10-01',
      tags: ['home', 'bills'], note: 'by card', important: true,
    }],
  });
  assert.equal(after.tasks[0].status, 'done');
  assert.deepEqual(stored(sb), after);
  expectOk(sb, lines('#3 [ ] Pay rent due:2099-10-01 !important +bills +home', '#2 [ ] Buy milk'), 'list');
});

test('AC-3: due override accepts both option positions, the date limit and past dates', (t) => {
  const sb = sandbox(t);
  ok(sb, 'add', 'Pay rent', '--due', '2020-01-01', '--tag', 'bills');
  const before = stored(sb);
  expectOk(sb, 'Copied task 1 as task 2\n', 'copy', '1', '--due', '2099-11-01');
  expectOk(sb, 'Copied task 1 as task 3\n', 'copy', '--due', '9999-12-31', '1');
  expectOk(sb, 'Copied task 1 as task 4\n', 'copy', '1', '--due', '2021-06-01');
  assert.deepEqual(stored(sb), {
    version: 4,
    nextId: 5,
    tasks: [before.tasks[0], ...['2099-11-01', '9999-12-31', '2021-06-01'].map((due, i) => ({
      ...before.tasks[0], id: i + 2, due,
    }))],
  });
  expectOk(sb, lines(
    '#1 [ ] Pay rent due:2020-01-01 !overdue +bills',
    '#2 [ ] Pay rent due:2099-11-01 +bills',
    '#3 [ ] Pay rent due:9999-12-31 +bills',
    '#4 [ ] Pay rent due:2021-06-01 !overdue +bills',
  ), 'list', '--all');
});

test('AC-4–5: copy retains overdue dates and null fields, or adds a due date', (t) => {
  const overdue = sandbox(t);
  ok(overdue, 'add', 'Pay rent', '--due', '2020-01-01');
  const source = stored(overdue).tasks[0];
  expectOk(overdue, 'Copied task 1 as task 2\n', 'copy', '1');
  assert.deepEqual(stored(overdue), { version: 4, nextId: 3, tasks: [source, { ...source, id: 2 }] });
  expectOk(overdue, lines(
    '#1 [ ] Pay rent due:2020-01-01 !overdue',
    '#2 [ ] Pay rent due:2020-01-01 !overdue',
  ), 'list', '--overdue');

  const undated = sandbox(t);
  ok(undated, 'add', 'Call mom');
  expectOk(undated, 'Copied task 1 as task 2\n', 'copy', '1');
  expectOk(undated, 'Copied task 1 as task 3\n', 'copy', '1', '--due', '2099-01-01');
  const task = { id: 1, title: 'Call mom', status: 'open', due: null, tags: [], note: null, important: false };
  assert.deepEqual(stored(undated), {
    version: 4, nextId: 4,
    tasks: [task, { ...task, id: 2 }, { ...task, id: 3, due: '2099-01-01' }],
  });
  expectOk(undated, lines('#1 [ ] Call mom', '#2 [ ] Call mom', '#3 [ ] Call mom due:2099-01-01'), 'list');
});

test('AC-6: copy normalizes the source id and allocates from nextId after deletion', (t) => {
  const sb = sandbox(t);
  ok(sb, 'add', 'Pay rent');
  ok(sb, 'add', 'Buy milk');
  ok(sb, 'add', 'Call mom');
  ok(sb, 'delete', '3');
  const before = stored(sb);
  expectOk(sb, 'Copied task 2 as task 4\n', 'copy', '002');
  assert.deepEqual(stored(sb), {
    version: 4, nextId: 5,
    tasks: [...before.tasks, { ...before.tasks[1], id: 4 }],
  });
  expectOk(sb, 'Added task 5\n', 'add', 'Water plants');
});

test('AC-7: id exhaustion refuses without a write, after source lookup', (t) => {
  const sb = sandbox(t);
  fs.mkdirSync(sb.dataDir);
  fs.writeFileSync(sb.file, '{"version":4,"nextId":9007199254740992,"tasks":[{"id":1,"title":"Pay rent","status":"open","due":null,"tags":[],"note":null,"important":false}]}');
  const before = fileBytes(sb);
  expectFail(sb, 'ttc: no task id is left\n', 'copy', '1');
  assert.deepEqual(fileBytes(sb), before);
  expectFail(sb, 'ttc: no task with id 9\n', 'copy', '9');
  assert.deepEqual(fileBytes(sb), before);
});

test('AC-8: invalid argument shapes refuse without a write', (t) => {
  const sb = sandbox(t);
  ok(sb, 'add', 'Pay rent');
  const before = fileBytes(sb);
  const cases = [
    [[], 'missing argument: <id>'],
    [['1', '2'], 'unexpected argument: 2'],
    [['1', '--tag', 'x'], 'unknown option: --tag'],
    [['1', '--due'], 'option needs a value: --due'],
    [['1', '--due', '2099-01-01', '--due', '2099-01-02'], 'option given twice: --due'],
  ];
  for (const [args, message] of cases) {
    expectFail(sb, 'ttc: ' + message + '\n', 'copy', ...args);
    assert.deepEqual(fileBytes(sb), before);
  }
});

test('AC-9: invalid id, date and missing source follow the specified error precedence', (t) => {
  const sb = sandbox(t);
  ok(sb, 'add', 'Pay rent');
  const before = fileBytes(sb);
  const cases = [
    [['abc'], 'invalid task id: abc'],
    [['9'], 'no task with id 9'],
    [['1', '--due', '2026-02-30'], 'invalid date: 2026-02-30'],
    [['1', '--due', '10000-01-01'], 'invalid date: 10000-01-01'],
    [['abc', '--due', '2026-02-30'], 'invalid task id: abc'],
    [['9', '--due', '2026-02-30'], 'invalid date: 2026-02-30'],
    [['1', '--due', ''], 'invalid date: '],
  ];
  for (const [args, message] of cases) {
    expectFail(sb, 'ttc: ' + message + '\n', 'copy', ...args);
    assert.deepEqual(fileBytes(sb), before);
  }
});

test('AC-10–11: missing home stays absent and corrupt data stays byte-identical', (t) => {
  const sb = sandbox(t);
  expectFail(sb, 'ttc: no task with id 1\n', 'copy', '1');
  assert.equal(fs.existsSync(sb.file), false);
  assert.equal(fs.existsSync(sb.dataDir), false);

  fs.mkdirSync(sb.dataDir);
  fs.writeFileSync(sb.file, 'not json');
  const before = fileBytes(sb);
  expectFail(sb, /^ttc: cannot read [^\n]+\n$/, 'copy', '1');
  assert.deepEqual(fileBytes(sb), before);
});

test('AC-12: v3 refusal preserves bytes and successful copy writes v4 with an open copy', (t) => {
  const sb = sandbox(t);
  fs.mkdirSync(sb.dataDir);
  fs.writeFileSync(sb.file, '{"version":3,"nextId":2,"tasks":[{"id":1,"title":"Pay rent","status":"done","due":"2099-10-01","tags":["bills"],"note":"by card"}]}');
  const before = fileBytes(sb);
  expectFail(sb, 'ttc: no task with id 5\n', 'copy', '5');
  assert.deepEqual(fileBytes(sb), before);
  expectOk(sb, 'Copied task 1 as task 2\n', 'copy', '1');
  assert.match(fileBytes(sb).toString('utf8'), /"version": 4/);
  ok(sb, 'export', 'out.json');
  const source = {
    id: 1, title: 'Pay rent', status: 'done', due: '2099-10-01',
    tags: ['bills'], note: 'by card', important: false,
  };
  const expected = { version: 4, nextId: 3, tasks: [source, { ...source, id: 2, status: 'open' }] };
  assert.deepEqual(stored(sb), expected);
  assert.deepEqual(exported(sb, 'out.json'), expected);
});

test('AC-13: help lists the exact copy usage between add and list', (t) => {
  const sb = sandbox(t);
  expectOk(sb, 'Usage:\n' + lines(
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
  ), 'help');
});
