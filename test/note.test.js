'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-note-'));
  const dataDir = path.join(base, 'data');
  return { base, dataDir, file: path.join(dataDir, 'tasks.json') };
}

function ttc(sb, ...args) {
  const env = { PATH: process.env.PATH, HOME: path.join(sb.base, 'home'), TTC_HOME: sb.dataDir };
  return spawnSync(process.execPath, [BIN, ...args], { env, encoding: 'utf8' });
}

function stored(sb) {
  return JSON.parse(fs.readFileSync(sb.file, 'utf8'));
}

function assertOut(r, stdout) {
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stderr, '');
  assert.equal(r.stdout, stdout);
}

// One `ttc: ` line, nothing on stdout, exit 1, tasks.json byte-identical.
function assertRefused(sb, args) {
  const before = fs.readFileSync(sb.file);
  const r = ttc(sb, ...args);
  assert.equal(r.status, 1, args.join(' '));
  assert.equal(r.stdout, '', args.join(' '));
  assert.match(r.stderr, /^ttc: [^\n]+\n$/, args.join(' '));
  assert.deepEqual(fs.readFileSync(sb.file), before, args.join(' '));
}

test('add --note then note <id> prints the note (AC-1)', () => {
  const sb = sandbox();
  assertOut(ttc(sb, 'add', 'Pay rent', '--note', 'landlord prefers bank transfer'), 'Added task 1\n');
  assertOut(ttc(sb, 'note', '1'), 'landlord prefers bank transfer\n');
});

test('note <id> on a task without a note says so and writes nothing', () => {
  const sb = sandbox();
  ttc(sb, 'add', 'Buy milk');
  const before = fs.readFileSync(sb.file);
  assertOut(ttc(sb, 'note', '1'), 'Task 1 has no note\n');
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

test('set replaces the note, clear removes it, a second clear is a byte-identical no-op (AC-2)', () => {
  const sb = sandbox();
  ttc(sb, 'add', 'Pay rent', '--note', 'old text');
  assertOut(ttc(sb, 'note', '1', 'new text'), 'Set note on task 1\n');
  assert.equal(stored(sb).tasks[0].note, 'new text');
  assertOut(ttc(sb, 'note', '1', '--clear'), 'Cleared note on task 1\n');
  assert.equal(stored(sb).tasks[0].note, null);
  const before = fs.readFileSync(sb.file);
  assertOut(ttc(sb, 'note', '1', '--clear'), 'Task 1 has no note\n');
  assert.deepEqual(fs.readFileSync(sb.file), before);
});

test('bad id, missing task, blank text and text with --clear are refused (AC-7)', () => {
  const sb = sandbox();
  ttc(sb, 'add', 'Buy milk');
  for (const args of [['note', 'abc'], ['note', '99999'], ['note', '1', '  '], ['note', '1', 'x', '--clear']]) {
    assertRefused(sb, args);
  }
});

test('typed note: only spaces are trimmed, a control character is refused', () => {
  const sb = sandbox();
  ttc(sb, 'add', 'Buy milk');
  assertOut(ttc(sb, 'note', '1', '   padded note  '), 'Set note on task 1\n');
  assert.equal(stored(sb).tasks[0].note, 'padded note');
  assertRefused(sb, ['note', '1', 'a\tb']);
  assertRefused(sb, ['note', '1', 'a\nb']);
});
