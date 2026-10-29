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
  assert.ok(lines.includes('ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]'));
  assert.ok(lines.includes('ttc list [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]'));
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

test('list --search finds a task by its note alone, in any letter case (AC-3)', () => {
  const sb = sandbox();
  seed(sb, { version: 3, nextId: 3, tasks: [
    { id: 1, title: 'Pay rent', status: 'open', due: null, tags: [], note: 'landlord prefers bank transfer' },
    { id: 2, title: 'Read', status: 'open', due: null, tags: [], note: null },
  ] });
  for (const needle of ['transfer', 'TRANSFER', 'Transfer']) {
    const r = ttc(sb, 'list', '--search', needle);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '#1 [ ] Pay rent\n');
  }
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

// RCDEV-864: the accepted fixture is created through the public commands.
function noDueFixture(sb) {
  for (const args of [
    ['add', 'Pay rent', '--due', '2000-01-02', '--tag', 'bills'],
    ['add', 'Call mom', '--tag', 'home'],
    ['add', 'Plan trip', '--due', '2099-05-01'],
    ['add', 'Fix bike', '--tag', 'home'],
    ['add', 'Water plants', '--important'],
    ['done', '4'],
  ]) {
    const r = ttc(sb, ...args);
    assert.equal(r.status, 0, JSON.stringify(args));
    assert.equal(r.stderr, '');
  }
}

test('RCDEV-864 AC-1–AC-4 and AC-9: no-due narrows views without changing existing output or bytes', () => {
  const sb = sandbox();
  noDueFixture(sb);
  const before = fs.readFileSync(sb.file);
  const rent = '#1 [ ] Pay rent due:2000-01-02 !overdue +bills\n';
  const mom = '#2 [ ] Call mom +home\n';
  const trip = '#3 [ ] Plan trip due:2099-05-01\n';
  const bike = '#4 [x] Fix bike +home\n';
  const plants = '#5 [ ] Water plants !important\n';
  for (const [args, stdout] of [
    [['list', '--no-due'], plants + mom],
    [['list', '--open', '--no-due'], plants + mom],
    [['list', '--done', '--no-due'], bike],
    [['list', '--all', '--no-due'], plants + mom + bike],
    [['list', '--no-due', '--tag', 'home'], mom],
    [['list', '--tag', 'home', '--all', '--no-due'], mom + bike],
    [['list', '--search', 'plant', '--no-due'], plants],
    [['list', '--no-due', '--tag', 'bills'], 'No tasks.\n'],
    [['list'], plants + rent + mom + trip],
    [['list', '--all'], plants + rent + mom + trip + bike],
    [['list', '--done'], bike],
    [['list', '--overdue'], rent],
    [['list', '--due-from', '2000-01-01'], rent + trip],
    [['list', '--tag', 'home'], mom],
    [['list', '--search', 'plant'], plants],
    [['stats'], 'open: 4\ndone: 1\noverdue: 1\n'],
  ]) {
    const r = ttc(sb, ...args);
    assert.equal(r.status, 0, JSON.stringify(args));
    assert.equal(r.stderr, '');
    assert.equal(r.stdout, stdout, JSON.stringify(args));
    assert.deepEqual(fs.readFileSync(sb.file), before);
  }
});

test('RCDEV-864 AC-4: no-due with only dated tasks or an absent home creates nothing', () => {
  const sb = sandbox();
  const empty = ttc(sb, 'list', '--no-due');
  assert.equal(empty.status, 0);
  assert.equal(empty.stderr, '');
  assert.equal(empty.stdout, 'No tasks.\n');
  assert.equal(fs.existsSync(sb.file), false);
  assert.equal(fs.existsSync(sb.dataDir), false);
  assert.equal(ttc(sb, 'add', 'Pay rent', '--due', '2099-10-01').status, 0);
  const before = fs.readFileSync(sb.file);
  const dated = ttc(sb, 'list', '--no-due');
  assert.equal(dated.status, 0);
  assert.equal(dated.stderr, '');
  assert.equal(dated.stdout, 'No tasks.\n');
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

test('RCDEV-864 AC-5: no-due reads v1 and v3 without rewriting them', () => {
  for (const [list, args, stdout] of [
    [{ nextId: 3, tasks: [
      { id: 1, title: 'Pay rent', status: 'open', due: '2099-10-01', tags: ['bills'] },
      { id: 2, title: 'Call mom', status: 'open', due: null, tags: [] },
    ] }, ['--no-due'], '#2 [ ] Call mom\n'],
    [{ version: 3, nextId: 4, tasks: [
      { id: 1, title: 'Call mom', status: 'open', due: null, tags: [], note: null },
      { id: 2, title: 'Pay rent', status: 'open', due: '2099-10-01', tags: ['bills'], note: 'by card' },
      { id: 3, title: 'Fix bike', status: 'done', due: null, tags: ['home'], note: 'chain' },
    ] }, ['--all', '--no-due'], '#1 [ ] Call mom\n#3 [x] Fix bike +home\n'],
  ]) {
    const sb = sandbox();
    seed(sb, list);
    const before = fs.readFileSync(sb.file);
    const r = ttc(sb, 'list', ...args);
    assert.equal(r.status, 0);
    assert.equal(r.stderr, '');
    assert.equal(r.stdout, stdout);
    assert.deepEqual(fs.readFileSync(sb.file), before);
  }
});

test('RCDEV-864 AC-6–AC-7 and AC-9: exact no-due refusals follow validation order', () => {
  const sb = sandbox();
  noDueFixture(sb);
  const before = fs.readFileSync(sb.file);
  for (const [args, message] of [
    [['--no-due', '--overdue'], 'options cannot be combined: --overdue --no-due'],
    [['--overdue', '--no-due'], 'options cannot be combined: --overdue --no-due'],
    [['--no-due', '--due-from', '2026-01-01'], 'options cannot be combined: --no-due --due-from'],
    [['--due-to', '2026-01-31', '--no-due'], 'options cannot be combined: --no-due --due-to'],
    [['--no-due', '--due-from', '2026-01-01', '--due-to', '2026-01-31'], 'options cannot be combined: --no-due --due-from --due-to'],
    [['--due-to', '2026-01-31', '--due-from', '2026-01-01', '--no-due', '--overdue'], 'options cannot be combined: --overdue --no-due --due-from --due-to'],
    [['--no-due', '--no-due'], 'option given twice: --no-due'],
    [['--no-due', 'home'], 'unexpected argument: home'],
    [['--no-due', '--overdue', '--bogus'], 'unknown option: --bogus'],
    [['--overdue', '--no-due', '--due-from'], 'option needs a value: --due-from'],
    [['--done', '--overdue', '--no-due'], 'options cannot be combined: --done --overdue'],
    [['--no-due', '--tag', 'a b', '--overdue'], 'options cannot be combined: --overdue --no-due'],
    [['--no-due', '--due-from', '2026-02-30'], 'options cannot be combined: --no-due --due-from'],
    [['--no-due', '--due-from', '2026-02-01', '--due-to', '2026-01-01'], 'options cannot be combined: --no-due --due-from --due-to'],
    [['--no-due', '--overdue', '--search', ''], 'options cannot be combined: --overdue --no-due'],
    [['--no-due', '--tag', 'a b'], 'invalid tag: a b'],
    [['--no-due', '--search', ''], '--search text must not be empty'],
    [['--done', '--overdue'], 'options cannot be combined: --done --overdue'],
  ]) {
    const r = ttc(sb, 'list', ...args);
    assert.equal(r.status, 1, JSON.stringify(args));
    assert.equal(r.stdout, '');
    assert.equal(r.stderr, 'ttc: ' + message + '\n', JSON.stringify(args));
    assert.deepEqual(fs.readFileSync(sb.file), before);
  }
});

test('RCDEV-864 AC-7: no-due conflicts precede corrupt storage, valid filters reach the read', () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir);
  fs.writeFileSync(sb.file, 'not json');
  const before = fs.readFileSync(sb.file);
  for (const [args, expected] of [
    [['--no-due', '--overdue'], 'ttc: options cannot be combined: --overdue --no-due\n'],
    [['--no-due'], /^ttc: cannot read [^\n]+\n$/],
  ]) {
    const r = ttc(sb, 'list', ...args);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    if (typeof expected === 'string') assert.equal(r.stderr, expected);
    else assert.match(r.stderr, expected);
    assert.deepEqual(fs.readFileSync(sb.file), before);
  }
});
