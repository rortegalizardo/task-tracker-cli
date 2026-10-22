'use strict';

// The stored list: where it lives, how it is read and checked, and how it is
// written whole and atomically.
//
// Stored layout, format version 2 (the current one; later stories' tests write
// it directly):
//
//   { "version": 2, "nextId": <int>, "tasks": [ { "id": <int>, "title": <string>, "status": "open"|"done", "due": "YYYY-MM-DD"|null, "tags": [<string>...] } ] }
//
// Key order is as shown. Storage keeps the task order and tag order it is
// given; sorting for display belongs to the list command.
//
// Version 1 is the same layout without the "version" key (an explicit
// "version": 1 is also version 1). It is still read; the next changing command
// writes version 2. A version above the current one is refused, and a bad
// "version" value is an invalid list. The in-memory list is always
// { nextId, tasks }: the version belongs to the file, not to the list.
//
// A future format is added in the "Formats" section below by registering one
// FORMATS entry: its validator and the step that upgrades the previous
// version's document. parseList does not change.
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

// ---- Formats ---------------------------------------------------------------
// One entry per stored format version, oldest first. `validate(doc)` returns
// null or the first problem for a document of that version. `upgrade(doc)`
// (every entry but the first) turns a valid document of the previous version
// into this version; it is pure. parseList walks this list and nothing else.

// Version 1: today's body, with or without an explicit "version": 1.
function validateV1(doc) {
  if (!isPlainObject(doc)) return 'the list is not an object';
  const { version, ...body } = doc;
  return validateList(body);
}

// Version 2: "version": 2 plus the same body.
function validateV2(doc) {
  if (!isPlainObject(doc)) return 'the list is not an object';
  if (doc.version !== 2) return 'the version is not 2';
  const { version, ...body } = doc;
  return validateList(body);
}

// Version 1 -> 2: the same body with "version": 2 first. Does not mutate `doc`.
// Object rest and spread define own keys, so a parsed "__proto__" key stays an
// ordinary key for validateList to refuse.
function migrateV1ToV2(doc) {
  const { version, ...body } = doc;
  return { version: 2, ...body };
}

const FORMATS = [
  { version: 1, validate: validateV1 },
  { version: 2, validate: validateV2, upgrade: migrateV1ToV2 },
];

const CURRENT_VERSION = FORMATS[FORMATS.length - 1].version;

// The format version a parsed document claims: { version } or { problem }.
// No "version" key is version 1; so is anything that is not an object, so the
// version 1 check reports it as before. The version is judged before any
// layout check, because a newer file may have any layout.
function fileVersion(data) {
  if (!isPlainObject(data) || !Object.hasOwn(data, 'version')) return { version: 1 };
  const v = data.version;
  if (!Number.isInteger(v) || v < 1) {
    return { problem: 'the version is not a whole number of 1 or more' };
  }
  if (v > CURRENT_VERSION) {
    return {
      problem:
        'it was written by a newer ttc (format version ' + v + '; this ttc reads up to version ' + CURRENT_VERSION + ')',
    };
  }
  return { version: v };
}
// ---- end of Formats --------------------------------------------------------

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

// The one serialization of a list, always in the current format: documented
// key order, two-space indent, a final line break. Used by writeList and export.
function serializeList(list) {
  const canonical = {
    version: CURRENT_VERSION,
    nextId: list.nextId,
    tasks: list.tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, due: t.due, tags: t.tags })),
  };
  return JSON.stringify(canonical, null, 2) + '\n';
}

// The one parse path for stored lists and import files: detect the version,
// check the document as that version, upgrade it step by step to the current
// version, check it again, and return the list without its version. Returns
// { list } or { problem }; never throws. A whole number JSON.parse would round (above
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
  const found = fileVersion(data);
  if (found.problem !== undefined) return { problem: found.problem };
  let doc = data;
  let problem = FORMATS[found.version - 1].validate(doc);
  if (problem !== null) return { problem };
  for (const format of FORMATS.slice(found.version)) doc = format.upgrade(doc);
  problem = FORMATS[FORMATS.length - 1].validate(doc);
  if (problem !== null) return { problem };
  const { version, ...list } = doc;
  return { list };
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
    replaceFile(file, serializeList(list), 0o600);
  } catch (err) {
    throw new TtcError('cannot write ' + file + ': ' + reasonOf(err));
  }
}

module.exports = {
  dataPaths,
  validateList,
  FORMATS,
  CURRENT_VERSION,
  migrateV1ToV2,
  serializeList,
  decodeUtf8,
  parseList,
  reasonOf,
  readList,
  replaceFile,
  writeList,
};
