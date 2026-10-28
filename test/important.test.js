'use strict';
// RCDEV-856: the important mark (PD-0009, PD-0010). One test per AC-1 to AC-15.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-important-'));
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

// The six tasks of AC-5 (with marks) or AC-7 (without).
function sixTasks(sb, marked) {
  const imp = marked ? ['--important'] : [];
  ok(sb, 'add', 'Alpha', '--due', '2000-01-01', '--tag', 'home');
  ok(sb, 'add', 'Bravo', '--due', '2000-01-02', '--tag', 'home', ...imp);
  ok(sb, 'add', 'Charlie', '--due', '2099-12-31');
  ok(sb, 'add', 'Delta', '--tag', 'home', ...imp);
  ok(sb, 'add', 'Echo', ...imp);
  ok(sb, 'done', '5');
  ok(sb, 'add', 'Foxtrot');
  ok(sb, 'done', '6');
}

const L1 = '#1 [ ] Alpha due:2000-01-01 !overdue +home';
const L2 = '#2 [ ] Bravo due:2000-01-02 !overdue !important +home';
const L3 = '#3 [ ] Charlie due:2099-12-31';
const L4 = '#4 [ ] Delta !important +home';
const L5 = '#5 [x] Echo !important';
const L6 = '#6 [x] Foxtrot';

test('AC-1: add --important stores the mark and list shows it', () => {
  const sb = sandbox();
  expectOk(sb, 'Added task 1\n', 'add', 'Pay rent', '--important');
  expectOk(sb, '#1 [ ] Pay rent !important\n', 'list');
});

test('AC-2: ttc important marks a task and list puts it first', () => {
  const sb = sandbox();
  for (const t of ['Buy milk', 'Pay rent', 'Read']) ok(sb, 'add', t);
  expectOk(sb, 'Marked task 3 as important\n', 'important', '3');
  expectOk(sb, lines('#3 [ ] Read !important', '#1 [ ] Buy milk', '#2 [ ] Pay rent'), 'list');
});

test('AC-3: important on an important task is a no-op', () => {
  const sb = sandbox();
  for (const t of ['Buy milk', 'Pay rent', 'Read']) ok(sb, 'add', t);
  ok(sb, 'important', '3');
  const before = fileBytes(sb);
  expectOk(sb, 'Task 3 is already important\n', 'important', '3');
  assert.deepEqual(fileBytes(sb), before);
});

test('AC-4: unimportant removes the mark; a second one is a no-op', () => {
  const sb = sandbox();
  for (const t of ['Buy milk', 'Pay rent', 'Read']) ok(sb, 'add', t);
  ok(sb, 'important', '3');
  expectOk(sb, 'Removed important mark from task 3\n', 'unimportant', '3');
  expectOk(sb, lines('#1 [ ] Buy milk', '#2 [ ] Pay rent', '#3 [ ] Read'), 'list');
  const before = fileBytes(sb);
  expectOk(sb, 'Task 3 is not important\n', 'unimportant', '3');
  assert.deepEqual(fileBytes(sb), before);
});

test('AC-5: every status view lists important tasks first with the token', () => {
  const sb = sandbox();
  sixTasks(sb, true);
  const open = lines(L2, L4, L1, L3);
  expectOk(sb, open, 'list');
  expectOk(sb, open, 'list', '--open');
  expectOk(sb, lines(L5, L6), 'list', '--done');
  expectOk(sb, lines(L2, L4, L5, L1, L3, L6), 'list', '--all');
  expectOk(sb, lines(L2, L1), 'list', '--overdue');
});

test('AC-6: filters keep important tasks first', () => {
  const sb = sandbox();
  sixTasks(sb, true);
  expectOk(sb, lines(L2, L4, L1), 'list', '--all', '--tag', 'home');
  expectOk(sb, lines(L2, L1), 'list', '--all', '--due-from', '2000-01-01', '--due-to', '2000-12-31');
  expectOk(sb, lines(L2, L5, L6), 'list', '--all', '--search', 'o');
});

test('AC-7: with no mark, list output is the id order without the token', () => {
  const sb = sandbox();
  sixTasks(sb, false);
  expectOk(
    sb,
    lines(
      '#1 [ ] Alpha due:2000-01-01 !overdue +home',
      '#2 [ ] Bravo due:2000-01-02 !overdue +home',
      '#3 [ ] Charlie due:2099-12-31',
      '#4 [ ] Delta +home',
      '#5 [x] Echo',
      '#6 [x] Foxtrot',
    ),
    'list',
    '--all',
  );
});

test('AC-8: the mark survives done, reopen, rename, tag and note, and delete drops the task', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Buy milk', '--important');
  ok(sb, 'add', 'Pay rent', '--important');
  ok(sb, 'add', 'Read');
  expectOk(sb, 'Completed task 1\n', 'done', '1');
  expectOk(sb, 'Reopened task 1\n', 'reopen', '1');
  expectOk(sb, 'Renamed task 1\n', 'rename', '1', 'Buy oat milk');
  expectOk(sb, 'Added tag shop to task 1\n', 'tag', '1', '+shop');
  expectOk(sb, 'Set note on task 1\n', 'note', '1', 'two litres');
  expectOk(sb, 'Added tag fun to task 3\n', 'tag', '3', '+fun');
  expectOk(sb, lines('#1 [ ] Buy oat milk !important +shop', '#2 [ ] Pay rent !important', '#3 [ ] Read +fun'), 'list', '--all');
  expectOk(sb, 'Deleted task 2\n', 'delete', '2');
  expectOk(sb, lines('#1 [ ] Buy oat milk !important +shop', '#3 [ ] Read +fun'), 'list', '--all');
});

test('AC-9: export and import keep the mark', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Buy milk', '--important');
  ok(sb, 'add', 'Pay rent');
  ok(sb, 'add', 'Read', '--important');
  ok(sb, 'done', '3');
  expectOk(sb, 'Exported 3 tasks to backup.json\n', 'export', 'backup.json');
  ok(sb, 'unimportant', '1');
  expectOk(sb, 'Imported 3 tasks from backup.json\n', 'import', 'backup.json');
  expectOk(sb, lines('#1 [ ] Buy milk !important', '#3 [x] Read !important', '#2 [ ] Pay rent'), 'list', '--all');
  ok(sb, 'export', 'done.json', '--done');
  ok(sb, 'import', 'done.json');
  expectOk(sb, lines('#3 [x] Read !important'), 'list', '--all');
});

test('AC-10: CSV export, stats and note output do not show the mark', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Buy milk', '--important');
  ok(sb, 'add', 'Pay rent');
  expectOk(sb, 'id,title,status,due,tags,note\r\n1,Buy milk,open,,,\r\n2,Pay rent,open,,,\r\n', 'export', '--format', 'csv');
  expectOk(sb, lines('open: 2', 'done: 0', 'overdue: 0'), 'stats');
  expectOk(sb, 'Task 1 has no note\n', 'note', '1');
});

const V3 = {
  version: 3,
  nextId: 3,
  tasks: [
    { id: 1, title: 'Buy milk', status: 'open', due: null, tags: [], note: null },
    { id: 2, title: 'Pay rent', status: 'done', due: null, tags: [], note: null },
  ],
};

test('AC-11: a version 3 file is read as-is, upgraded by the next change, and importable', () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir);
  fs.writeFileSync(sb.file, JSON.stringify(V3, null, 2) + '\n');
  const before = fileBytes(sb);
  expectOk(sb, lines('#1 [ ] Buy milk', '#2 [x] Pay rent'), 'list', '--all');
  assert.deepEqual(fileBytes(sb), before);
  expectOk(sb, 'Marked task 1 as important\n', 'important', '1');
  assert.equal(JSON.parse(fileBytes(sb)).version, 4);

  const other = sandbox();
  fs.writeFileSync(path.join(other.work, 'v3.json'), JSON.stringify(V3, null, 2) + '\n');
  expectOk(other, 'Imported 2 tasks from v3.json\n', 'import', 'v3.json');
  expectOk(other, lines('#1 [ ] Buy milk', '#2 [x] Pay rent'), 'list', '--all');
});

test('AC-12: version 5, a bad mark and a missing mark are refused on read and on import', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Buy milk', '--important');
  ok(sb, 'add', 'Pay rent');
  ok(sb, 'export', 'good.json');
  const good = JSON.parse(fs.readFileSync(path.join(sb.work, 'good.json'), 'utf8'));
  const edits = {
    version5: (d) => { d.version = 5; },
    yes: (d) => { d.tasks[0].important = 'yes'; },
    missing: (d) => { delete d.tasks[1].important; },
  };
  for (const [name, edit] of Object.entries(edits)) {
    const doc = structuredClone(good);
    edit(doc);
    const text = JSON.stringify(doc, null, 2) + '\n';

    const stored = sandbox();
    fs.mkdirSync(stored.dataDir);
    fs.writeFileSync(stored.file, text);
    const r = ttc(stored, 'list');
    assert.equal(r.status, 1, name);
    assert.equal(r.stdout, '', name);
    assert.ok(r.stderr.startsWith('ttc: cannot read ' + stored.file + ': '), name + ': ' + r.stderr);
    assert.equal(r.stderr.split('\n').length, 2, name);
    assert.equal(fs.readFileSync(stored.file, 'utf8'), text, name);

    const imp = sandbox();
    ok(imp, 'add', 'Keep');
    const keep = fileBytes(imp);
    fs.writeFileSync(path.join(imp.work, 'bad.json'), text);
    const ri = ttc(imp, 'import', 'bad.json');
    assert.equal(ri.status, 1, name);
    assert.equal(ri.stdout, '', name);
    assert.ok(ri.stderr.startsWith('ttc: invalid import file bad.json: '), name + ': ' + ri.stderr);
    assert.equal(ri.stderr.split('\n').length, 2, name);
    assert.deepEqual(fileBytes(imp), keep, name);
  }
});

test('AC-13: a bad id or a missing task is refused and changes nothing', () => {
  const sb = sandbox();
  ok(sb, 'add', 'Buy milk');
  const before = fileBytes(sb);
  for (const cmd of ['important', 'unimportant']) {
    expectFail(sb, 'ttc: invalid task id: abc\n', cmd, 'abc');
    expectFail(sb, 'ttc: no task with id 7\n', cmd, '7');
  }
  assert.deepEqual(fileBytes(sb), before);
});

test('AC-14: wrong arguments are refused and change nothing', () => {
  const bad = [
    ['important'],
    ['important', '1', '2'],
    ['add', 'Buy milk', '--important', '--important'],
    ['add', 'Buy milk', '--important', 'yes'],
  ];
  const empty = sandbox();
  for (const args of bad) expectFail(empty, /^ttc: [^\n]+\n$/, ...args);
  assert.equal(fs.existsSync(empty.dataDir), false);

  const sb = sandbox();
  ok(sb, 'add', 'Buy milk');
  const before = fileBytes(sb);
  for (const args of bad) expectFail(sb, /^ttc: [^\n]+\n$/, ...args);
  assert.deepEqual(fileBytes(sb), before);
});

test('AC-15: help lists the new usages in order', () => {
  const sb = sandbox();
  expectOk(
    sb,
    'Usage:\n' +
      lines(
        '  ttc help',
        '  ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]',
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
