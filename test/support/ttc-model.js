'use strict';

// The test-owned reference model (the oracle) for ttc. It is written from the
// documented rules (src/args.js and src/storage.js headers, PD-0002, PD-0003,
// PD-0009, PD-0010, C7) and never requires anything under src/.
//
// expect({ argv, files, today }) returns { ok: false } or
// { ok: true, stdout, files }. `files` maps paths relative to the case folder
// to { kind: 'file' | 'dir', bytes }. A path that is not in the map is
// missing. TTC_HOME is "home", so the stored list is "home/tasks.json", and
// the working folder is the case folder.

const path = require('node:path');

const MAX_SAFE = Number.MAX_SAFE_INTEGER; // 2^53 - 1
const MAX_NEXT_ID = 2 ** 53;
const STORED = 'home/tasks.json';

const USAGE = [
  'ttc help',
  'ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"] [--important]',
  'ttc list [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]',
  'ttc done <id>',
  'ttc reopen <id>',
  'ttc important <id>',
  'ttc unimportant <id>',
  'ttc rename <id> "<title>"',
  'ttc delete <id>',
  'ttc tag <id> +<t> | -<t>',
  'ttc note <id> ["<text>" | --clear]',
  'ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]',
  'ttc import <file>',
  'ttc stats',
];

class Invalid extends Error {}
function invalid() {
  throw new Invalid('invalid');
}

// ---- file tree -------------------------------------------------------------

// A Map of path -> { kind, bytes } that also holds every parent folder.
function fullTree(files) {
  const tree = new Map();
  const entries = files instanceof Map ? [...files] : Object.entries(files);
  for (const [p, node] of entries) {
    tree.set(p, node);
    for (let d = path.posix.dirname(p); d !== '.' && d !== '/'; d = path.posix.dirname(d)) {
      if (!tree.has(d)) tree.set(d, { kind: 'dir' });
    }
  }
  return tree;
}

function kindOf(tree, p) {
  if (p === '.') return 'dir';
  const node = tree.get(p);
  return node === undefined ? 'missing' : node.kind;
}

function putFile(tree, p, text) {
  for (let d = path.posix.dirname(p); d !== '.'; d = path.posix.dirname(d)) {
    if (!tree.has(d)) tree.set(d, { kind: 'dir' });
  }
  tree.set(p, { kind: 'file', bytes: Buffer.from(text, 'utf8') });
}

// ---- strict UTF-8 ----------------------------------------------------------

// The text of `bytes`, or null when they are not strictly valid UTF-8 (no
// stray or missing continuation, no overlong form, no surrogate, nothing above
// U+10FFFF).
function decodeStrict(bytes) {
  const n = bytes.length;
  const cont = (i) => i < n && bytes[i] >= 0x80 && bytes[i] <= 0xbf;
  let i = 0;
  while (i < n) {
    const b = bytes[i];
    if (b < 0x80) {
      i += 1;
    } else if (b >= 0xc2 && b <= 0xdf) {
      if (!cont(i + 1)) return null;
      i += 2;
    } else if (b >= 0xe0 && b <= 0xef) {
      if (!cont(i + 1) || !cont(i + 2)) return null;
      if (b === 0xe0 && bytes[i + 1] < 0xa0) return null;
      if (b === 0xed && bytes[i + 1] > 0x9f) return null;
      i += 3;
    } else if (b >= 0xf0 && b <= 0xf4) {
      if (!cont(i + 1) || !cont(i + 2) || !cont(i + 3)) return null;
      if (b === 0xf0 && bytes[i + 1] < 0x90) return null;
      if (b === 0xf4 && bytes[i + 1] > 0x8f) return null;
      i += 4;
    } else {
      return null;
    }
  }
  return bytes.toString('utf8');
}

// ---- input rules -----------------------------------------------------------

function isBadTitleChar(cp) {
  return cp <= 0x1f || (cp >= 0x7f && cp <= 0x9f) || cp === 0x2028 || cp === 0x2029;
}

function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function isDate(s) {
  if (typeof s !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)) return false;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(5, 7));
  const d = Number(s.slice(8, 10));
  if (m < 1 || m > 12) return false;
  const lengths = [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d >= 1 && d <= lengths[m - 1];
}

function parseId(arg) {
  if (!/^[0-9]+$/.test(arg)) invalid();
  const n = BigInt(arg);
  if (n < 1n || n > BigInt(MAX_SAFE)) invalid();
  return Number(n);
}

function typedTitle(raw) {
  const title = raw.replace(/^ +| +$/g, '');
  if (title === '') invalid();
  for (const ch of title) {
    if (isBadTitleChar(ch.codePointAt(0))) invalid();
  }
  return title;
}

function typedTag(raw) {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(raw)) invalid();
  return raw.toLowerCase();
}

// ---- argument grammar ------------------------------------------------------

// spec = { positionals: n, optional?: k, options: Map(name -> { value, repeat }) }
// The last `optional` of the n positionals may be omitted.
function grammar(args, spec) {
  const positionals = [];
  const options = new Map();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      if (positionals.length >= spec.positionals) invalid();
      positionals.push(arg);
      continue;
    }
    const def = spec.options.get(arg);
    if (def === undefined) invalid();
    if (!def.repeat && options.has(arg)) invalid();
    if (!def.value) {
      options.set(arg, true);
      continue;
    }
    const next = args[i + 1];
    if (next === undefined || next.startsWith('--')) invalid();
    i++;
    if (def.repeat) {
      if (!options.has(arg)) options.set(arg, []);
      options.get(arg).push(next);
    } else {
      options.set(arg, next);
    }
  }
  if (positionals.length < spec.positionals - (spec.optional || 0)) invalid();
  return { positionals, options };
}

const NO_OPTIONS = new Map();
const plain = (n) => ({ positionals: n, options: NO_OPTIONS });

// ---- stored list -----------------------------------------------------------

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function hasOnly(obj, keys) {
  return Object.keys(obj).every((k) => keys.includes(k));
}

function parseJson(text) {
  try {
    return JSON.parse(text, (key, value, context) => {
      // A whole number above 2^53-1 counts only when its source text is its
      // own decimal digits; anything JSON.parse had to round is invalid.
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
    return invalid();
  }
}

// A stored or imported document: an optional "version" key (a whole number
// from 1 to 4; anything else, newer versions included, fails), then the list
// body. No key is version 1. Versions 1 and 2 tasks have five keys; version 3
// tasks also have "note" (null or a valid one-line text); version 4 tasks also
// have "important", which must be true or false. The result is always the
// version 4 shape (older tasks get note null, then important false). Rest syntax keeps a parsed
// "__proto__" key as an ordinary key.
function checkList(doc) {
  if (!isObject(doc)) invalid();
  let format = 1;
  if (Object.hasOwn(doc, 'version')) {
    const v = doc.version;
    if (!Number.isInteger(v) || v < 1 || v > 4) invalid();
    format = v;
  }
  const { version, ...data } = doc;
  if (!hasOnly(data, ['nextId', 'tasks']) || !Array.isArray(data.tasks)) invalid();
  const ids = new Set();
  let highest = 0;
  for (const t of data.tasks) {
    const keys = ['id', 'title', 'status', 'due', 'tags'];
    if (format >= 3) keys.push('note');
    if (format >= 4) keys.push('important');
    if (!isObject(t) || !hasOnly(t, keys)) invalid();
    if (!Number.isSafeInteger(t.id) || t.id < 1 || ids.has(t.id)) invalid();
    ids.add(t.id);
    highest = Math.max(highest, t.id);
    if (typeof t.title !== 'string' || t.title === '') invalid();
    if (t.title.startsWith(' ') || t.title.endsWith(' ')) invalid();
    for (const ch of t.title) {
      if (isBadTitleChar(ch.codePointAt(0))) invalid();
    }
    if (t.status !== 'open' && t.status !== 'done') invalid();
    if (t.due !== null && !isDate(t.due)) invalid();
    if (!Array.isArray(t.tags)) invalid();
    const seen = new Set();
    for (const tag of t.tags) {
      if (typeof tag !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,31}$/.test(tag) || seen.has(tag)) invalid();
      seen.add(tag);
    }
    if (format >= 3) {
      if (!Object.hasOwn(t, 'note')) invalid();
      if (t.note !== null) checkNote(t.note);
    }
    if (format >= 4 && typeof t.important !== 'boolean') invalid();
  }
  if (format < 3) data.tasks = data.tasks.map((t) => ({ ...t, note: null }));
  if (format < 4) data.tasks = data.tasks.map((t) => ({ ...t, important: false }));
  if (!Number.isInteger(data.nextId) || data.nextId < 1 || data.nextId > MAX_NEXT_ID) invalid();
  if (data.nextId <= highest) invalid();
  return data;
}

// A stored note follows the title rules.
function checkNote(n) {
  if (typeof n !== 'string' || n === '') invalid();
  if (n.startsWith(' ') || n.endsWith(' ')) invalid();
  for (const ch of n) {
    if (isBadTitleChar(ch.codePointAt(0))) invalid();
  }
}

function listFromBytes(bytes) {
  const text = decodeStrict(bytes);
  if (text === null) invalid();
  return checkList(parseJson(text));
}

// A missing file is an empty list; a folder fails.
function readStored(tree) {
  const kind = kindOf(tree, STORED);
  if (kind === 'missing') return { nextId: 1, tasks: [] };
  if (kind === 'dir') invalid();
  return listFromBytes(tree.get(STORED).bytes);
}

function canonical(list) {
  const tasks = list.tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, due: t.due, tags: t.tags, note: t.note, important: t.important }));
  return JSON.stringify({ version: 4, nextId: list.nextId, tasks }, null, 2) + '\n';
}

// Any write replaces tasks.json whole with the canonical text.
function writeStored(tree, list) {
  if (kindOf(tree, STORED) === 'dir') invalid();
  putFile(tree, STORED, canonical(list));
}

// ---- commands --------------------------------------------------------------

function taskLine(t, today) {
  const parts = ['#' + t.id, t.status === 'done' ? '[x]' : '[ ]', t.title];
  if (t.due !== null) parts.push('due:' + t.due);
  if (t.status === 'open' && t.due !== null && t.due < today) parts.push('!overdue');
  if (t.important) parts.push('!important');
  for (const tag of [...t.tags].sort()) parts.push('+' + tag);
  return parts.join(' ');
}

function isLate(t, today) {
  return t.status === 'open' && t.due !== null && t.due < today;
}

const ADD = new Map([['--due', { value: true }], ['--tag', { value: true, repeat: true }], ['--note', { value: true }], ['--important', {}]]);
const NOTE = new Map([['--clear', {}]]);
const LIST = new Map([
  ['--open', {}],
  ['--done', {}],
  ['--all', {}],
  ['--overdue', {}],
  ['--tag', { value: true }],
  ['--due-from', { value: true }],
  ['--due-to', { value: true }],
  ['--search', { value: true }],
]);
const VIEWS = ['--open', '--done', '--all', '--overdue'];
const EXPORT = new Map([...LIST, ['--format', { value: true }]]);

// The filter checks shared by list and export, in order: more than one status
// option, tag, dates, date order, empty search. Returns the task predicate.
// `defaultView` is the status view when no status option is given.
function filterOf(options, defaultView, today) {
  const given = VIEWS.filter((v) => options.has(v));
  if (given.length > 1) invalid();
  const view = given.length === 1 ? given[0] : defaultView;
  const tag = options.has('--tag') ? typedTag(options.get('--tag')) : null;
  const from = options.has('--due-from') ? options.get('--due-from') : null;
  const to = options.has('--due-to') ? options.get('--due-to') : null;
  if (from !== null && !isDate(from)) invalid();
  if (to !== null && !isDate(to)) invalid();
  if (from !== null && to !== null && from > to) invalid();
  const search = options.has('--search') ? options.get('--search') : null;
  if (search === '') invalid();
  return (t) => {
    if (view === '--overdue') {
      if (!isLate(t, today)) return false;
    } else if (view !== '--all' && t.status !== (view === '--done' ? 'done' : 'open')) {
      return false;
    }
    if (tag !== null && !t.tags.includes(tag)) return false;
    if (from !== null || to !== null) {
      if (t.due === null) return false;
      if (from !== null && t.due < from) return false;
      if (to !== null && t.due > to) return false;
    }
    if (search === null) return true;
    const needle = search.toLowerCase();
    return t.title.toLowerCase().includes(needle) || (t.note !== null && t.note.toLowerCase().includes(needle));
  };
}

// CSV for the export: header id,title,status,due,tags,note; rows in id order; every
// line ends CRLF; a field is quoted only when it holds , " CR or LF.
function csvField(value) {
  const text = String(value);
  return /[,"\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function csvText(tasks) {
  const rows = [...tasks]
    .sort((a, b) => a.id - b.id)
    .map((t) => [t.id, t.title, t.status, t.due === null ? '' : t.due, [...t.tags].sort().join(' '), t.note === null ? '' : t.note].map(csvField).join(',') + '\r\n');
  return 'id,title,status,due,tags,note\r\n' + rows.join('');
}

const COMMANDS = {
  help(args, ctx) {
    grammar(args, plain(0));
    ctx.out = 'Usage:\n' + USAGE.map((u) => '  ' + u + '\n').join('');
  },

  add(args, ctx) {
    const { positionals, options } = grammar(args, { positionals: 1, options: ADD });
    const title = typedTitle(positionals[0]);
    let due = null;
    if (options.has('--due')) {
      due = options.get('--due');
      if (!isDate(due)) invalid();
    }
    const tags = [...new Set((options.get('--tag') || []).map(typedTag))];
    const note = options.has('--note') ? typedTitle(options.get('--note')) : null;
    const important = options.has('--important');
    const list = readStored(ctx.tree);
    if (list.nextId > MAX_SAFE) invalid();
    const id = list.nextId;
    list.tasks.push({ id, title, status: 'open', due, tags, note, important });
    list.nextId = id + 1;
    writeStored(ctx.tree, list);
    ctx.out = 'Added task ' + id + '\n';
  },

  list(args, ctx) {
    const { options } = grammar(args, { positionals: 0, options: LIST });
    const keep = filterOf(options, '--open', ctx.today);
    const list = readStored(ctx.tree);
    const shown = list.tasks.filter(keep).sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0) || a.id - b.id);
    ctx.out = shown.length === 0 ? 'No tasks.\n' : shown.map((t) => taskLine(t, ctx.today) + '\n').join('');
  },

  done: (args, ctx) => setStatus(args, ctx, 'done', 'Completed', 'done'),
  reopen: (args, ctx) => setStatus(args, ctx, 'open', 'Reopened', 'open'),
  important: (args, ctx) =>
    setImportant(args, ctx, true, (id) => 'Marked task ' + id + ' as important', (id) => 'Task ' + id + ' is already important'),
  unimportant: (args, ctx) =>
    setImportant(args, ctx, false, (id) => 'Removed important mark from task ' + id, (id) => 'Task ' + id + ' is not important'),

  rename(args, ctx) {
    const { positionals } = grammar(args, plain(2));
    const id = parseId(positionals[0]);
    const title = typedTitle(positionals[1]);
    const list = readStored(ctx.tree);
    const task = list.tasks.find((t) => t.id === id);
    if (task === undefined) invalid();
    task.title = title;
    writeStored(ctx.tree, list);
    ctx.out = 'Renamed task ' + id + '\n';
  },

  delete(args, ctx) {
    const { positionals } = grammar(args, plain(1));
    const id = parseId(positionals[0]);
    const list = readStored(ctx.tree);
    if (!list.tasks.some((t) => t.id === id)) invalid();
    list.tasks = list.tasks.filter((t) => t.id !== id); // nextId stays
    writeStored(ctx.tree, list);
    ctx.out = 'Deleted task ' + id + '\n';
  },

  tag(args, ctx) {
    const { positionals } = grammar(args, plain(2));
    const id = parseId(positionals[0]);
    const signed = positionals[1];
    if ((signed[0] !== '+' && signed[0] !== '-') || signed.length < 2) invalid();
    const tag = typedTag(signed.slice(1));
    const list = readStored(ctx.tree);
    const task = list.tasks.find((t) => t.id === id);
    if (task === undefined) invalid();
    const has = task.tags.includes(tag);
    if (signed[0] === '+') {
      if (has) {
        ctx.out = 'Task ' + id + ' already has tag ' + tag + '\n';
        return;
      }
      task.tags.push(tag);
      writeStored(ctx.tree, list);
      ctx.out = 'Added tag ' + tag + ' to task ' + id + '\n';
    } else {
      if (!has) {
        ctx.out = 'Task ' + id + ' has no tag ' + tag + '\n';
        return;
      }
      task.tags = task.tags.filter((t) => t !== tag);
      writeStored(ctx.tree, list);
      ctx.out = 'Removed tag ' + tag + ' from task ' + id + '\n';
    }
  },

  note(args, ctx) {
    const { positionals, options } = grammar(args, { positionals: 2, optional: 1, options: NOTE });
    const id = parseId(positionals[0]);
    const clear = options.has('--clear');
    if (clear && positionals.length === 2) invalid();
    const text = positionals.length === 2 ? typedTitle(positionals[1]) : null;
    const list = readStored(ctx.tree);
    const task = list.tasks.find((t) => t.id === id);
    if (task === undefined) invalid();
    if (!clear && text === null) {
      ctx.out = task.note === null ? 'Task ' + id + ' has no note\n' : task.note + '\n';
      return;
    }
    if (!clear) {
      task.note = text;
      writeStored(ctx.tree, list);
      ctx.out = 'Set note on task ' + id + '\n';
      return;
    }
    if (task.note === null) {
      ctx.out = 'Task ' + id + ' has no note\n';
      return;
    }
    task.note = null;
    writeStored(ctx.tree, list);
    ctx.out = 'Cleared note on task ' + id + '\n';
  },

  export(args, ctx) {
    const { positionals, options } = grammar(args, { positionals: 1, optional: 1, options: EXPORT });
    const format = options.has('--format') ? options.get('--format') : 'json';
    if (format !== 'json' && format !== 'csv') invalid();
    const keep = filterOf(options, '--all', ctx.today);
    const list = readStored(ctx.tree);
    const matching = list.tasks.filter(keep);
    const text = format === 'csv' ? csvText(matching) : canonical({ nextId: list.nextId, tasks: matching });
    if (positionals.length === 0) {
      ctx.out = text;
      return;
    }
    const file = positionals[0];
    if (file === '') invalid();
    if (kindOf(ctx.tree, path.posix.dirname(file)) !== 'dir') invalid();
    if (kindOf(ctx.tree, file) === 'dir') invalid();
    putFile(ctx.tree, file, text);
    ctx.out = 'Exported ' + matching.length + ' tasks to ' + file + '\n';
  },

  import(args, ctx) {
    const { positionals } = grammar(args, plain(1));
    const file = positionals[0];
    if (kindOf(ctx.tree, file) !== 'file') invalid(); // never reads tasks.json
    const list = listFromBytes(ctx.tree.get(file).bytes);
    writeStored(ctx.tree, list);
    ctx.out = 'Imported ' + list.tasks.length + ' tasks from ' + file + '\n';
  },

  stats(args, ctx) {
    grammar(args, plain(0));
    const list = readStored(ctx.tree);
    const open = list.tasks.filter((t) => t.status === 'open').length;
    const late = list.tasks.filter((t) => isLate(t, ctx.today)).length;
    ctx.out = 'open: ' + open + '\ndone: ' + (list.tasks.length - open) + '\noverdue: ' + late + '\n';
  },
};

function setStatus(args, ctx, to, changed, already) {
  const { positionals } = grammar(args, plain(1));
  const id = parseId(positionals[0]);
  const list = readStored(ctx.tree);
  const task = list.tasks.find((t) => t.id === id);
  if (task === undefined) invalid();
  if (task.status === to) {
    ctx.out = 'Task ' + id + ' is already ' + already + '\n';
    return;
  }
  task.status = to;
  writeStored(ctx.tree, list);
  ctx.out = changed + ' task ' + id + '\n';
}

function setImportant(args, ctx, to, changed, already) {
  const { positionals } = grammar(args, plain(1));
  const id = parseId(positionals[0]);
  const list = readStored(ctx.tree);
  const task = list.tasks.find((t) => t.id === id);
  if (task === undefined) invalid();
  if (task.important === to) {
    ctx.out = already(id) + '\n';
    return;
  }
  task.important = to;
  writeStored(ctx.tree, list);
  ctx.out = changed(id) + '\n';
}

// Empty argv or a first argument of --help is "help" with the rest as its
// arguments. Any other first argument must be one of the command names.
function expect({ argv, files, today }) {
  const tree = fullTree(files);
  const ctx = { tree, today, out: '' };
  try {
    let name = argv[0];
    let args = argv.slice(1);
    if (argv.length === 0 || argv[0] === '--help') name = 'help';
    if (!Object.hasOwn(COMMANDS, name)) invalid();
    COMMANDS[name](args, ctx);
  } catch (err) {
    if (err instanceof Invalid) return { ok: false };
    throw err;
  }
  return { ok: true, stdout: ctx.out, files: tree };
}

module.exports = { expect, fullTree };
