'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { withLock } = require('../src/lock');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');
const INTERRUPTED_ADD = path.join(__dirname, 'fixtures', 'interrupted-add.js');
const STEPS = ['after-mkdir', 'after-open', 'mid-write', 'after-fsync', 'before-rename', 'after-rename'];
const WITH_TEMP = ['after-open', 'mid-write', 'after-fsync', 'before-rename'];
const TEMP = /^\.tasks\.json\..*\.tmp$/;
const SEED = { nextId: 2, tasks: [{ id: 1, title: 'old', status: 'open', due: null, tags: [] }] };
const HEX = 'abcdef012345';

function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-leftover-'));
  return { base, dataDir: path.join(base, 'data'), file: path.join(base, 'data', 'tasks.json') };
}

function envFor(sb) {
  return { PATH: process.env.PATH, HOME: path.join(sb.base, 'home'), TTC_HOME: sb.dataDir };
}

function seed(sb) {
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, JSON.stringify(SEED, null, 2) + '\n');
}

function ttc(sb, ...args) {
  return spawnSync(process.execPath, [BIN, ...args], { env: envFor(sb), encoding: 'utf8' });
}

function deadPid() {
  return spawnSync(process.execPath, ['-e', '']).pid;
}

function tempOf(pid, base = 'tasks.json') {
  return '.' + base + '.' + pid + '.' + HEX + '.tmp';
}

for (const step of STEPS) {
  test(`after a write killed at ${step}, the next ttc add leaves no temp file (AC-1)`, () => {
    const sb = sandbox();
    seed(sb);
    const killed = spawnSync(process.execPath, [INTERRUPTED_ADD, step], { env: envFor(sb), encoding: 'utf8' });
    assert.equal(killed.signal, 'SIGKILL', killed.stderr);
    if (WITH_TEMP.includes(step)) {
      assert.ok(fs.readdirSync(sb.dataDir).some((n) => TEMP.test(n)), 'scenario left no temp file');
    }
    const r = ttc(sb, 'add', 'y');
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout, step === 'after-rename' ? 'Added task 3\n' : 'Added task 2\n');
    assert.deepEqual(fs.readdirSync(sb.dataDir), ['tasks.json']);
    const stored = JSON.parse(fs.readFileSync(sb.file, 'utf8'));
    const y = { id: step === 'after-rename' ? 3 : 2, title: 'y', status: 'open', due: null, tags: [], note: null, important: false };
    if (step === 'after-rename') {
      assert.equal(stored.tasks.length, 3);
      assert.equal(stored.tasks[1].title, 'x');
      assert.deepEqual(stored.tasks[2], y);
    } else {
      assert.deepEqual(stored.tasks, [{ ...SEED.tasks[0], note: null, important: false }, y]);
    }
  });
}

test('only a dead writer\'s temp file is removed; everything else stays (AC-2)', () => {
  const sb = sandbox();
  seed(sb);
  const dead = deadPid();
  const gone = tempOf(dead);
  const kept = {
    [tempOf(process.pid)]: 'alive writer',
    'notes.txt': 'notes',
    '.tasks.json.tmp': 'no pid',
    '.tasks.json.123.abc.tmp': 'wrong hex length',
    [tempOf(dead, 'other.json')]: 'other target',
  };
  fs.writeFileSync(path.join(sb.dataDir, gone), 'dead writer');
  for (const [name, text] of Object.entries(kept)) fs.writeFileSync(path.join(sb.dataDir, name), text);
  const r = ttc(sb, 'add', 'y');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.existsSync(path.join(sb.dataDir, gone)), false);
  for (const [name, text] of Object.entries(kept)) {
    assert.equal(fs.readFileSync(path.join(sb.dataDir, name), 'utf8'), text, name);
  }
});

test('a leftover that cannot be removed does not fail the command (AC-3)', (t) => {
  const sb = sandbox();
  seed(sb);
  const leftover = tempOf(deadPid());
  fs.writeFileSync(path.join(sb.dataDir, leftover), 'dead writer');
  const unlinkSync = fs.unlinkSync;
  t.mock.method(fs, 'unlinkSync', (p, ...rest) => {
    if (TEMP.test(path.basename(String(p)))) {
      throw Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
    }
    return unlinkSync(p, ...rest);
  });
  const before = process.env.TTC_HOME;
  process.env.TTC_HOME = sb.dataDir;
  let out = '';
  let err = '';
  try {
    const status = require('../src/cli').run(['add', 'y'], {
      stdout: { write: (s) => { out += s; } },
      stderr: { write: (s) => { err += s; } },
    });
    assert.equal(status, 0);
  } finally {
    if (before === undefined) delete process.env.TTC_HOME;
    else process.env.TTC_HOME = before;
  }
  assert.equal(out, 'Added task 2\n');
  assert.equal(err, '');
  assert.deepEqual(fs.readdirSync(sb.dataDir).sort(), [leftover, 'tasks.json'].sort());
});

test('leftovers are removed only while the lock is held (AC-4)', (t) => {
  const sb = sandbox();
  seed(sb);
  const leftover = tempOf(deadPid());
  fs.writeFileSync(path.join(sb.dataDir, leftover), 'dead writer');
  const calls = [];
  const openSync = fs.openSync;
  const unlinkSync = fs.unlinkSync;
  t.mock.method(fs, 'openSync', (p, flag, ...rest) => {
    calls.push(['open', path.basename(String(p)), flag]);
    return openSync(p, flag, ...rest);
  });
  t.mock.method(fs, 'unlinkSync', (p, ...rest) => {
    calls.push(['unlink', path.basename(String(p))]);
    return unlinkSync(p, ...rest);
  });
  withLock(() => {}, { TTC_HOME: sb.dataDir });
  assert.deepEqual(calls, [
    ['open', 'tasks.json.lock', 'wx'],
    ['unlink', leftover],
    ['unlink', 'tasks.json.lock'],
  ]);
});

test('list, stats, export and help remove nothing and create nothing (AC-7)', () => {
  const sb = sandbox();
  seed(sb);
  const leftover = tempOf(deadPid());
  fs.writeFileSync(path.join(sb.dataDir, leftover), 'dead writer');
  const before = fs.readFileSync(sb.file);
  for (const args of [['list'], ['stats'], ['export', path.join(sb.base, 'out.json')], ['help']]) {
    const r = ttc(sb, ...args);
    assert.equal(r.status, 0, args[0] + ': ' + r.stderr);
  }
  assert.deepEqual(fs.readdirSync(sb.dataDir).sort(), [leftover, 'tasks.json'].sort());
  assert.deepEqual(fs.readFileSync(sb.file), before);
});
