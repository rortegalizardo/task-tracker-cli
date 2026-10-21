'use strict';

// The stored list: where it lives, how it is read and checked, and how it is
// written whole and atomically.
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
const crypto = require('node:crypto');
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
    case 'EEXIST': return 'it exists but is not a folder';
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

// The atomic primitive: write `text` to a temp file next to `file`, flush it,
// rename it over `file`, then flush the folder. A symlink at `file` is replaced
// by a regular file; its target is left alone. Also used by export (RCDEV-830).
function replaceFile(file, text, mode) {
  const dir = path.dirname(file);
  const tmp = path.join(
    dir,
    '.' + path.basename(file) + '.' + process.pid + '.' + crypto.randomBytes(6).toString('hex') + '.tmp',
  );
  let created = false;
  try {
    const fd = fs.openSync(tmp, 'wx', mode ?? 0o666);
    created = true;
    try {
      // The umask cannot weaken an explicit mode.
      if (mode !== undefined) fs.fchmodSync(fd, mode);
      const buf = Buffer.from(text, 'utf8');
      let offset = 0;
      while (offset < buf.length) {
        offset += fs.writeSync(fd, buf, offset, buf.length - offset);
      }
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmp, file);
    const dirFd = fs.openSync(dir, 'r');
    try {
      fs.fsyncSync(dirFd);
    } finally {
      fs.closeSync(dirFd);
    }
  } catch (err) {
    if (created) {
      try {
        fs.unlinkSync(tmp);
      } catch {
        // best effort
      }
    }
    throw err;
  }
}

// Validates, then replaces tasks.json whole. Never writes a list it could not
// read back.
function writeList(list, env) {
  const problem = validateList(list);
  if (problem !== null) throw new TtcError('cannot write a list that is not valid: ' + problem);
  const { dir, file } = dataPaths(env);
  try {
    const made = fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    // Only a folder this call created; the umask cannot weaken it.
    if (made !== undefined) fs.chmodSync(dir, 0o700);
    replaceFile(file, JSON.stringify(list, null, 2) + '\n', 0o600);
  } catch (err) {
    throw new TtcError('cannot write ' + file + ': ' + reasonOf(err));
  }
}

module.exports = { dataPaths, validateList, readList, replaceFile, writeList };
