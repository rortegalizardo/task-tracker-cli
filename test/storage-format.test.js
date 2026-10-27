'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { FORMATS, CURRENT_VERSION, migrateV1ToV2, migrateV2ToV3, migrateV3ToV4, parseList, serializeList } = require('../src/storage');

const body = { nextId: 2, tasks: [{ id: 1, title: 'A', status: 'open', due: null, tags: [] }] };
const v3Tasks = [{ ...body.tasks[0], note: null }];
const list = { nextId: 2, tasks: [{ ...v3Tasks[0], important: false }] };

test('the registry ends at version 4', () => {
  assert.equal(CURRENT_VERSION, 4);
  assert.deepEqual(FORMATS.map((f) => f.version), [1, 2, 3, 4]);
});

test('migrateV1ToV2 puts version 2 first and does not touch its input', () => {
  for (const doc of [{ ...body }, { version: 1, ...body }]) {
    const before = JSON.stringify(doc);
    const out = migrateV1ToV2(doc);
    assert.deepEqual(Object.keys(out), ['version', 'nextId', 'tasks']);
    assert.equal(out.version, 2);
    assert.deepEqual(out.tasks, body.tasks);
    assert.equal(JSON.stringify(doc), before);
  }
});

test('migrateV2ToV3 adds note null last to every task and does not touch its input', () => {
  const doc = { version: 2, ...body };
  const before = JSON.stringify(doc);
  const out = migrateV2ToV3(doc);
  assert.deepEqual(Object.keys(out), ['version', 'nextId', 'tasks']);
  assert.equal(out.version, 3);
  assert.deepEqual(Object.keys(out.tasks[0]), ['id', 'title', 'status', 'due', 'tags', 'note']);
  assert.equal(out.tasks[0].note, null);
  assert.equal(JSON.stringify(doc), before);
});

test('migrateV3ToV4 adds important false last to every task and does not touch its input', () => {
  const doc = { version: 3, nextId: 2, tasks: v3Tasks };
  const before = JSON.stringify(doc);
  const out = migrateV3ToV4(doc);
  assert.deepEqual(Object.keys(out), ['version', 'nextId', 'tasks']);
  assert.equal(out.version, 4);
  assert.deepEqual(Object.keys(out.tasks[0]), ['id', 'title', 'status', 'due', 'tags', 'note', 'important']);
  assert.equal(out.tasks[0].important, false);
  assert.equal(JSON.stringify(doc), before);
});

test('parseList reads version 1 (no key or explicit), versions 2 to 4 as the same list', () => {
  for (const text of [
    JSON.stringify(body),
    JSON.stringify({ version: 1, ...body }),
    JSON.stringify({ version: 2, ...body }),
    JSON.stringify({ version: 3, nextId: 2, tasks: v3Tasks }),
    JSON.stringify({ version: 4, nextId: 2, tasks: list.tasks }),
  ]) {
    assert.deepEqual(parseList(text), { list });
  }
});

test('parseList refuses a newer version before checking the layout', () => {
  for (const v of ['5', '1000']) {
    const { problem, list: l } = parseList('{"version":' + v + ',"anything":true}');
    assert.equal(l, undefined);
    assert.match(problem, new RegExp('newer ttc \\(format version ' + v + ';'));
  }
});

test('parseList refuses a version that is not a whole number of 1 or more', () => {
  for (const v of ['0', '-1', '-0', '2.5', '"2"', 'null', 'true', '[]', '{}', '1e400']) {
    assert.deepEqual(parseList('{"version":' + v + ',"nextId":1,"tasks":[]}'), {
      problem: 'the version is not a whole number of 1 or more',
    });
  }
});

test('serializeList writes version 4 first', () => {
  assert.ok(serializeList(list).startsWith('{\n  "version": 4,\n  "nextId": '));
});
