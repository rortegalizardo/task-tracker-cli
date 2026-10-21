'use strict';

const fs = require('node:fs');
const { parseArgs } = require('../args');
const { TtcError } = require('../errors');
const { decodeUtf8, parseList, writeList, reasonOf } = require('../storage');

module.exports = {
  name: 'import',
  usage: 'ttc import <file>',
  run(args, ctx) {
    const parsed = parseArgs(args, { positionals: ['<file>'], options: {} });
    const file = parsed.positionals[0];

    let bytes;
    try {
      bytes = fs.readFileSync(file);
    } catch (err) {
      throw new TtcError('cannot read ' + file + ': ' + reasonOf(err));
    }
    const text = decodeUtf8(bytes);
    if (text === null) throw new TtcError('invalid import file ' + file + ': not valid UTF-8');

    const result = parseList(text);
    if (result.problem !== undefined) {
      throw new TtcError('invalid import file ' + file + ': ' + result.problem);
    }

    // The stored list is replaced whole and never read, so a broken tasks.json
    // does not stop an import. Nothing is written before this point.
    writeList(result.list);

    ctx.stdout.write('Imported ' + result.list.tasks.length + ' tasks from ' + file + '\n');
  },
};
