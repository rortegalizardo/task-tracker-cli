'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

const V2 = {
  version: 2,
  nextId: 3,
  tasks: [
    { id: 1, title: 'Pay rent', status: 'open', due: '2099-12-31', tags: ['bills'] },
    { id: 2, title: 'Read', status: 'open', due: null, tags: [] },
  ],
};

function sandbox() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-v3-'));
  const dataDir = path.join(base, 'data');
  fs.mkdirSync(dataDir);
  return { base, dataDir, home: path.join(base, 'home'), file: path.join(dataDir, 'tasks.json') };
}

function ttc(sb, ...args) {
  const env = { PATH: process.env.PATH, HOME: sb.home, TTC_HOME: sb.dataDir };
  return spawnSync(process.execPath, [BIN, ...args], { env, encoding: 'utf8' });
}

test('a version 2 file is not rewritten by read-only commands, and the next changing command writes version 4 (AC-4)', () => {
  const sb = sandbox();
  fs.writeFileSync(sb.file, JSON.stringify(V2, null, 2) + '\n');
  const before = fs.readFileSync(sb.file);
  for (const args of [['list'], ['stats'], ['export'], ['note', '1']]) {
    const r = ttc(sb, ...args);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(fs.readFileSync(sb.file), before, args.join(' '));
  }

  assert.equal(ttc(sb, 'done', '1').status, 0);
  const after = JSON.parse(fs.readFileSync(sb.file, 'utf8'));
  assert.deepEqual(Object.keys(after), ['version', 'nextId', 'tasks']);
  assert.equal(after.version, 4);
  assert.equal(after.tasks.length, 2);
  for (const t of after.tasks) {
    assert.deepEqual(Object.keys(t), ['id', 'title', 'status', 'due', 'tags', 'note', 'important']);
    assert.equal(t.note, null);
    assert.equal(t.important, false);
  }
});
