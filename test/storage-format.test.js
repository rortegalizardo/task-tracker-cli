'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { FORMATS, CURRENT_VERSION, migrateV1ToV2, parseList, serializeList } = require('../src/storage');

const body = { nextId: 2, tasks: [{ id: 1, title: 'A', status: 'open', due: null, tags: [] }] };
const list = { nextId: 2, tasks: body.tasks };

test('the registry ends at version 2', () => {
  assert.equal(CURRENT_VERSION, 2);
  assert.deepEqual(FORMATS.map((f) => f.version), [1, 2]);
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

test('parseList reads version 1 (no key or explicit) and version 2 as the same list', () => {
  for (const text of [
    JSON.stringify(body),
    JSON.stringify({ version: 1, ...body }),
    JSON.stringify({ version: 2, ...body }),
  ]) {
    assert.deepEqual(parseList(text), { list });
  }
});

test('parseList refuses a newer version before checking the layout', () => {
  for (const v of ['3', '1000']) {
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

test('serializeList writes version 2 first', () => {
  assert.ok(serializeList(list).startsWith('{\n  "version": 2,\n  "nextId": '));
});
