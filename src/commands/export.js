'use strict';

const { parseArgs } = require('../args');
const { TtcError } = require('../errors');
const { readList, serializeList, replaceFile, reasonOf } = require('../storage');

module.exports = {
  name: 'export',
  usage: 'ttc export <file>',
  run(args, ctx) {
    const parsed = parseArgs(args, { positionals: ['<file>'], options: {} });
    const file = parsed.positionals[0];

    // Never creates TTC_HOME or tasks.json.
    const list = readList();
    try {
      // No mode: the export gets default permissions. The path is relative to
      // the working folder, not to TTC_HOME.
      replaceFile(file, serializeList(list));
    } catch (err) {
      throw new TtcError('cannot write ' + file + ': ' + reasonOf(err));
    }

    ctx.stdout.write('Exported ' + list.tasks.length + ' tasks to ' + file + '\n');
  },
};
