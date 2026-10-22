'use strict';

// RCDEV-838: every ttc invocation exits 0 on success and 1 on any failure,
// with at most one `ttc: ` line on stderr and never a stack trace.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { serializeList } = require('../src/storage');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');
const HOLD_LOCK = path.join(__dirname, 'fixtures', 'hold-lock.js');
const THROW_OUTSIDE_RUN = path.join(__dirname, 'fixtures', 'throw-outside-run.js');
const TIMEOUT = { timeout: 60000 };
const STACK = /^\s+at |node:/m;

function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-exit-'));
  const dataDir = path.join(base, 'data');
  return { base, dataDir, file: path.join(dataDir, 'tasks.json') };
}

function envFor(sb) {
  return { PATH: process.env.PATH, HOME: sb.base, TTC_HOME: sb.dataDir };
}

function task(id, title, status = 'open') {
  return { id, title, status, due: null, tags: [] };
}

function seed(sb, tasks) {
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, serializeList({ nextId: tasks.length + 1, tasks }));
}

// Runs ttc. `early` (optional) is called right after spawn with the child.
function ttc(sb, args, { early, nodeArgs = [] } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [...nodeArgs, BIN, ...args], { env: envFor(sb) });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.stdout.on('error', () => {});
    child.stderr.on('error', () => {});
    if (early) early(child);
    child.on('close', (status, signal) => resolve({ status, signal, stdout, stderr }));
  });
}

function assertFailure(r, pattern) {
  assert.equal(r.status, 1, r.stderr);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /^ttc: [^\n]+\n$/);
  assert.doesNotMatch(r.stderr, STACK);
  if (pattern) assert.match(r.stderr, pattern);
}

function assertSuccess(r) {
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stderr, '');
}

// Failure with output cut off: status 1, no signal, at most one `ttc: ` line.
function assertCutOff(r) {
  assert.equal(r.status, 1);
  assert.equal(r.signal, null);
  assert.match(r.stderr, /^(ttc: [^\n]+\n)?$/);
  assert.doesNotMatch(r.stderr, STACK);
}

const closeStdout = (child) => child.stdout.destroy();
const closeBoth = (child) => {
  child.stdout.destroy();
  child.stderr.destroy();
};

// AC-5: one success and at least one failure per command, real processes.
const one = [task(1, 'x')];
const oneDone = [task(1, 'x', 'done')];
const table = [
  { name: 'help ok', args: () => ['help'], ok: true },
  { name: 'help fail', args: () => ['help', 'extra'] },
  { name: 'add ok', args: () => ['add', 'x'], ok: true },
  { name: 'add fail (bad due)', args: () => ['add', 'x', '--due', '2026-13-01'] },
  { name: 'list ok', args: () => ['list'], ok: true },
  { name: 'list fail (both filters)', args: () => ['list', '--open', '--done'] },
  { name: 'list fail (bad due-from)', args: () => ['list', '--due-from', '2026-13-01'] },
  { name: 'done ok', args: () => ['done', '1'], tasks: one, ok: true },
  { name: 'done fail (no such task)', args: () => ['done', '99999'], tasks: one },
  { name: 'reopen ok', args: () => ['reopen', '1'], tasks: oneDone, ok: true },
  { name: 'reopen fail (bad id)', args: () => ['reopen', 'abc'], tasks: oneDone },
  { name: 'rename ok', args: () => ['rename', '1', 'y'], tasks: one, ok: true },
  { name: 'rename fail (no such task)', args: () => ['rename', '99999', 'y'], tasks: one },
  { name: 'delete ok', args: () => ['delete', '1'], tasks: one, ok: true },
  { name: 'delete fail (no such task)', args: () => ['delete', '99999'], tasks: one },
  { name: 'tag ok', args: () => ['tag', '1', '+t'], tasks: one, ok: true },
  { name: 'tag fail (no such task)', args: () => ['tag', '99999', '+t'], tasks: one },
  { name: 'export ok', args: (sb) => ['export', path.join(sb.base, 'out.json')], tasks: one, ok: true },
  { name: 'export fail (a folder)', args: (sb) => ['export', sb.base], tasks: one },
  {
    name: 'import ok',
    args: (sb) => {
      const file = path.join(sb.base, 'in.json');
      fs.writeFileSync(file, serializeList({ nextId: 2, tasks: one }));
      return ['import', file];
    },
    ok: true,
  },
  { name: 'import fail (missing file)', args: (sb) => ['import', path.join(sb.base, 'nope.json')] },
  { name: 'stats ok', args: () => ['stats'], ok: true },
  { name: 'stats fail', args: () => ['stats', 'extra'] },
  { name: 'unknown command', args: () => ['frob'], expect: 'ttc: unknown command: frob (see ttc help)\n' },
];

for (const row of table) {
  test('exit code: ' + row.name, TIMEOUT, async () => {
    const sb = sandbox();
    if (row.tasks) seed(sb, row.tasks);
    const r = await ttc(sb, row.args(sb));
    if (row.ok) return assertSuccess(r);
    assertFailure(r);
    if (row.expect) assert.equal(r.stderr, row.expect);
  });
}

test('exit code: list fails on a file from a newer ttc and leaves it unchanged', TIMEOUT, async () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, '{"version": 3, "nextId": 1, "tasks": []}');
  const before = fs.readFileSync(sb.file);
  assertFailure(await ttc(sb, ['list']), /newer ttc/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

test('exit code: add fails while another ttc holds the data file (busy lock)', TIMEOUT, async () => {
  const sb = sandbox();
  const holder = spawn(process.execPath, [HOLD_LOCK], { env: envFor(sb) });
  try {
    await new Promise((resolve, reject) => {
      holder.stdout.once('data', resolve);
      holder.once('error', reject);
    });
    assertFailure(await ttc(sb, ['add', 'y']), /busy/);
  } finally {
    holder.kill('SIGKILL');
  }
});

// AC-1: stdout closed early on a large list or a small output.
function bigSeed(sb) {
  seed(sb, Array.from({ length: 10000 }, (_, i) => task(i + 1, 'task number ' + (i + 1))));
}

test('stdout closed after 10 bytes of `list --all` on 10,000 tasks exits 1', TIMEOUT, async () => {
  const sb = sandbox();
  bigSeed(sb);
  const r = await ttc(sb, ['list', '--all'], {
    early: (child) => {
      let received = 0;
      child.stdout.on('data', (d) => {
        received += d.length;
        if (received >= 10) child.stdout.destroy();
      });
    },
  });
  assertCutOff(r);
});

for (const args of [['stats'], ['help']]) {
  test('stdout closed early on `ttc ' + args[0] + '` exits 1', TIMEOUT, async () => {
    const sb = sandbox();
    bigSeed(sb);
    assertCutOff(await ttc(sb, args, { early: closeStdout }));
  });
}

// AC-2 / PD-0008: the saved change stays saved.
test('add with stdout closed exits 1 and the change stays saved', TIMEOUT, async () => {
  const sb = sandbox();
  assertCutOff(await ttc(sb, ['add', 'x'], { early: closeStdout }));
  const r = await ttc(sb, ['list']);
  assertSuccess(r);
  assert.match(r.stdout, /^#1 \[ \] x$/m);
});

// AC-3
test('an exception thrown outside run() gives one ttc line and exit 1', TIMEOUT, async () => {
  const sb = sandbox();
  const r = await ttc(sb, ['stats'], { nodeArgs: ['--require', THROW_OUTSIDE_RUN] });
  assert.equal(r.status, 1);
  assert.equal(r.stderr, 'ttc: simulated failure outside run\n');
});

// AC-4
test('stdout and stderr both closed: a failing command exits 1 and changes nothing', TIMEOUT, async () => {
  const sb = sandbox();
  seed(sb, one);
  const before = fs.readFileSync(sb.file);
  const r = await ttc(sb, ['done', '99999'], { early: closeBoth });
  assert.equal(r.status, 1);
  assert.equal(r.signal, null);
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

test('stdout and stderr both closed: an output failure exits 1', TIMEOUT, async () => {
  const sb = sandbox();
  seed(sb, one);
  const r = await ttc(sb, ['list'], { early: closeBoth });
  assert.equal(r.status, 1);
  assert.equal(r.signal, null);
});
