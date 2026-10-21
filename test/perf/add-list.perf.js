'use strict';

// Perf guard (RCDEV-834): with 10,000 stored tasks, the median whole-process
// time of `ttc list` and of `ttc add` must stay under LIMIT_MS.
//
// This file is deliberately not named *.test.js, so the unit suite glob never
// picks it up. `npm run test:perf` runs it alone, after the unit suite.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const { readList, serializeList } = require('../../src/storage');

const BIN = path.join(__dirname, '..', '..', 'bin', 'ttc.js');
const LIMIT_MS = 500;
const TASK_COUNT = 10000;
const TIMED_RUNS = 5;

const TAG_POOL = ['home', 'work', 'bills', 'errands', 'health', 'q4-review'];
const WORDS = [
  'call', 'pay', 'review', 'send', 'book', 'renew', 'buy', 'plan', 'fix', 'write',
  'the', 'quarterly', 'report', 'dentist', 'appointment', 'rent', 'invoice', 'groceries',
  'passport', 'insurance', 'garden', 'budget', 'meeting', 'notes', 'with', 'team', 'before',
  'friday', 'update', 'schedule',
];

// Deterministic list of TASK_COUNT tasks, built from the index only.
function buildList() {
  const tasks = [];
  for (let i = 1; i <= TASK_COUNT; i++) {
    const done = i % 10 < 3;
    let due = null;
    if (i % 4 === 0) {
      const year = 2020 + (i % 12); // past and future years
      const month = (i % 12) + 1;
      const day = (i % 28) + 1;
      due = String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }
    const tags = [];
    const tagCount = i % 4; // 0-3 tags
    for (let k = 0; k < tagCount; k++) tags.push(TAG_POOL[(i + k * 2) % TAG_POOL.length]);
    const target = 15 + ((i * 7) % 76); // 15-90 characters
    let title = '';
    for (let w = i; title.length < target; w += 3) {
      const word = WORDS[w % WORDS.length];
      title = title === '' ? word : title + ' ' + word;
    }
    title = title.slice(0, target).replace(/ +$/, '');
    tasks.push({ id: i, title, status: done ? 'done' : 'open', due, tags });
  }
  return { nextId: TASK_COUNT + 1, tasks };
}

const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-perf-'));
const home = path.join(base, 'home');
const dataDir = path.join(base, 'data');
const file = path.join(dataDir, 'tasks.json');
const env = { PATH: process.env.PATH, HOME: home, TTC_HOME: dataDir };
const stored = Buffer.from(serializeList(buildList()));

test.after(() => {
  fs.rmSync(base, { recursive: true, force: true });
});

function seed() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file, stored);
}

function runOnce(args) {
  const t0 = performance.now();
  const r = spawnSync(process.execPath, [BIN, ...args], {
    env,
    stdio: ['ignore', 'ignore', 'pipe'],
    encoding: 'utf8',
  });
  const t1 = performance.now();
  return { ms: t1 - t0, status: r.status, stderr: r.stderr };
}

// One untimed warm-up, then TIMED_RUNS timed runs; reset runs before each, untimed.
function measure(t, label, args, reset) {
  const times = [];
  for (let n = 0; n <= TIMED_RUNS; n++) {
    reset();
    const r = runOnce(args);
    assert.equal(r.status, 0, label + ' exited ' + r.status + ': ' + r.stderr);
    if (n > 0) times.push(r.ms);
  }
  const sorted = [...times].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const line =
    label + ': runs ' + times.map((x) => x.toFixed(1)).join(', ') +
    ' ms; median ' + median.toFixed(1) + ' ms (limit ' + LIMIT_MS + ' ms)';
  t.diagnostic(line);
  assert.ok(median < LIMIT_MS, line);
}

test('seed: 10,000 tasks stored in a temp dir and accepted by ttc', () => {
  assert.ok(dataDir.startsWith(os.tmpdir()) || dataDir.startsWith(fs.realpathSync(os.tmpdir())));
  seed();
  assert.equal(readList({ TTC_HOME: dataDir }).tasks.length, TASK_COUNT);
});

test('ttc list', (t) => {
  measure(t, 'ttc list', ['list'], () => {});
});

test('ttc add', (t) => {
  measure(t, 'ttc add', ['add', 'perf check task'], seed);
});
