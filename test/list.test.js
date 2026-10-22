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
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-list-'));
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

const T1 = { id: 1, title: 'Pay rent', status: 'open', due: '2099-12-31', tags: ['home', 'bills'] };
const T2 = { id: 2, title: 'Call Ann', status: 'done', due: null, tags: ['bills'] };
const T3 = { id: 3, title: 'Read', status: 'open', due: null, tags: ['home'] };
const L = { nextId: 4, tasks: [T1, T2, T3] };

const LINE1 = '#1 [ ] Pay rent due:2099-12-31 +bills +home\n';
const LINE2 = '#2 [x] Call Ann +bills\n';
const LINE3 = '#3 [ ] Read +home\n';

// Success on list L: exact stdout, empty stderr, exit 0, and tasks.json
// byte-for-byte unchanged (criterion 17).
function assertListed(args, stdout) {
  const sb = sandbox();
  seed(sb, L);
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, 'list', ...args);
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, stdout);
  assert.deepEqual(fs.readFileSync(sb.file), before);
}

// Failure on list L: exit 1, nothing on stdout, one stderr line (the exact
// line when given), and tasks.json unchanged.
function assertFails(args, line) {
  const sb = sandbox();
  seed(sb, L);
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, 'list', ...args);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  if (line !== undefined) assert.equal(r.stderr, line + '\n');
  else assert.match(r.stderr, /^ttc: [^\n]+\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
}

for (const args of [[], ['--open'], ['--done'], ['--all']]) {
  test(`list ${args.join(' ')} with no tasks.json prints No tasks. and creates nothing (criterion 1)`, () => {
    const sb = sandbox();
    const r = ttc(sb, 'list', ...args);
    assert.equal(r.status, 0);
    assert.equal(r.stderr, '');
    assert.equal(r.stdout, 'No tasks.\n');
    assert.equal(fs.existsSync(sb.dataDir), false);
    assert.equal(fs.existsSync(path.join(sb.home, '.ttc')), false);
  });
}

test('list shows the open tasks (criterion 2)', () => {
  assertListed([], LINE1 + LINE3);
});

test('add then list shows the added task (criterion 3)', () => {
  const sb = sandbox();
  const a = ttc(sb, 'add', 'Pay rent', '--due', '2099-12-31', '--tag', 'home', '--tag', 'bills');
  assert.equal(a.status, 0);
  const r = ttc(sb, 'list');
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, LINE1);
});

test('list --open shows the open tasks (criterion 4)', () => {
  assertListed(['--open'], LINE1 + LINE3);
});

test('list --done shows the done tasks (criterion 5)', () => {
  assertListed(['--done'], LINE2);
});

test('list --all shows every task (criterion 6)', () => {
  assertListed(['--all'], LINE1 + LINE2 + LINE3);
});

test('list sorts by id and tags alphabetically whatever the file order (criterion 7)', () => {
  const sb = sandbox();
  seed(sb, { nextId: 4, tasks: [T3, { ...T1, tags: ['home', 'bills'] }, T2] });
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, 'list', '--all');
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, LINE1 + LINE2 + LINE3);
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

test('list --tag home (criterion 8)', () => {
  assertListed(['--tag', 'home'], LINE1 + LINE3);
});

test('list --tag bills --all (criterion 9)', () => {
  assertListed(['--tag', 'bills', '--all'], LINE1 + LINE2);
});

test('list --tag bills and --tag bills --done (criterion 10)', () => {
  assertListed(['--tag', 'bills'], LINE1);
  assertListed(['--tag', 'bills', '--done'], LINE2);
});

test('list --tag HOME matches tag home (criterion 11)', () => {
  assertListed(['--tag', 'HOME'], LINE1 + LINE3);
});

test('list --tag work with no match prints No tasks. (criterion 12)', () => {
  assertListed(['--tag', 'work'], 'No tasks.\n');
});

test('the order of --tag and --done does not matter (criterion 13)', () => {
  assertListed(['--tag', 'bills', '--done'], LINE2);
  assertListed(['--done', '--tag', 'bills'], LINE2);
});

for (const args of [['--open', '--done'], ['--done', '--all'], ['--all', '--open'], ['--all', '--all']]) {
  test(`list ${args.join(' ')} fails (criterion 14)`, () => {
    assertFails(args);
  });
}

for (const args of [['extra'], ['--tag'], ['--tag', 'home', '--tag', 'bills'], ['--sort']]) {
  test(`list ${args.join(' ')} fails (criterion 15)`, () => {
    assertFails(args);
  });
}

test('list --tag with an invalid tag fails with the exact line (criterion 16)', () => {
  assertFails(['--tag', 'two words'], 'ttc: invalid tag: two words');
});

test('an unreadable tasks.json fails and stays as it is (criterion 18)', () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, '{');
  const r = ttc(sb, 'list');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  const escaped = sb.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(r.stderr, new RegExp('^ttc: cannot read ' + escaped + ': .+\\n$'));
  assert.equal(fs.readFileSync(sb.file, 'utf8'), '{');
});

test('ttc help lists the list usage line (criterion 19)', () => {
  const r = ttc(sandbox(), 'help');
  assert.equal(r.status, 0);
  const lines = r.stdout.split('\n').map((l) => l.trim());
  assert.ok(lines.includes('ttc help'));
  assert.ok(lines.includes('ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"]'));
  assert.ok(lines.includes('ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]'));
});

// Due-range and title-search filters (RCDEV-839).
const F = {
  nextId: 8,
  tasks: [
    { id: 1, title: 'Pay rent', status: 'open', due: '2025-12-31', tags: ['home'] },
    { id: 2, title: 'RENT due', status: 'open', due: '2026-01-01', tags: ['bills'] },
    { id: 3, title: 'Rental car', status: 'done', due: '2026-01-15', tags: ['bills', 'home'] },
    { id: 4, title: 'Parent call', status: 'open', due: '2026-01-31', tags: ['home'] },
    { id: 5, title: 'Call Ann', status: 'done', due: '2026-02-01', tags: ['bills'] },
    { id: 6, title: 'Water rent', status: 'open', due: null, tags: ['home'] },
    { id: 7, title: 'Plan trip', status: 'done', due: null, tags: [] },
  ],
};

// Local calendar date, as the CLI computes "today" (open tasks past due show !overdue).
function today() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function fmt(...ids) {
  return ids.map((id) => {
    const t = F.tasks.find((x) => x.id === id);
    const parts = [`#${t.id}`, t.status === 'done' ? '[x]' : '[ ]', t.title];
    if (t.due !== null) parts.push('due:' + t.due);
    if (t.status === 'open' && t.due !== null && t.due < today()) parts.push('!overdue');
    for (const tag of [...t.tags].sort()) parts.push('+' + tag);
    return parts.join(' ') + '\n';
  }).join('');
}

function listedF(args, stdout) {
  const sb = sandbox();
  seed(sb, F);
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, 'list', ...args);
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, stdout);
  assert.deepEqual(fs.readFileSync(sb.file), before);
}

function failsF(args, line) {
  const sb = sandbox();
  seed(sb, F);
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, 'list', ...args);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, line + '\n');
  assert.deepEqual(fs.readFileSync(sb.file), before);
}

test('list --all --due-from/--due-to shows the January tasks, ends included, no undated (AC-1)', () => {
  listedF(['--all', '--due-from', '2026-01-01', '--due-to', '2026-01-31'], fmt(2, 3, 4));
});

test('--due-from alone and --due-to alone are open-ended and drop undated tasks (AC-2)', () => {
  listedF(['--all', '--due-from', '2026-01-15'], fmt(3, 4, 5));
  listedF(['--all', '--due-to', '2026-01-15'], fmt(1, 2, 3));
});

test('equal --due-from and --due-to is allowed (AC-4)', () => {
  listedF(['--all', '--due-from', '2026-01-15', '--due-to', '2026-01-15'], fmt(3));
});

test('list --search matches open titles by case-insensitive literal substring (AC-3)', () => {
  listedF(['--search', 'rent'], fmt(1, 2, 4, 6));
  listedF(['--search', 'RENT'], fmt(1, 2, 4, 6));
  listedF(['--search', 'Rent'], fmt(1, 2, 4, 6));
});

test('--search combines with --tag, a status view and a due range by AND (AC-3)', () => {
  listedF(['--search', 'RENT', '--tag', 'bills', '--done', '--due-from', '2026-01-01', '--due-to', '2026-01-31'], fmt(3));
  listedF(['--search', 'rent', '--tag', 'home'], fmt(1, 4, 6));
  listedF(['--search', 'rent', '--due-from', '2026-01-01'], fmt(2, 4));
});

test('--search treats regex characters literally (AC-3)', () => {
  listedF(['--all', '--search', '.*'], 'No tasks.\n');
  listedF(['--all', '--search', 'r.nt'], 'No tasks.\n');
});

for (const [args, line] of [
  [['--due-from', '2026-13-01'], 'ttc: invalid date: 2026-13-01'],
  [['--due-to', '2026-02-30'], 'ttc: invalid date: 2026-02-30'],
  [['--due-from', '2026-02-01', '--due-to', '2026-01-01'], 'ttc: --due-from 2026-02-01 is later than --due-to 2026-01-01'],
  [['--search', ''], 'ttc: --search text must not be empty'],
  [['--search'], 'ttc: option needs a value: --search'],
  [['--due-from', '2026-01-01', '--due-from', '2026-01-02'], 'ttc: option given twice: --due-from'],
]) {
  test(`list ${JSON.stringify(args)} fails with the exact line (AC-4)`, () => {
    failsF(args, line);
  });
}
