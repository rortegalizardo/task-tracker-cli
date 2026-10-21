'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readList, writeList } = require('../src/storage');
const { TtcError } = require('../src/errors');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
}

function listOf(title) {
  return { nextId: 2, tasks: [{ id: 1, title, status: 'open', due: '2026-03-01', tags: ['a', 'b'] }] };
}

test('TTC_HOME names the data folder (criterion 7)', (t) => {
  const dir = tmpDir();
  const list = listOf('one');
  writeList(list, { TTC_HOME: dir });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'tasks.json'), 'utf8')), list);
  assert.deepEqual(readList({ TTC_HOME: dir }), list);
});

for (const [name, env] of [['unset', {}], ['empty', { TTC_HOME: '' }]]) {
  test(`TTC_HOME ${name} uses ~/.ttc (criterion 8)`, (t) => {
    const home = tmpDir();
    t.mock.method(os, 'homedir', () => home);
    const list = listOf('home');
    writeList(list, env);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(home, '.ttc', 'tasks.json'), 'utf8')), list);
    assert.deepEqual(readList(env), list);
  });
}

test('the first write creates the folder and its missing parents (criterion 10)', () => {
  const dir = path.join(tmpDir(), 'a', 'b', 'data');
  const list = listOf('deep');
  writeList(list, { TTC_HOME: dir });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'tasks.json'), 'utf8')), list);
});

test('a new data folder is mode 700 and tasks.json is mode 600, whatever the umask (criterion 11)', () => {
  const dir = path.join(tmpDir(), 'data');
  const before = process.umask(0o000);
  try {
    writeList(listOf('modes'), { TTC_HOME: dir });
  } finally {
    process.umask(before);
  }
  assert.equal(fs.statSync(dir).mode & 0o777, 0o700);
  assert.equal(fs.statSync(path.join(dir, 'tasks.json')).mode & 0o777, 0o600);
});

test('a write over an existing list holds exactly the new list (criterion 12)', () => {
  const dir = tmpDir();
  writeList(listOf('old'), { TTC_HOME: dir });
  const list = listOf('new');
  writeList(list, { TTC_HOME: dir });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'tasks.json'), 'utf8')), list);
});

test('an existing mode 644 file ends at mode 600 (criterion 13)', () => {
  const dir = tmpDir();
  const file = path.join(dir, 'tasks.json');
  fs.writeFileSync(file, JSON.stringify(listOf('old')));
  fs.chmodSync(file, 0o644);
  const list = listOf('new');
  writeList(list, { TTC_HOME: dir });
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), list);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
});

test('a symlinked tasks.json becomes a regular file and the target is untouched (criterion 14)', () => {
  const dir = tmpDir();
  const other = path.join(dir, 'other.json');
  const file = path.join(dir, 'tasks.json');
  fs.writeFileSync(other, JSON.stringify(listOf('target')));
  const before = fs.readFileSync(other);
  fs.symlinkSync(other, file);
  const list = listOf('new');
  writeList(list, { TTC_HOME: dir });
  assert.equal(fs.lstatSync(file).isFile(), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), list);
  assert.deepEqual(fs.readFileSync(other), before);
});

test('TTC_HOME naming a regular file fails the write and keeps the file (criterion 22)', () => {
  const base = tmpDir();
  const file = path.join(base, 'afile');
  fs.writeFileSync(file, 'keep me');
  assert.throws(
    () => writeList(listOf('x'), { TTC_HOME: file }),
    (err) => err instanceof TtcError && err.message.length > 0 && !/[\r\n]/.test(err.message),
  );
  assert.equal(fs.readFileSync(file, 'utf8'), 'keep me');
});
