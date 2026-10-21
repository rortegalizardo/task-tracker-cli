'use strict';

// The test-owned reference model (the oracle) for ttc. It is written from the
// documented rules (src/args.js and src/storage.js headers, PD-0002, PD-0003,
// C7) and never requires anything under src/.
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
  'ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...',
  'ttc list [--open|--done|--all|--overdue] [--tag <t>]',
  'ttc done <id>',
  'ttc reopen <id>',
  'ttc rename <id> "<title>"',
  'ttc delete <id>',
  'ttc tag <id> +<t> | -<t>',
  'ttc export <file>',
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

// spec = { positionals: n, options: Map(name -> { value, repeat }) }
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
  if (positionals.length < spec.positionals) invalid();
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

function checkList(data) {
  if (!isObject(data) || !hasOnly(data, ['nextId', 'tasks']) || !Array.isArray(data.tasks)) invalid();
  const ids = new Set();
  let highest = 0;
  for (const t of data.tasks) {
    if (!isObject(t) || !hasOnly(t, ['id', 'title', 'status', 'due', 'tags'])) invalid();
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
  }
  if (!Number.isInteger(data.nextId) || data.nextId < 1 || data.nextId > MAX_NEXT_ID) invalid();
  if (data.nextId <= highest) invalid();
  return data;
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
  const tasks = list.tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, due: t.due, tags: t.tags }));
  return JSON.stringify({ nextId: list.nextId, tasks }, null, 2) + '\n';
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
  for (const tag of [...t.tags].sort()) parts.push('+' + tag);
  return parts.join(' ');
}

function isLate(t, today) {
  return t.status === 'open' && t.due !== null && t.due < today;
}

const ADD = new Map([['--due', { value: true }], ['--tag', { value: true, repeat: true }]]);
const LIST = new Map([
  ['--open', {}],
  ['--done', {}],
  ['--all', {}],
  ['--overdue', {}],
  ['--tag', { value: true }],
]);
const VIEWS = ['--open', '--done', '--all', '--overdue'];

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
    const list = readStored(ctx.tree);
    if (list.nextId > MAX_SAFE) invalid();
    const id = list.nextId;
    list.tasks.push({ id, title, status: 'open', due, tags });
    list.nextId = id + 1;
    writeStored(ctx.tree, list);
    ctx.out = 'Added task ' + id + '\n';
  },

  list(args, ctx) {
    const { options } = grammar(args, { positionals: 0, options: LIST });
    const given = VIEWS.filter((v) => options.has(v));
    if (given.length > 1) invalid();
    const view = given.length === 1 ? given[0] : '--open';
    const tag = options.has('--tag') ? typedTag(options.get('--tag')) : null;
    const list = readStored(ctx.tree);
    const shown = list.tasks
      .filter((t) => {
        if (view === '--all') return true;
        if (view === '--overdue') return isLate(t, ctx.today);
        return t.status === (view === '--done' ? 'done' : 'open');
      })
      .filter((t) => tag === null || t.tags.includes(tag))
      .sort((a, b) => a.id - b.id);
    ctx.out = shown.length === 0 ? 'No tasks.\n' : shown.map((t) => taskLine(t, ctx.today) + '\n').join('');
  },

  done: (args, ctx) => setStatus(args, ctx, 'done', 'Completed', 'done'),
  reopen: (args, ctx) => setStatus(args, ctx, 'open', 'Reopened', 'open'),

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

  export(args, ctx) {
    const { positionals } = grammar(args, plain(1));
    const file = positionals[0];
    const list = readStored(ctx.tree);
    if (file === '') invalid();
    if (kindOf(ctx.tree, path.posix.dirname(file)) !== 'dir') invalid();
    if (kindOf(ctx.tree, file) === 'dir') invalid();
    putFile(ctx.tree, file, canonical(list));
    ctx.out = 'Exported ' + list.tasks.length + ' tasks to ' + file + '\n';
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
