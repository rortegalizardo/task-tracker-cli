'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatCsv } = require('../src/csv');

const HEADER = 'id,title,status,due,tags,note\r\n';

function task(over) {
  return { id: 1, title: 'x', status: 'open', due: null, tags: [], note: null, ...over };
}

test('quotes and doubles inner quotes', () => {
  const text = formatCsv([task({ title: 'Pay "rent", now' })]);
  assert.equal(text, HEADER + '1,"Pay ""rent"", now",open,,,\r\n');
});

test('a title with only a comma is quoted', () => {
  assert.equal(formatCsv([task({ title: 'a,b' })]), HEADER + '1,"a,b",open,,,\r\n');
});

test('a leading = is written unquoted and unchanged', () => {
  assert.equal(formatCsv([task({ title: '=SUM(A1)' })]), HEADER + '1,=SUM(A1),open,,,\r\n');
});

test('no due date gives an empty field', () => {
  assert.equal(formatCsv([task({ due: null })]), HEADER + '1,x,open,,,\r\n');
  assert.equal(formatCsv([task({ due: '2026-01-31', status: 'done' })]), HEADER + '1,x,done,2026-01-31,,\r\n');
});

test('tags are sorted and space-separated, input untouched', () => {
  const tags = ['work', 'bills', 'home'];
  assert.equal(formatCsv([task({ tags })]), HEADER + '1,x,open,,bills home work,\r\n');
  assert.deepEqual(tags, ['work', 'bills', 'home']);
});

test('an empty list is the header alone', () => {
  assert.equal(formatCsv([]), HEADER);
});

test('rows come out in id order', () => {
  const text = formatCsv([task({ id: 10 }), task({ id: 2 }), task({ id: 3 })]);
  assert.deepEqual(text.split('\r\n').map((l) => l.split(',')[0]), ['id', '2', '3', '10', '']);
});

test('every line ends CRLF', () => {
  const text = formatCsv([task({ id: 1 }), task({ id: 2, title: 'a\nb' })]);
  assert.ok(text.endsWith('\r\n'));
  assert.equal(formatCsv([task({ title: 'a\nb' })]), HEADER + '1,"a\nb",open,,,\r\n');
  assert.equal(text.replaceAll('\r\n', '').includes('\r'), false);
});

test('a note is the last field, quoted when it holds a comma; no note is empty', () => {
  assert.equal(formatCsv([task({ note: 'bank, transfer' })]), HEADER + '1,x,open,,,"bank, transfer"\r\n');
  assert.equal(formatCsv([task({ note: null })]), HEADER + '1,x,open,,,\r\n');
});
