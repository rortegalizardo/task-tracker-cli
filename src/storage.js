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
const TASKS_FILE = 'tasks.json';

function dataPaths(env = process.env) {
  const dir = env.TTC_HOME ? env.TTC_HOME : path.join(os.homedir(), '.ttc');
  return { dir, file: path.join(dir, TASKS_FILE) };
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
    case 'ENOENT': return 'no such file or folder';
    case 'EACCES':
    case 'EPERM': return 'permission denied';
    default: return err.code || 'unknown error';
  }
}

// The one serialization of a list: documented key order, two-space indent, a
// final line break. Used by writeList and export.
function serializeList(list) {
  const canonical = {
    nextId: list.nextId,
    tasks: list.tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, due: t.due, tags: t.tags })),
  };
  return JSON.stringify(canonical, null, 2) + '\n';
}

// The one parse path for stored lists and import files. Returns { list } or
// { problem }; never throws. A whole number JSON.parse would round (above
// 2^53-1) becomes NaN, so the id and nextId checks refuse it.
function parseList(text) {
  let data;
  try {
    data = JSON.parse(text, (key, value, context) => {
      if (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        !Number.isSafeInteger(value) &&
        context.source !== String(value)
      ) {
        return NaN;
      }
      return value;
    });
  } catch {
    return { problem: 'not valid JSON' };
  }
  const problem = validateList(data);
  if (problem !== null) return { problem };
  return { list: data };
}

// The text of `bytes`, or null when they are not strict UTF-8. A byte order
// mark is kept (as U+FEFF), so a BOM still fails as "not valid JSON". Reading
// with 'utf8' instead would replace bad bytes with U+FFFD and accept them.
function decodeUtf8(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return null;
  }
}

// Never writes. A missing file is an empty list.
function readList(env) {
  const { file } = dataPaths(env);
  const fail = (reason) => new TtcError('cannot read ' + file + ': ' + reason);
  let bytes;
  try {
    bytes = fs.readFileSync(file);
  } catch (err) {
    if (err.code === 'ENOENT') return { nextId: 1, tasks: [] };
    throw fail(reasonOf(err));
  }
  const text = decodeUtf8(bytes);
  if (text === null) throw fail('not valid UTF-8');
  const parsed = parseList(text);
  if (parsed.problem !== undefined) throw fail(parsed.problem);
  return parsed.list;
}

// The name replaceFile gives its temp file: a dot, the target's basename, the
// writer's pid, 12 random hex characters, ".tmp".
function tempName(base, pid) {
  return '.' + base + '.' + pid + '.' + crypto.randomBytes(6).toString('hex') + '.tmp';
}

// Matches the temp names of tasks.json only; group 1 is the writer's pid.
const TASKS_TEMP = new RegExp(
  '^\\.' + TASKS_FILE.replace(/\./g, '\\.') + '\\.([1-9][0-9]*)\\.[0-9a-f]{12}\\.tmp$',
);

// The atomic primitive: write `text` to a temp file next to `file`, flush it,
// rename it over `file`, then flush the folder. A symlink at `file` is replaced
// by a regular file; its target is left alone. Also used by export (RCDEV-830).
function replaceFile(file, text, mode) {
  const dir = path.dirname(file);
  const tmp = path.join(dir, tempName(path.basename(file), process.pid));
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

// Creates the data folder (and missing parents) with mode 0700. Returns what
// mkdir returned: the outermost folder it created, or undefined when the
// folder already existed. Throws raw fs errors; callers wrap them.
function makeDataFolder(dir) {
  const made = fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  // Only a folder this call created; the umask cannot weaken it.
  if (made !== undefined) fs.chmodSync(dir, 0o700);
  return made;
}

// Flushes the parent of every folder makeDataFolder created, innermost first,
// so the new folders survive a power cut. `made` is makeDataFolder's result;
// undefined means nothing was created and nothing is flushed.
function syncNewFolders(dir, made) {
  if (made === undefined) return;
  const stop = path.resolve(made);
  let current = path.resolve(dir);
  for (;;) {
    const parent = path.dirname(current);
    if (parent === current) return; // filesystem root: nothing above it
    const fd = fs.openSync(parent, 'r');
    try {
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    if (current === stop) return;
    current = parent;
  }
}

// Removes temp files of tasks.json left by writers that died: names matching
// the temp shape whose pid belongs to no running process. Call it only while
// holding the lock. Never throws and never reports; a failure to list or to
// remove just leaves the file for the next command.
function removeLeftoverTemps(dir) {
  let names;
  try {
    names = fs.readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const m = TASKS_TEMP.exec(name);
    if (m === null) continue;
    try {
      process.kill(Number(m[1]), 0);
      continue; // alive
    } catch (err) {
      if (err.code !== 'ESRCH') continue; // EPERM or anything else: keep
    }
    try {
      fs.unlinkSync(path.join(dir, name));
    } catch {
      // best effort
    }
  }
}

// Validates, then replaces tasks.json whole. Never writes a list it could not
// read back. Creates the data folder if missing and flushes the parent of each
// folder it created.
function writeList(list, env) {
  const problem = validateList(list);
  if (problem !== null) throw new TtcError('cannot write a list that is not valid: ' + problem);
  const { dir, file } = dataPaths(env);
  try {
    const made = makeDataFolder(dir);
    replaceFile(file, serializeList(list), 0o600);
    syncNewFolders(dir, made);
  } catch (err) {
    throw new TtcError('cannot write ' + file + ': ' + reasonOf(err));
  }
}

module.exports = {
  dataPaths,
  validateList,
  serializeList,
  decodeUtf8,
  parseList,
  reasonOf,
  readList,
  replaceFile,
  makeDataFolder,
  syncNewFolders,
  removeLeftoverTemps,
  writeList,
};
