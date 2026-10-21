'use strict';

const { TtcError } = require('./errors');

const MAX_ID = Number.MAX_SAFE_INTEGER; // 9007199254740991

// spec = { positionals: ['<id>', ...], options: { '--due': { value: true }, '--tag': { value: true, repeat: true }, '--all': { value: false } } }
// Returns { positionals: string[], options: { name: string | string[] | true } }.
// An argument that starts with "--" is an option; every other argument is a
// positional, including "-x" and "-1".
function parseArgs(args, spec) {
  const positionals = [];
  const options = {};
  const names = spec.positionals;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      if (positionals.length >= names.length) {
        throw new TtcError('unexpected argument: ' + arg);
      }
      positionals.push(arg);
      continue;
    }
    if (!Object.hasOwn(spec.options, arg)) {
      throw new TtcError('unknown option: ' + arg);
    }
    const def = spec.options[arg];
    if (!def.repeat && Object.hasOwn(options, arg)) {
      throw new TtcError('option given twice: ' + arg);
    }
    if (!def.value) {
      options[arg] = true;
      continue;
    }
    const next = args[i + 1];
    if (next === undefined || next.startsWith('--')) {
      throw new TtcError('option needs a value: ' + arg);
    }
    i++;
    if (def.repeat) {
      if (!Object.hasOwn(options, arg)) options[arg] = [];
      options[arg].push(next);
    } else {
      options[arg] = next;
    }
  }

  if (positionals.length < names.length) {
    throw new TtcError('missing argument: ' + names[positionals.length]);
  }
  return { positionals, options };
}

// A task id: digits only, leading zeros allowed, from 1 to MAX_ID.
function parseId(arg) {
  if (/^[0-9]+$/.test(arg)) {
    const n = BigInt(arg);
    if (n >= 1n && n <= BigInt(MAX_ID)) return Number(n);
  }
  throw new TtcError('invalid task id: ' + arg);
}

module.exports = { MAX_ID, parseArgs, parseId };
