'use strict';

const fs = require('node:fs');
const { parseArgs } = require('../args');
const { TtcError } = require('../errors');
const { parseList, writeList, reasonOf } = require('../storage');

module.exports = {
  name: 'import',
  usage: 'ttc import <file>',
  run(args, ctx) {
    const parsed = parseArgs(args, { positionals: ['<file>'], options: {} });
    const file = parsed.positionals[0];

    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch (err) {
      throw new TtcError('cannot read ' + file + ': ' + reasonOf(err));
    }

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
