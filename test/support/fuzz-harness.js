'use strict';

// Runs one generated property: every case is generated from (seed, property,
// index), run through the real run() inside a sandbox, and compared with the
// reference model. A second test sends every Nth case through a real process.
// Focused cases may additionally require exact stderr (or the storage-error
// prefix specified by AC-7); both execution modes enforce that same metadata.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { resolveSeed, caseRandom } = require('./fuzz-random');
const { expect } = require('./ttc-model');
const { run } = require('../../src/cli');

const BIN = path.join(__dirname, '..', '..', 'bin', 'ttc.js');
const STORED = 'home/tasks.json';
const ONE_LINE = /^ttc: [^\n\r\u0085\u2028\u2029]*\n$/;

function localToday() {
  const now = new Date();
  return String(now.getFullYear()).padStart(4, '0') + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function materialize(dir, files) {
  for (const [rel, node] of Object.entries(files).sort()) {
    const abs = path.join(dir, rel);
    if (node.kind === 'dir') {
      fs.mkdirSync(abs, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, node.bytes);
    }
  }
}

// Every file and folder under `dir`, as a Map of relative path -> { kind, bytes }.
function snapshot(dir) {
  const tree = new Map();
  const walk = (abs, rel) => {
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const childAbs = path.join(abs, entry.name);
      const childRel = rel === '' ? entry.name : rel + '/' + entry.name;
      if (entry.isDirectory()) {
        tree.set(childRel, { kind: 'dir' });
        walk(childAbs, childRel);
      } else {
        tree.set(childRel, { kind: 'file', bytes: fs.readFileSync(childAbs) });
      }
    }
  };
  walk(dir, '');
  return tree;
}

function describeNode(node) {
  if (node === undefined) return 'missing';
  return node.kind === 'dir' ? 'dir' : 'file ' + node.bytes.length + ' bytes ' + JSON.stringify(node.bytes.subarray(0, 120).toString('latin1'));
}

// Null when the two trees are equal, else the first difference.
function treeDiff(want, got) {
  for (const p of [...new Set([...want.keys(), ...got.keys()])].sort()) {
    const a = want.get(p);
    const b = got.get(p);
    const same = a !== undefined && b !== undefined && a.kind === b.kind && (a.kind === 'dir' || a.bytes.equals(b.bytes));
    if (!same) return JSON.stringify(p) + ': want ' + describeNode(a) + ', got ' + describeNode(b);
  }
  return null;
}

// Problems found in one run's outcome against the model's answer (empty when it matches).
// outcome = { threw, status, signal, stdout (string or Buffer), stderr (string) }
function judge(want, before, after, outcome, c) {
  const problems = [];
  if (outcome.threw) return ['run() threw: ' + (outcome.threw.stack || outcome.threw)];
  if (outcome.signal) problems.push('killed by signal ' + outcome.signal);
  const stdoutText = typeof outcome.stdout === 'string' ? outcome.stdout : outcome.stdout.toString('utf8');
  if (c.expectedStderr !== undefined || c.expectedStderrPrefix !== undefined) {
    if (want.ok) problems.push('model accepted a required refusal');
    if (outcome.status !== 1) problems.push('exit ' + outcome.status + ', want 1 for required refusal');
    if (c.expectedStderr !== undefined && outcome.stderr !== c.expectedStderr) {
      problems.push('stderr ' + JSON.stringify(outcome.stderr) + ', want ' + JSON.stringify(c.expectedStderr));
    }
    if (c.expectedStderrPrefix !== undefined && !outcome.stderr.startsWith(c.expectedStderrPrefix)) {
      problems.push('stderr ' + JSON.stringify(outcome.stderr) + ', want prefix ' + JSON.stringify(c.expectedStderrPrefix));
    }
  }
  if (want.ok) {
    if (outcome.status !== 0) problems.push('exit ' + outcome.status + ', want 0');
    if (outcome.stderr !== '') problems.push('stderr ' + JSON.stringify(outcome.stderr) + ', want empty');
    const sameStdout = typeof outcome.stdout === 'string' ? outcome.stdout === want.stdout : outcome.stdout.equals(Buffer.from(want.stdout, 'utf8'));
    if (!sameStdout) problems.push('stdout ' + JSON.stringify(stdoutText.slice(0, 300)) + ', want ' + JSON.stringify(want.stdout.slice(0, 300)));
    const diff = treeDiff(want.files, after);
    if (diff !== null) problems.push('files differ at ' + diff);
  } else {
    if (outcome.status === 0 || outcome.status === null) problems.push('exit ' + outcome.status + ', want non-zero');
    if (stdoutText !== '') problems.push('stdout ' + JSON.stringify(stdoutText.slice(0, 300)) + ', want empty');
    if (!ONE_LINE.test(outcome.stderr)) problems.push('stderr is not one "ttc: " line: ' + JSON.stringify(outcome.stderr.slice(0, 300)));
    if (/^\s+at /m.test(outcome.stderr) || outcome.stderr.includes('node:internal')) problems.push('stderr shows a stack trace');
    const diff = treeDiff(before, after);
    if (diff !== null) problems.push('files changed by a failed run at ' + diff);
  }
  return problems;
}

function defineFuzzProperty({ name, generate, labels, minPerLabel, minOkShare, cases = 10000, sampleEvery = 200 }) {
  const seed = resolveSeed();
  const replay = 'TTC_FUZZ_SEED=' + seed + ' npm test';
  const state = { root: null, saved: null, failed: false };

  test.before(() => {
    state.root = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-fuzz-'));
    state.saved = { home: process.env.HOME, ttcHome: process.env.TTC_HOME, cwd: process.cwd() };
    process.env.HOME = state.root;
  });

  test.after(() => {
    process.chdir(state.saved.cwd);
    for (const [key, value] of [['HOME', state.saved.home], ['TTC_HOME', state.saved.ttcHome]]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    if (state.failed) console.error('sandbox kept at ' + state.root);
    else fs.rmSync(state.root, { recursive: true, force: true });
  });

  // Never lets a case touch the real home or ~/.ttc.
  function guard(caseDir) {
    const home = process.env.TTC_HOME;
    assert.ok(home && home === path.join(caseDir, 'home') && home.startsWith(state.root + path.sep), 'TTC_HOME is not inside the sandbox: ' + home);
    assert.ok(os.homedir().startsWith(state.root), 'HOME is not inside the sandbox: ' + os.homedir());
  }

  function report(index, c, before, want, outcome, problems) {
    const stored = before.get(STORED);
    const storedLine = stored === undefined ? 'missing' : stored.kind === 'dir' ? 'dir' : 'file, ' + stored.bytes.length + ' bytes, first 300: ' + JSON.stringify(stored.bytes.subarray(0, 300).toString('latin1'));
    const sameStored = !want.ok || treeDiff(new Map([[STORED, stored]].filter((e) => e[1])), new Map([[STORED, want.files.get(STORED)]].filter((e) => e[1]))) === null;
    const wantStored = sameStored ? 'unchanged' : 'changed';
    return [
      'property ' + name + ' failed: seed ' + seed + ', case ' + index + ' (' + c.label + ')',
      'replay: ' + replay,
      'argv: ' + JSON.stringify(c.argv),
      'stored ' + STORED + ': ' + storedLine,
      'expected: ' + (want.ok ? 'exit 0, stdout ' + JSON.stringify(want.stdout.slice(0, 300)) : 'non-zero exit, empty stdout, one ttc: line') + ', tasks.json ' + wantStored,
      ...(c.expectedStderr === undefined ? [] : ['required stderr: ' + JSON.stringify(c.expectedStderr)]),
      ...(c.expectedStderrPrefix === undefined ? [] : ['required stderr prefix: ' + JSON.stringify(c.expectedStderrPrefix)]),
      'actual: exit ' + outcome.status + ', stdout ' + JSON.stringify(String(outcome.stdout).slice(0, 300)) + ', stderr ' + JSON.stringify(String(outcome.stderr).slice(0, 300)),
      'problems:',
      ...problems.map((p) => '  - ' + p),
      'sandbox: ' + state.root,
    ].join('\n');
  }

  // Compares the outcome with the model for today as read before and after the
  // run, so a midnight in between cannot fail a case.
  function check(c, before, after, outcome, todayBefore, todayAfter) {
    let want = expect({ argv: c.argv, files: before, today: todayBefore });
    let problems = judge(want, before, after, outcome, c);
    if (problems.length > 0 && todayAfter !== todayBefore) {
      const alt = expect({ argv: c.argv, files: before, today: todayAfter });
      const altProblems = judge(alt, before, after, outcome, c);
      if (altProblems.length === 0) return { want: alt, problems: altProblems };
    }
    return { want, problems };
  }

  function prepare(index) {
    const c = generate(caseRandom(seed, name, index), index);
    const dir = path.join(state.root, 'case' + index);
    fs.mkdirSync(dir);
    materialize(dir, c.files);
    process.env.TTC_HOME = path.join(dir, 'home');
    process.chdir(dir);
    guard(dir);
    return { c, dir, before: snapshot(dir) };
  }

  function finish(dir) {
    process.chdir(state.root);
    fs.rmSync(dir, { recursive: true, force: true });
  }

  test(name + ': ' + cases + ' generated cases match the model', (t) => {
    t.diagnostic('seed ' + seed);
    const counts = new Map();
    let okCases = 0;
    for (let index = 0; index < cases; index++) {
      const { c, dir, before } = prepare(index);
      let out = '';
      let err = '';
      let status;
      let threw = null;
      const todayBefore = localToday();
      try {
        status = run(c.argv, { stdout: { write: (s) => { out += s; } }, stderr: { write: (s) => { err += s; } } });
      } catch (e) {
        threw = e;
      }
      const todayAfter = localToday();
      const after = snapshot(dir);
      const outcome = { threw, status, signal: null, stdout: out, stderr: err };
      const { want, problems } = check(c, before, after, outcome, todayBefore, todayAfter);
      if (problems.length > 0) {
        state.failed = true;
        assert.fail(report(index, c, before, want, outcome, problems));
      }
      counts.set(c.label, (counts.get(c.label) ?? 0) + 1);
      if (want.ok) okCases++;
      finish(dir);
    }
    t.diagnostic('classes ' + JSON.stringify(Object.fromEntries([...counts].sort())) + ', expected successes ' + okCases);
    const thin = labels.filter((label) => (counts.get(label) ?? 0) < minPerLabel);
    assert.deepEqual(thin, [], 'classes below ' + minPerLabel + ' cases: ' + thin.map((l) => l + '=' + (counts.get(l) ?? 0)).join(', '));
    const extra = [...counts.keys()].filter((label) => !labels.includes(label));
    assert.deepEqual(extra, [], 'classes missing from the coverage list: ' + extra.join(', '));
    if (minOkShare !== undefined) {
      assert.ok(okCases >= cases * minOkShare, 'only ' + okCases + ' of ' + cases + ' cases were expected successes');
    }
  });

  test(name + ': every ' + sampleEvery + 'th case through a real process', (t) => {
    t.diagnostic('seed ' + seed);
    for (let index = 0; index < cases; index += sampleEvery) {
      const { c, dir, before } = prepare(index);
      const env = { PATH: process.env.PATH, HOME: process.env.HOME, TTC_HOME: process.env.TTC_HOME };
      const todayBefore = localToday();
      const res = spawnSync(process.execPath, [BIN, ...c.argv], { cwd: dir, env, timeout: 60000 });
      const todayAfter = localToday();
      const after = snapshot(dir);
      const outcome = {
        threw: res.error ?? null,
        status: res.status,
        signal: res.signal,
        stdout: res.stdout,
        stderr: res.stderr ? res.stderr.toString('utf8') : '',
      };
      const { want, problems } = check(c, before, after, outcome, todayBefore, todayAfter);
      if (problems.length > 0) {
        state.failed = true;
        assert.fail(report(index, c, before, want, outcome, problems));
      }
      finish(dir);
    }
  });
}

module.exports = { defineFuzzProperty };
