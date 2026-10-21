'use strict';

// The stored list: where it lives, how it is read and checked.
//
// Stored layout (fixed by C7; later stories' tests write it directly):
//
//   { "nextId": <int>, "tasks": [ { "id": <int>, "title": <string>, "status": "open"|"done", "due": "YYYY-MM-DD"|null, "tags": [<string>...] } ] }
//
// Key order is as shown. Storage keeps the task order and tag order it is
// given; sorting for display belongs to the list command.
//
// fs.* and os.homedir() are always called through the module objects, so
// tests can patch them.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { TtcError } = require('./errors');
const { titleProblem, tagProblem, isValidDate } = require('./rules');

const MAX_NEXT_ID = 2 ** 53; // 9007199254740992

function dataPaths(env = process.env) {
  const dir = env.TTC_HOME ? env.TTC_HOME : path.join(os.homedir(), '.ttc');
  return { dir, file: path.join(dir, 'tasks.json') };
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function onlyKeys(obj, keys) {
  return Object.keys(obj).every((k) => keys.includes(k));
}

// Returns null, or the first problem as a non-empty single-line string.
function validateList(data) {
  if (!isPlainObject(data)) return 'the list is not an object';
  if (!onlyKeys(data, ['nextId', 'tasks'])) return 'the list has an unknown key';
  if (!Array.isArray(data.tasks)) return 'tasks is not an array';

  const seen = new Set();
  let highest = 0;
  for (let i = 0; i < data.tasks.length; i++) {
    const task = data.tasks[i];
    const position = 'task at position ' + (i + 1);
    if (!isPlainObject(task)) return position + ' is not an object';
    if (!onlyKeys(task, ['id', 'title', 'status', 'due', 'tags'])) {
      return position + ' has an unknown key';
    }
    if (!Number.isSafeInteger(task.id) || task.id < 1) {
      return position + ' has an invalid id';
    }
    const label = 'task ' + task.id;
    if (seen.has(task.id)) return 'task id ' + task.id + ' is used twice';
    seen.add(task.id);
    if (task.id > highest) highest = task.id;

    const tp = titleProblem(task.title);
    if (tp !== null) return label + ': ' + tp;
    if (task.status !== 'open' && task.status !== 'done') {
      return label + ': status is not "open" or "done"';
    }
    if (task.due !== null && !isValidDate(task.due)) {
      return label + ': due date is not a valid YYYY-MM-DD date';
    }
    if (!Array.isArray(task.tags)) return label + ': tags is not an array';
    const tags = new Set();
    for (const tag of task.tags) {
      const gp = tagProblem(tag);
      if (gp !== null) return label + ': ' + gp;
      if (tags.has(tag)) return label + ': tag ' + JSON.stringify(tag) + ' is repeated';
      tags.add(tag);
    }
  }

  if (!Number.isInteger(data.nextId) || data.nextId < 1 || data.nextId > MAX_NEXT_ID) {
    return 'nextId is not a whole number from 1 to ' + MAX_NEXT_ID;
  }
  if (data.nextId <= highest) return 'nextId is not higher than every task id';
  return null;
}

function reasonOf(err) {
  switch (err.code) {
    case 'EISDIR': return 'it is a folder';
    case 'ENOTDIR': return 'a parent of it is not a folder';
    case 'EACCES':
    case 'EPERM': return 'permission denied';
    default: return err.code || 'unknown error';
  }
}

// Never writes. A missing file is an empty list.
function readList(env) {
  const { file } = dataPaths(env);
  const fail = (reason) => new TtcError('cannot read ' + file + ': ' + reason);
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return { nextId: 1, tasks: [] };
    throw fail(reasonOf(err));
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw fail('not valid JSON');
  }
  const problem = validateList(data);
  if (problem !== null) throw fail(problem);
  return data;
}

module.exports = { dataPaths, validateList, readList };
