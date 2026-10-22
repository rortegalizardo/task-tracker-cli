'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { writeList } = require('../src/storage');
const { TtcError } = require('../src/errors');

const FIXTURE = path.join(__dirname, 'fixtures', 'interrupted-write.js');
const STEPS = ['after-mkdir', 'after-open', 'mid-write', 'after-fsync', 'before-rename'];
const OLD_LIST = { nextId: 2, tasks: [{ id: 1, title: 'old', status: 'open', due: null, tags: [] }] };

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
}

function interrupt(dataDir, step) {
  const home = tmpDir();
  const r = spawnSync(process.execPath, [FIXTURE, dataDir, step], {
    env: { PATH: process.env.PATH, HOME: home, TTC_HOME: dataDir },
    encoding: 'utf8',
  });
  // The kill must really have cut the write off.
  assert.equal(r.signal, 'SIGKILL', 'step ' + step + ' did not fire: ' + r.stderr);
}

for (const step of STEPS) {
  test(`a write killed at ${step} keeps the old whole list (criterion 20)`, () => {
    const dir = path.join(tmpDir(), 'data');
    fs.mkdirSync(dir);
    const file = path.join(dir, 'tasks.json');
    const old = JSON.stringify(OLD_LIST, null, 2) + '\n';
    fs.writeFileSync(file, old);
    interrupt(dir, step);
    assert.equal(fs.readFileSync(file, 'utf8'), old);
  });

  test(`a write killed at ${step} leaves no tasks.json when there was none (criterion 21)`, () => {
    const dir = path.join(tmpDir(), 'data');
    interrupt(dir, step);
    assert.equal(fs.existsSync(path.join(dir, 'tasks.json')), false);
  });
}

// A write killed after the rename and before the folder fsync (AC-5): the
// rename already made the new list whole, so that is what the file holds.
const NEW_LIST = { version: 2, nextId: 3, tasks: [{ id: 2, title: 'new task written by the fixture', status: 'open', due: null, tags: ['x'] }] };

test('a write killed at after-rename leaves the whole new list over an old one (AC-5)', () => {
  const dir = path.join(tmpDir(), 'data');
  fs.mkdirSync(dir);
  const file = path.join(dir, 'tasks.json');
  fs.writeFileSync(file, JSON.stringify(OLD_LIST, null, 2) + '\n');
  interrupt(dir, 'after-rename');
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), NEW_LIST);
});

test('a write killed at after-rename leaves the whole new list when there was none (AC-5)', () => {
  const dir = path.join(tmpDir(), 'data');
  interrupt(dir, 'after-rename');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'tasks.json'), 'utf8')), NEW_LIST);
});

test('a failing rename throws TtcError, keeps the file and leaves no temp file (criteria 20-21)', (t) => {
  const dir = tmpDir();
  const file = path.join(dir, 'tasks.json');
  const old = JSON.stringify(OLD_LIST);
  fs.writeFileSync(file, old);
  t.mock.method(fs, 'renameSync', () => {
    throw Object.assign(new Error('boom'), { code: 'EIO' });
  });
  assert.throws(() => writeList({ nextId: 3, tasks: [] }, { TTC_HOME: dir }), TtcError);
  assert.equal(fs.readFileSync(file, 'utf8'), old);
  assert.deepEqual(fs.readdirSync(dir), ['tasks.json']);
});
