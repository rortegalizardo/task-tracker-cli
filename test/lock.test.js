'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');
const HOLD_LOCK = path.join(__dirname, 'fixtures', 'hold-lock.js');
const TIMEOUT = { timeout: 60000 };

function sandbox(dataPath = 'data') {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-lock-'));
  const dataDir = path.join(base, dataPath);
  return { base, dataDir, file: path.join(dataDir, 'tasks.json'), lock: path.join(dataDir, 'tasks.json.lock') };
}

function envFor(sb) {
  return { PATH: process.env.PATH, HOME: path.join(sb.base, 'home'), TTC_HOME: sb.dataDir };
}

function seed(sb, list) {
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.file, JSON.stringify(list, null, 2) + '\n');
}

function ttc(sb, ...args) {
  return new Promise((resolve) => {
    const started = performance.now();
    const child = spawn(process.execPath, [BIN, ...args], { env: envFor(sb) });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (status) => resolve({ status, stdout, stderr, ms: performance.now() - started }));
  });
}

function stored(sb) {
  return JSON.parse(fs.readFileSync(sb.file, 'utf8'));
}

// AC-6: afterwards the data folder holds only tasks.json.
function assertNoLockLeft(sb) {
  const left = fs.existsSync(sb.dataDir) ? fs.readdirSync(sb.dataDir) : [];
  assert.ok(left.every((name) => name === 'tasks.json'), 'left behind: ' + left.join(', '));
}

function assertAllOk(results) {
  for (const r of results) {
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stderr, '');
  }
}

async function addTwenty(sb) {
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => ttc(sb, 'add', 't' + (i + 1))));
  assertAllOk(results);
  const list = stored(sb);
  assert.equal(list.nextId, 21);
  assert.deepEqual(list.tasks.map((t) => t.id).sort((a, b) => a - b), Array.from({ length: 20 }, (_, i) => i + 1));
  assert.deepEqual(list.tasks.map((t) => t.title).sort(), Array.from({ length: 20 }, (_, i) => 't' + (i + 1)).sort());
  assertNoLockLeft(sb);
}

test('20 concurrent adds on an empty home keep all 20 (5 rounds)', TIMEOUT, async () => {
  for (let round = 0; round < 5; round++) await addTwenty(sandbox());
});

test('a concurrent mix of add, done, rename and tag keeps every change', TIMEOUT, async () => {
  const sb = sandbox();
  const task = (id) => ({ id, title: 'seed' + id, status: 'open', due: null, tags: [] });
  seed(sb, { nextId: 4, tasks: [task(1), task(2), task(3)] });
  const results = await Promise.all([
    ...Array.from({ length: 10 }, (_, i) => ttc(sb, 'add', 'n' + i)),
    ttc(sb, 'done', '1'),
    ttc(sb, 'rename', '2', 'renamed'),
    ttc(sb, 'tag', '3', '+x'),
  ]);
  assertAllOk(results);
  const list = stored(sb);
  assert.equal(list.tasks.length, 13);
  assert.equal(list.tasks.find((t) => t.id === 1).status, 'done');
  assert.equal(list.tasks.find((t) => t.id === 2).title, 'renamed');
  assert.deepEqual(list.tasks.find((t) => t.id === 3).tags, ['x']);
  assert.deepEqual(list.tasks.filter((t) => t.id > 3).map((t) => t.title).sort(), Array.from({ length: 10 }, (_, i) => 'n' + i).sort());
  assertNoLockLeft(sb);
});

test('a live lock makes a changing command fail after about 10 s; reads stay lock-free', TIMEOUT, async () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [{ id: 1, title: 'old', status: 'open', due: null, tags: [] }] });
  const before = fs.readFileSync(sb.file);
  fs.writeFileSync(sb.lock, process.pid + '\n');

  const blocked = ttc(sb, 'add', 'x');
  const reads = await Promise.all([
    ttc(sb, 'list'),
    ttc(sb, 'stats'),
    ttc(sb, 'export', path.join(sb.base, 'out.json')),
    ttc(sb, 'help'),
  ]);
  for (const r of reads) {
    assert.equal(r.status, 0, r.stderr);
    assert.ok(r.ms < 5000);
  }
  assert.equal(fs.readFileSync(sb.lock, 'utf8'), process.pid + '\n');

  const r = await blocked;
  assert.ok(r.ms >= 10000 && r.ms <= 12000, 'waited ' + r.ms);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /^ttc: [^\n]*tasks\.json[^\n]*\n$/);
  assert.deepEqual(fs.readFileSync(sb.file), before);
  fs.unlinkSync(sb.lock);
  assertNoLockLeft(sb);
});

test('read commands never create TTC_HOME', TIMEOUT, async () => {
  const sb = sandbox();
  const reads = await Promise.all([
    ttc(sb, 'list'),
    ttc(sb, 'stats'),
    ttc(sb, 'export', path.join(sb.base, 'out.json')),
    ttc(sb, 'help'),
  ]);
  assertAllOk(reads);
  assert.equal(fs.existsSync(sb.dataDir), false);
});

test('a lock left by a killed process does not block', TIMEOUT, async () => {
  const sb = sandbox();
  const holder = spawn(process.execPath, [HOLD_LOCK], { env: envFor(sb) });
  await new Promise((resolve, reject) => {
    holder.stdout.once('data', resolve);
    holder.once('error', reject);
  });
  const exited = new Promise((resolve) => holder.once('exit', resolve));
  holder.kill('SIGKILL');
  await exited;
  assert.ok(fs.existsSync(sb.lock));
  const r = await ttc(sb, 'add', 'x');
  assertAllOk([r]);
  assert.ok(r.ms < 2000, 'took ' + r.ms);
  assertNoLockLeft(sb);
});

test('an empty lock file does not block', TIMEOUT, async () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.lock, '');
  const r = await ttc(sb, 'add', 'x');
  assertAllOk([r]);
  assert.ok(r.ms < 2000, 'took ' + r.ms);
  assertNoLockLeft(sb);
});

test('an unreadable lock file does not block', { ...TIMEOUT, skip: process.getuid?.() === 0 }, async () => {
  const sb = sandbox();
  fs.mkdirSync(sb.dataDir, { recursive: true });
  fs.writeFileSync(sb.lock, '', { mode: 0o000 });
  fs.chmodSync(sb.lock, 0o000);
  const r = await ttc(sb, 'add', 'x');
  assertAllOk([r]);
  assert.ok(r.ms < 2000, 'took ' + r.ms);
  assertNoLockLeft(sb);
});

test('many processes finding the same stale lock all succeed (3 rounds)', TIMEOUT, async () => {
  const dead = spawnSync(process.execPath, ['-e', '']);
  for (let round = 0; round < 3; round++) {
    const sb = sandbox();
    fs.mkdirSync(sb.dataDir, { recursive: true });
    fs.writeFileSync(sb.lock, dead.pid + '\n');
    await addTwenty(sb);
  }
});

test('a failed changing command leaves no folder behind', TIMEOUT, async () => {
  const sb = sandbox(path.join('a', 'b', 'data'));
  const r = await ttc(sb, 'done', '1');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.equal(fs.existsSync(path.join(sb.base, 'a')), false);
});

test('two first-ever adds on a missing home both succeed', TIMEOUT, async () => {
  const sb = sandbox();
  assertAllOk(await Promise.all([ttc(sb, 'add', 'one'), ttc(sb, 'add', 'two')]));
  assert.deepEqual(stored(sb).tasks.map((t) => t.id).sort(), [1, 2]);
  assertNoLockLeft(sb);
});

test('the lock is gone after a reported failure', TIMEOUT, async () => {
  const sb = sandbox();
  seed(sb, { nextId: 2, tasks: [{ id: 1, title: 'old', status: 'open', due: null, tags: [] }] });
  const r = await ttc(sb, 'done', '99');
  assert.equal(r.status, 1);
  assertNoLockLeft(sb);
});
