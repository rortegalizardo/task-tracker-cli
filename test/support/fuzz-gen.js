'use strict';

// Case generators for the two generated properties. Each takes a case PRNG
// (fuzz-random.js) and returns { argv, files, label }:
//   argv   the argument list given to run()
//   files  { 'path relative to the case folder': { kind: 'file', bytes } | { kind: 'dir' } }
//   label  a short class name, counted by the harness's coverage floor
//
// The generators only aim; the reference model decides what is valid. They
// never emit NUL or a lone surrogate in argv (a real argv cannot carry them),
// and never an absolute path or "..".

const MAX_SAFE = Number.MAX_SAFE_INTEGER;
const COMMANDS = ['help', 'add', 'copy', 'list', 'done', 'reopen', 'important', 'unimportant', 'postpone', 'rename', 'delete', 'clean', 'tag', 'note', 'export', 'import', 'stats'];

const DIR = { kind: 'dir' };
const file = (bytes) => ({ kind: 'file', bytes: Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes, 'utf8') });
const STORED = 'home/tasks.json';

// ---- values ----------------------------------------------------------------

const WORDS = [
  'buy', 'milk', 'write', 'report', 'call', 'mom', 'fix', 'bug', 'plan', 'trip', 'review', 'pr',
  'x', 'Ünï', '日本語', 'naïve', '😀', '𝒳', 'a  b', '\u00a0pad', 'pad\u00a0', '\u3000', 'q"uote', 'back\\slash', 'a,b', '=SUM(1)', '"q",x',
  '{json}', '[1,2]', '#1', 'due:2024-01-01', '!overdue', '+tag', '-x', '\ufeffbom', '\u200bzw',
];

function validTitle(r) {
  const n = r.int(1, 4);
  const words = [];
  for (let i = 0; i < n; i++) words.push(r.pick(WORDS));
  let title = words.join(' ');
  if (r.chance(0.04)) title += ' ' + r.string(r.int(100, 600), 'abcdefgh ij');
  return title.replace(/^ +| +$/g, '') || 'x';
}

function typedTitle(r) {
  return ' '.repeat(r.chance(0.2) ? r.int(1, 3) : 0) + validTitle(r) + ' '.repeat(r.chance(0.2) ? r.int(1, 3) : 0);
}

const ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';
const TAG_POOL = ['work', 'home', 'a', 'b', 'urgent', 'x_y', '0', '9z', 'p-1'];

function validTag(r) {
  if (r.chance(0.7)) return r.pick(TAG_POOL);
  return r.string(1, ALNUM) + r.string(r.int(0, 31), ALNUM + '_-');
}

function mixCase(r, s) {
  return Array.from(s, (c) => (r.chance(0.3) ? c.toUpperCase() : c)).join('');
}

function daysIn(y, m) {
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

function pad(n, w) {
  return String(n).padStart(w, '0');
}

function validDate(r) {
  if (r.chance(0.08)) return r.pick(['0000-01-01', '9999-12-31', '2024-02-29', '2000-02-29', '2100-02-28', '0000-02-29']);
  const y = r.chance(0.8) ? r.int(2020, 2040) : r.pick([0, 1, 4, 100, 400, 1900, 2000, 2100, 9999, r.int(0, 9999)]);
  const m = r.int(1, 12);
  return pad(y, 4) + '-' + pad(m, 2) + '-' + pad(r.int(1, daysIn(y, m)), 2);
}

const BAD_DATES = [
  '2023-02-29', '2100-02-29', '2024-13-01', '2024-00-10', '2024-01-32', '2024-01-00', '2024-1-1', '24-01-01',
  '２０２４-０１-０１', '2024/01/01', '2024-01-01T00:00', ' 2024-01-01', '2024-01-01 ', '', 'tomorrow', '10000-01-01',
  '-001-01-01', '2024-01-011', '+2024-01-01',
];

const BAD_IDS = [
  '0', '-1', '1.5', '+1', '1e3', ' 1', '1 ', '٣', '９', '9007199254740991', '9007199254740992',
  '99999999999999999999999999', 'abc', '', '0x10', '00', '1_0', '0000000000000000000001',
];

const BAD_TITLES = [
  '', '   ', '\t', 'a\tb', 'a\nb', 'a\rb', 'a\r\nb', 'a\u0085b', 'a\u2028b', 'a\u2029b', '\u0001', '\u007f', '\u009f',
  'tab\tend', '\nlead', 'é ü', '😀 emoji', 'x'.repeat(5000), '\u00a0', '\u3000', '\ufeff', '\u001b[31mred',
];

const BAD_TAGS = [
  'Work', 'WORK', 'x'.repeat(32), 'x'.repeat(33), '_x', '-x', 'é', '', 'a b', 'a.b', 'ａ', '😀', 'a\u0301', '0', 'a-',
];

const UNKNOWN_NAMES = ['ADD', 'Add', 'lis', 'help ', ' help', '__proto__', 'toString', 'constructor', '', 'hasOwnProperty',
  'add\n', 'rm', 'delet', 'export2', '-h', '-', '?', 'ａｄｄ', 'h'];

const UNKNOWN_OPTIONS = ['--x', '--TAG', '--Open', '--due=2024-01-01', '--tag=a', '--help', '--', '--a b', '---', '--\u00e9'];

// ---- stored lists ----------------------------------------------------------

function genTags(r) {
  const tags = [];
  for (let i = r.chance(0.5) ? r.int(0, 4) : 0; i > 0; i--) {
    const t = validTag(r);
    if (!tags.includes(t)) tags.push(t);
  }
  return tags;
}

// A valid stored list: ids with gaps, mixed status, due, tags and note (null
// or a valid one-line text) and important mark, nextId sometimes at 2^53-1 or 2^53. cfg = { min, max }.
function genList(r, cfg = {}) {
  const n = r.int(cfg.min ?? 0, cfg.max ?? 30);
  const tasks = [];
  let id = r.int(1, 3);
  for (let i = 0; i < n; i++) {
    tasks.push({
      id,
      title: validTitle(r),
      status: r.chance(0.4) ? 'done' : 'open',
      due: r.chance(0.5) ? null : validDate(r),
      tags: genTags(r),
      note: r.chance(0.5) ? null : validTitle(r),
      important: r.chance(0.3),
    });
    id += r.chance(0.6) ? 1 : r.int(2, 6);
  }
  if (n > 0 && r.chance(0.04)) tasks[n - 1].id = MAX_SAFE;
  const highest = n === 0 ? 0 : tasks[n - 1].id;
  let nextId = highest + 1 + (r.chance(0.3) ? r.int(1, 5) : 0);
  if (n === 0) nextId = r.int(1, 5);
  if (highest < MAX_SAFE && r.chance(0.04)) nextId = MAX_SAFE;
  if (r.chance(0.03) || highest === MAX_SAFE) nextId = 2 ** 53;
  if (r.chance(0.15)) r.shuffle(tasks);
  return { nextId, tasks };
}

// The list without its notes and marks: the shape of versions 1 and 2.
function stripNotes(list) {
  return { nextId: list.nextId, tasks: list.tasks.map(({ note, important, ...t }) => t) };
}

// The list without its marks: the shape of version 3.
function stripImportant(list) {
  return { nextId: list.nextId, tasks: list.tasks.map(({ important, ...t }) => t) };
}

// Version 4 as ttc writes it: "version": 4 first, a note and a mark on every task.
function canonicalText(list) {
  return JSON.stringify({ version: 4, nextId: list.nextId, tasks: list.tasks }, null, 2) + '\n';
}

// Version 1 as written before RCDEV-837: no "version" key, no notes, no marks.
function plainText(list) {
  const { nextId, tasks } = stripNotes(list);
  return JSON.stringify({ nextId, tasks }, null, 2) + '\n';
}

// Valid JSON for the list with random key order, indentation and outer
// whitespace.
function messyText(r, list) {
  const reorder = (o) => {
    const out = {};
    for (const k of r.shuffle(Object.keys(o))) out[k] = o[k];
    return out;
  };
  const version = r.chance(0.3) ? r.pick([1, 2, 3, 4]) : null;
  const withVersion = version === null ? {} : { version };
  // Notes belong to versions 3 and 4, marks to version 4 only.
  const body = version === 4 ? list : version === 3 ? stripImportant(list) : stripNotes(list);
  const obj = reorder({ ...withVersion, nextId: list.nextId, tasks: body.tasks.map((t) => reorder({ ...t })) });
  const ws = () => r.string(r.int(0, 2), ' \n\t\r');
  return ws() + JSON.stringify(obj, null, r.pick([undefined, 1, 2, 3, 4, '\t'])) + ws();
}

// Valid stored lists come in five forms: no version key (version 1 as written
// before RCDEV-837), "version": 1 first, "version": 2 first, "version": 3
// first (notes, no marks) and "version": 4 first (canonical, notes and marks).
// Versions 1 and 2 carry no notes.
function versionedText(list, version) {
  const { nextId, tasks } = version === 3 ? stripImportant(list) : stripNotes(list);
  return JSON.stringify({ version, nextId, tasks }, null, 2) + '\n';
}

function listBytes(r, list) {
  const form = r.pick(['plain', 'v1', 'v2', 'v3', 'v4']);
  if (form === 'v1') return Buffer.from(versionedText(list, 1), 'utf8');
  if (form === 'v2') return Buffer.from(versionedText(list, 2), 'utf8');
  if (form === 'v3') return Buffer.from(versionedText(list, 3), 'utf8');
  if (form === 'v4') return Buffer.from(canonicalText(list), 'utf8');
  return Buffer.from(r.chance(0.5) ? plainText(list) : messyText(r, list), 'utf8');
}

// ---- argument lists --------------------------------------------------------

function validIdToken(r, list) {
  if (list !== null && list.tasks.length > 0 && r.chance(0.85)) {
    return '0'.repeat(r.chance(0.1) ? r.int(1, 3) : 0) + String(r.pick(list.tasks).id);
  }
  return String(r.int(1, 40));
}

const BAD_FORMATS = ['xml', 'CSV', ''];
const EXPORT_TARGETS = ['out.json', 'out.json', 'out.json', 'existing.json', 'existing.json', 'nodir/out.json', 'adir', '', 'a b.json', '-x.json'];
const IMPORT_TARGETS = ['import.json', 'import.json', 'import.json', 'import.json', 'import.json', 'import.json', 'missing.json', 'adir', ''];

// The units of one command's arguments: { tokens, opt, value, repeat }. A
// positional unit has opt === undefined.
function buildUnits(r, cmd, list, junkP, importTarget) {
  const junk = () => r.chance(junkP);
  const id = () => (junk() ? r.pick(BAD_IDS) : validIdToken(r, list));
  const title = () => (junk() ? r.pick(BAD_TITLES) : typedTitle(r));
  const tag = () => (junk() ? r.pick(BAD_TAGS) : mixCase(r, validTag(r)));
  const date = () => (junk() ? r.pick(BAD_DATES) : validDate(r));
  // Mostly a word or a slice of one, so matches occur against generated titles;
  // sometimes a slice of a task's note, so note-only hits occur too.
  const search = () => {
    if (junk()) return '';
    const noted = list === null ? [] : list.tasks.filter((t) => t.note !== null);
    if (noted.length > 0 && r.chance(0.3)) {
      const chars = Array.from(r.pick(noted).note);
      const start = r.int(0, chars.length - 1);
      const slice = chars.slice(start, start + r.int(1, 6)).join('');
      if (!slice.startsWith('-')) return mixCase(r, slice);
    }
    const word = r.pick(WORDS);
    if (r.chance(0.5)) return mixCase(r, word);
    const chars = Array.from(word);
    const start = r.int(0, chars.length - 1);
    return mixCase(r, chars.slice(start, start + r.int(1, 4)).join(''));
  };
  const pos = (token) => ({ tokens: [token] });
  const opt = (name, value, repeat = false) => ({ tokens: value === undefined ? [name] : [name, value], opt: name, value: value !== undefined, repeat });

  const positionals = [];
  const options = [];
  // The filter options shared by list and export.
  const filterOptions = () => {
    if (r.chance(0.6)) options.push(opt(r.pick(['--open', '--done', '--all', '--overdue'])));
    if (r.chance(0.3)) options.push(opt('--tag', tag()));
    if (r.chance(0.25)) options.push(opt('--due-from', date()));
    if (r.chance(0.25)) options.push(opt('--due-to', date()));
    if (r.chance(0.25)) options.push(opt('--search', search()));
  };
  switch (cmd) {
    case 'add':
      positionals.push(pos(title()));
      if (r.chance(0.5)) options.push(opt('--due', date()));
      for (let i = r.chance(0.5) ? r.int(1, 3) : 0; i > 0; i--) options.push(opt('--tag', tag(), true));
      if (r.chance(0.3)) options.push(opt('--note', title()));
      if (r.chance(0.3)) options.push(opt('--important'));
      break;
    case 'copy':
      positionals.push(pos(id()));
      if (r.chance(0.5)) options.push(opt('--due', date()));
      break;
    case 'list':
      filterOptions();
      break;
    case 'done':
    case 'reopen':
    case 'important':
    case 'unimportant':
    case 'postpone':
    case 'delete':
      positionals.push(pos(id()));
      break;
    case 'rename':
      positionals.push(pos(id()), pos(title()));
      break;
    case 'tag': {
      const signed = junk()
        ? r.pick(['+', '-', 'x', '*x', '+ x', '-+x', '++x', '+' + r.pick(BAD_TAGS), '-' + r.pick(BAD_TAGS)])
        : r.pick(['+', '-']) + mixCase(r, validTag(r));
      positionals.push(pos(id()), pos(signed));
      break;
    }
    case 'note':
      positionals.push(pos(id()));
      if (r.chance(0.6)) positionals.push(pos(title()));
      if (r.chance(0.3)) options.push(opt('--clear'));
      break;
    case 'export':
      if (r.chance(0.7)) positionals.push(pos(r.pick(EXPORT_TARGETS)));
      if (r.chance(0.5)) options.push(opt('--format', junk() ? r.pick(BAD_FORMATS) : r.pick(['json', 'csv'])));
      filterOptions();
      break;
    case 'import':
      positionals.push(pos(importTarget ?? r.pick(IMPORT_TARGETS)));
      break;
    default: // help, stats, clean
  }
  const units = [...positionals];
  for (const o of options) units.splice(r.int(0, units.length), 0, o);
  return units;
}

// A structural break of the grammar: tokens that no command accepts.
function breakStructure(r, units) {
  const kind = r.int(0, 7);
  const insertAt = () => r.int(0, units.length);
  const options = units.filter((u) => u.opt !== undefined);
  switch (kind) {
    case 0:
      units.splice(insertAt(), 0, { tokens: [r.pick(UNKNOWN_OPTIONS)] });
      break;
    case 1: {
      const u = options.length ? r.pick(options) : { tokens: [r.pick(['--open', '--all'])] };
      units.splice(insertAt(), 0, { tokens: [...u.tokens] });
      break;
    }
    case 2: {
      const withValue = options.filter((u) => u.value);
      if (withValue.length) r.pick(withValue).tokens.pop();
      else units.push({ tokens: ['--due'] });
      break;
    }
    case 3: {
      const withValue = options.filter((u) => u.value);
      if (withValue.length) r.pick(withValue).tokens[1] = r.pick(['--', '--x', '--tag', '--due']);
      else units.push({ tokens: ['--tag', '--x'] });
      break;
    }
    case 4:
      units.push({ tokens: [r.pick(['extra', '-x', '-1', '', 'a b', '😀'])] });
      break;
    case 5: {
      const positionals = units.filter((u) => u.opt === undefined);
      if (positionals.length) units.splice(units.indexOf(r.pick(positionals)), 1);
      else units.push({ tokens: [] });
      break;
    }
    case 6:
      units.splice(insertAt(), 0, { tokens: ['--'] });
      break;
    default:
      units.splice(insertAt(), 0, { tokens: [r.pick(['--open', '--done', '--all', '--overdue'])] });
  }
}

const flatten = (units) => units.flatMap((u) => u.tokens);

// ---- property 1: random argument lists -------------------------------------

const ARGS_LABELS = [...COMMANDS, 'unknown', 'empty', 'dash-help'];

function genArgsCase(r) {
  // State first: the argument builder aims at ids that exist.
  const files = {};
  let list = null;
  const stateRoll = r.next();
  if (stateRoll < 0.12) {
    // no home folder at all
  } else if (stateRoll < 0.2) {
    files.home = DIR;
  } else {
    list = stateRoll < 0.3 ? { nextId: r.int(1, 4), tasks: [] } : genList(r);
    files[STORED] = file(listBytes(r, list));
  }

  const roll = r.next();
  let label;
  let argv;
  if (roll < 0.03) {
    label = 'empty';
    argv = [];
  } else if (roll < 0.06) {
    label = 'dash-help';
    argv = ['--help'];
    if (r.chance(0.2)) argv.push(...flatten(buildUnits(r, r.pick(COMMANDS), list, 0.1)));
  } else if (roll < 0.1) {
    label = 'unknown';
    argv = [r.pick(UNKNOWN_NAMES), ...flatten(buildUnits(r, r.pick(COMMANDS), list, 0.05))];
  } else {
    label = r.pick(COMMANDS);
    const units = buildUnits(r, label, list, 0.04);
    if (r.chance(0.1)) breakStructure(r, units);
    argv = [label, ...flatten(units)];
  }

  // Fixtures the export and import targets point at.
  if (argv[0] === 'export' || label === 'unknown' || label === 'dash-help') {
    if (r.chance(0.8)) files['existing.json'] = file(r.string(r.int(0, 30), 'abc {}\n'));
    if (r.chance(0.8)) files.adir = DIR;
  }
  if (argv[0] === 'import' || label === 'unknown' || label === 'dash-help') {
    if (r.chance(0.9)) {
      files['import.json'] = r.chance(0.85)
        ? file(listBytes(r, genList(r, { max: 12 })))
        : file(r.pick(['{}', '', '[]', 'x', '{"nextId":1,"tasks":[{}]}']));
    }
    if (r.chance(0.8)) files.adir = DIR;
  }
  return { argv, files, label };
}

// ---- property 2: corrupted data --------------------------------------------

class Raw {
  constructor(text) {
    this.text = text;
  }
}

// JSON.stringify that lets a value be written as raw source text.
function stringifyRaw(value, indent) {
  const raws = [];
  const text = JSON.stringify(
    value,
    (k, v) => {
      if (v instanceof Raw) {
        raws.push(v.text);
        return '\u0001RAW' + (raws.length - 1) + '\u0001';
      }
      return v;
    },
    indent,
  );
  return text.replace(/"\\u0001RAW(\d+)\\u0001"/g, (m, i) => raws[Number(i)]);
}

const BOM = Buffer.from([0xef, 0xbb, 0xbf]);

// Bytes inserted inside the first stored title that has text.
function insertInTitle(list, insertion, atEnd) {
  const text = canonicalText(list);
  const needle = JSON.stringify(list.tasks[0].title);
  const at = text.indexOf(needle) + (atEnd ? needle.length - 1 : 1);
  return Buffer.concat([Buffer.from(text.slice(0, at), 'utf8'), Buffer.from(insertion), Buffer.from(text.slice(at), 'utf8')]);
}

// Kinds that need tasks in the list.
const NEEDS_ONE = new Set(['utf8-lone80', 'utf8-c328', 'utf8-overlong', 'utf8-cesu', 'utf8-cut', 'wt-id', 'wt-title',
  'wt-status', 'wt-due', 'wt-tags', 'wt-note', 'wt-important', 'no-important', 'key-task', 'unsafe-id', 'bad-title', 'bad-due', 'bad-tag', 'esc-surrogate',
  'nextId-low']);
const minTasks = (kind) => (kind === 'dup-id' ? 2 : NEEDS_ONE.has(kind) ? 1 : 0);

function mutateTask(r, list, field, values) {
  const copy = JSON.parse(JSON.stringify(list));
  r.pick(copy.tasks)[field] = r.pick(values);
  return copy;
}

// A document with no "version" key would be version 1, which has no notes, so
// the damaged lists (which carry notes and marks) are written as version 4.
function viaJson(r, obj) {
  const doc = Object.hasOwn(obj, 'version') ? obj : { version: 4, ...obj };
  return Buffer.from(stringifyRaw(doc, r.pick([2, 2, undefined, '\t'])), 'utf8');
}

// `version` first in some cases, last in others.
function withVersion(r, list, version) {
  return viaJson(r, r.chance(0.5) ? { version, ...list } : { ...list, version });
}

function insertKey(r, list, where, entry) {
  const text = canonicalText(list);
  const at = where === 'top' ? text.indexOf('{') + 1 : text.indexOf('"id"');
  const comma = where === 'top' ? ',' : ',\n';
  const piece = where === 'top' ? '\n  ' + entry + comma : entry + comma + '\n';
  return Buffer.from(text.slice(0, at) + piece + text.slice(at), 'utf8');
}

const DAMAGE = {
  truncated: (r, list) => {
    const b = Buffer.from(canonicalText(list), 'utf8');
    return b.subarray(0, r.int(0, b.length - 1));
  },
  flip1: (r, list) => {
    const b = Buffer.from(canonicalText(list), 'utf8');
    b[r.int(0, b.length - 1)] ^= r.int(1, 255);
    return b;
  },
  flipN: (r, list) => {
    const b = Buffer.from(canonicalText(list), 'utf8');
    for (let i = r.int(2, 8); i > 0; i--) b[r.int(0, b.length - 1)] ^= r.int(1, 255);
    return b;
  },
  empty: () => Buffer.alloc(0),
  'utf8-lone80': (r, list) => insertInTitle(list, [0x80], false),
  'utf8-c328': (r, list) => insertInTitle(list, [0xc3, 0x28], false),
  'utf8-overlong': (r, list) => insertInTitle(list, r.pick([[0xc0, 0xaf], [0xe0, 0x80, 0xaf], [0xc1, 0xbf]]), false),
  'utf8-cesu': (r, list) => insertInTitle(list, r.pick([[0xed, 0xa0, 0x80], [0xed, 0xbf, 0xbf]]), false),
  'utf8-cut': (r, list) => insertInTitle(list, r.pick([[0xe2, 0x82], [0xf0, 0x9f, 0x98], [0xc3]]), true),
  bom: (r, list) => Buffer.concat([BOM, Buffer.from(canonicalText(list), 'utf8')]),
  'not-json': (r) =>
    Buffer.from(r.pick(['not json', '{', 'null', '[]', '1', '"x"', 'nan', '{"nextId":1,"tasks":[]', "{'nextId':1,'tasks':[]}",
      '{"nextId":1,"tasks":[],}', '\u0000', 'true', '{"nextId":1 "tasks":[]}']), 'utf8'),
  'wt-nextId': (r, list) => viaJson(r, { ...list, nextId: r.pick(['1', null, 1.5, [], {}, true, '5', -1, 'x']) }),
  'wt-tasks': (r, list) => viaJson(r, { ...list, tasks: r.pick([{}, null, 'x', 1, [1], [null], [[]], ['a'], true]) }),
  'wt-id': (r, list) => viaJson(r, mutateTask(r, list, 'id', ['1', null, 1.5, true, [], {}, -1, 0])),
  'wt-title': (r, list) => viaJson(r, mutateTask(r, list, 'title', [1, null, [], {}, true])),
  'wt-status': (r, list) => viaJson(r, mutateTask(r, list, 'status', ['OPEN', 'Done', '', 1, null, 'closed', 'open ', true])),
  'wt-due': (r, list) => viaJson(r, mutateTask(r, list, 'due', [20240101, 0, true, [], {}, false])),
  'wt-tags': (r, list) => viaJson(r, mutateTask(r, list, 'tags', ['x', null, [1], [null], {}, [['a']], 0])),
  'wt-note': (r, list) => viaJson(r, mutateTask(r, list, 'note', ['', ' a', 'a ', 'a\nb', 'a\u0085b', 1, [], true])),
  'wt-important': (r, list) => viaJson(r, mutateTask(r, list, 'important', ['yes', 'true', 'false', 1, 0, null, [], {}, 'x'])),
  'no-important': (r, list) => {
    const copy = JSON.parse(JSON.stringify(list));
    delete r.pick(copy.tasks).important;
    return viaJson(r, copy);
  },
  'wt-version': (r, list) => withVersion(r, stripNotes(list), r.pick(['2', '1', null, true, false, [], {}, 'x', 2.5, 1.5])),
  'version-range': (r, list) =>
    withVersion(r, stripNotes(list), new Raw(r.pick(['0', '-1', '-0', '5', '1000', '9007199254740992', '9007199254740993', '1e400', '2.0']))),
  'key-top': (r, list) => insertKey(r, list, 'top', r.pick(['"extra": 1', '"__proto__": {}', '"nextid": 3', '"Tasks": []', '"": 0'])),
  'key-task': (r, list) => insertKey(r, list, 'task', r.pick(['"extra": 1', '"__proto__": null', '"Id": 7', '"": 0', '"tags2": []'])),
  'dup-id': (r, list) => {
    const copy = JSON.parse(JSON.stringify(list));
    copy.tasks[1].id = copy.tasks[0].id;
    return viaJson(r, copy);
  },
  'nextId-low': (r, list) => {
    const highest = Math.max(...list.tasks.map((t) => t.id));
    return viaJson(r, { ...list, nextId: r.pick([0, 1, highest, highest - 1, -5]) });
  },
  'nextId-high': (r, list) =>
    viaJson(r, { ...list, nextId: new Raw(r.pick(['9007199254740993', '9007199254740994', '18014398509481984', '1e300', '1e400', '9007199254740992.5', '90071992547409920'])) }),
  'nextId-num': (r, list) => {
    const highest = Math.max(0, ...list.tasks.map((t) => t.id));
    const bigger = highest + 5;
    return viaJson(r, { ...list, nextId: new Raw(r.pick(['1.0', '2.5', '0.5', '-0', String(bigger) + '.0', String(bigger) + 'e0', '1E2', '1e1', '1e0'])) });
  },
  'unsafe-id': (r, list) => viaJson(r, mutateTask(r, list, 'id', [new Raw(r.pick(['9007199254740993', '9007199254740992', '1e300', '90071992547409910', '-9007199254740991', '9007199254740991.0']))])),
  'bad-title': (r, list) =>
    viaJson(r, mutateTask(r, list, 'title', ['', ' x', 'x ', '\t', 'a\tb', 'a\nb', 'a\r', 'a\u0085', 'a\u2028', 'a\u2029', '\u0000', 'a\u007fb', '\u009f', '   '])),
  'bad-due': (r, list) => viaJson(r, mutateTask(r, list, 'due', BAD_DATES)),
  'bad-tag': (r, list) => {
    const copy = JSON.parse(JSON.stringify(list));
    const t = r.pick(copy.tasks);
    t.tags = r.pick([['A'], ['a b'], [''], ['_x'], ['é'], ['x'.repeat(33)], ['-a'], ['ａ'], ['a', 'a'], ['ok', 'Ok']]);
    return viaJson(r, copy);
  },
  'esc-surrogate': (r, list) => viaJson(r, mutateTask(r, list, 'title', ['a\ud800b', '\udc00', 'x\ud83d', '\udbff\ud800'])),
  'dup-key': (r, list) => {
    const text = canonicalText(list);
    const at = text.indexOf('{') + 1;
    const first = r.pick(['"nextId": 1,', '"tasks": 5,', '"nextId": "x",', '"tasks": [],']);
    return Buffer.from(text.slice(0, at) + '\n  ' + first + text.slice(at), 'utf8');
  },
  deep: (r, list, ctx) => {
    const depth = ctx.deepDepth;
    const text = r.chance(0.5)
      ? '['.repeat(depth) + ']'.repeat(depth)
      : '{"nextId":1,"tasks":' + '['.repeat(depth) + ']'.repeat(depth) + '}';
    return Buffer.from(text, 'utf8');
  },
  large: (r, list, ctx) => {
    ctx.list = genList(r, { min: 4000, max: 7000 });
    return Buffer.from(canonicalText(ctx.list), 'utf8');
  },
  folder: () => null,
};

// Damage kinds picked at random. "large" and the 200000-deep variant of
// "deep" come from a fixed schedule, so their share is exactly bounded.
const RANDOM_KINDS = Object.keys(DAMAGE).filter((k) => k !== 'large');
const DATA_KINDS = [...Object.keys(DAMAGE), 'import-target'];

function damagedFile(r, kind, ctx) {
  const min = minTasks(kind);
  const list = ctx.list.tasks.length >= min ? ctx.list : genList(r, { min, max: 12 });
  const bytes = DAMAGE[kind](r, list, ctx);
  return bytes === null ? DIR : file(bytes);
}

function genDataCase(r, index) {
  const forcedLarge = index % 200 === 7;
  const deepDepth = index % 500 === 11 ? 200000 : 2000;
  let kind = forcedLarge ? 'large' : index % 500 === 11 ? 'deep' : r.pick(RANDOM_KINDS);
  const cmd = r.pick(COMMANDS);
  const files = {};

  // The command works on a valid list; the damage is applied to the file it reads.
  const ctx = { deepDepth, list: genList(r, { min: minTasks(kind), max: 20 }) };

  let importTarget;
  if (cmd === 'import') {
    if (!forcedLarge && index % 500 !== 11 && r.chance(0.2)) {
      kind = 'import-target';
      importTarget = r.pick(['missing.json', 'adir', '', 'import.json']);
      if (importTarget === 'import.json') files['import.json'] = file(listBytes(r, genList(r, { max: 10 })));
    } else if (kind === 'folder') {
      importTarget = 'adir';
    } else {
      importTarget = 'import.json';
      files['import.json'] = damagedFile(r, kind, ctx);
    }
    files.adir = DIR;
    // tasks.json is not read by import: valid, damaged or absent.
    const roll = r.next();
    if (roll < 0.6) files[STORED] = file(listBytes(r, ctx.list));
    else if (roll < 0.9) files[STORED] = damagedFile(r, r.pick(RANDOM_KINDS.filter((k) => k !== 'deep')), { deepDepth: 2000, list: ctx.list });
  } else {
    if (kind === 'import-target') kind = r.pick(RANDOM_KINDS);
    files[STORED] = damagedFile(r, kind, ctx);
    if (cmd === 'export') {
      if (r.chance(0.8)) files['existing.json'] = file(r.string(r.int(0, 30), 'abc {}\n'));
      files.adir = DIR;
    }
  }

  const units = buildUnits(r, cmd, ctx.list, 0, importTarget);
  return { argv: [cmd, ...flatten(units)], files, label: kind };
}

module.exports = { genArgsCase, genDataCase, ARGS_LABELS, DATA_KINDS, COMMANDS };
