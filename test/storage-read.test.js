'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readList } = require('../src/storage');
const { TtcError } = require('../src/errors');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
}

function task(id, extra = {}) {
  return { id, title: 'Task ' + id, status: 'open', due: null, tags: [], note: null, important: false, ...extra };
}

function readFails(env, file) {
  assert.throws(
    () => readList(env),
    (err) => {
      assert.ok(err instanceof TtcError);
      const prefix = 'cannot read ' + file + ': ';
      assert.ok(err.message.startsWith(prefix), err.message);
      const reason = err.message.slice(prefix.length);
      assert.ok(reason.length > 0);
      assert.doesNotMatch(reason, /[\r\n]/);
      return true;
    },
  );
}

test('no tasks.json reads as an empty list and creates nothing (criterion 9)', () => {
  const base = tmpDir();
  const dir = path.join(base, 'data');
  assert.deepEqual(readList({ TTC_HOME: dir }), { nextId: 1, tasks: [] });
  assert.equal(fs.existsSync(dir), false);
});

test('a read returns exactly the list in tasks.json and ignores other files (criterion 15)', () => {
  const dir = tmpDir();
  const list = { nextId: 5, tasks: [task(2, { due: '2024-02-29', tags: ['home', 'a_b-1'], note: 'bank, transfer' }), task(4, { status: 'done' })] };
  fs.writeFileSync(path.join(dir, 'tasks.json'), JSON.stringify({ version: 4, ...list }));
  fs.writeFileSync(path.join(dir, '.tasks.json.1.abc.tmp'), 'junk');
  assert.deepEqual(readList({ TTC_HOME: dir }), list);
});

for (const [name, content] of [
  ['text { (criterion 16)', '{'],
  ['text 42 (criterion 17)', '42'],
]) {
  test(`reading a file holding ${name} fails and leaves the file`, () => {
    const dir = tmpDir();
    const file = path.join(dir, 'tasks.json');
    fs.writeFileSync(file, content);
    readFails({ TTC_HOME: dir }, file);
    assert.equal(fs.readFileSync(file, 'utf8'), content);
  });
}

test('tasks.json being a folder fails and the folder is unchanged (criterion 18)', () => {
  const dir = tmpDir();
  const file = path.join(dir, 'tasks.json');
  fs.mkdirSync(file);
  fs.writeFileSync(path.join(file, 'inner'), 'x');
  readFails({ TTC_HOME: dir }, file);
  assert.deepEqual(fs.readdirSync(file), ['inner']);
});

const BAD_LISTS = {
  'two tasks share one id': { nextId: 5, tasks: [task(1), task(1)] },
  'a task holds the tag HOME': { nextId: 2, tasks: [task(1, { tags: ['HOME'] })] },
  'a task holds the tag home twice': { nextId: 2, tasks: [task(1, { tags: ['home', 'home'] })] },
  'a title contains a line break': { nextId: 2, tasks: [task(1, { title: 'a\nb' })] },
  'a title has a space at its start': { nextId: 2, tasks: [task(1, { title: ' a' })] },
  'a title has a space at its end': { nextId: 2, tasks: [task(1, { title: 'a ' })] },
  'a title is three spaces': { nextId: 2, tasks: [task(1, { title: '   ' })] },
  'a task id is 9007199254740992': { nextId: 9007199254740992, tasks: [task(9007199254740992)] },
  'the next id equals the highest task id': { nextId: 3, tasks: [task(1), task(3)] },
  'a due date is 2026-02-30': { nextId: 2, tasks: [task(1, { due: '2026-02-30' })] },
  'a note is empty': { nextId: 2, tasks: [task(1, { note: '' })] },
  'a note has a line break': { nextId: 2, tasks: [task(1, { note: 'a\nb' })] },
};

for (const [name, list] of Object.entries(BAD_LISTS)) {
  test(`reading fails when ${name} (criterion 19)`, () => {
    const dir = tmpDir();
    const file = path.join(dir, 'tasks.json');
    const text = JSON.stringify({ version: 4, ...list });
    fs.writeFileSync(file, text);
    readFails({ TTC_HOME: dir }, file);
    assert.equal(fs.readFileSync(file, 'utf8'), text);
  });
}

test('reading fails when the next id is 9007199254740993, which JSON.parse would round (RCDEV-830)', () => {
  const dir = tmpDir();
  const file = path.join(dir, 'tasks.json');
  // A JS number cannot hold this value, so the raw text is built by replacement.
  const text = JSON.stringify({ version: 4, nextId: 3, tasks: [task(1), task(2)] }).replace('"nextId":3', '"nextId":9007199254740993');
  assert.ok(text.includes('9007199254740993'));
  fs.writeFileSync(file, text);
  readFails({ TTC_HOME: dir }, file);
  assert.equal(fs.readFileSync(file, 'utf8'), text);
});
