'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { inputTitle } = require('../rules');
const { readList, writeList } = require('../storage');

module.exports = {
  name: 'rename',
  usage: 'ttc rename <id> "<title>"',
  run(args, ctx) {
    const parsed = parseArgs(args, { positionals: ['<id>', '<title>'], options: {} });
    const id = parseId(parsed.positionals[0]);
    const title = inputTitle(parsed.positionals[1]);

    // Every check is done before the first read or write.
    const list = readList();
    const task = list.tasks.find((t) => t.id === id);
    if (task === undefined) throw new TtcError('no task with id ' + id);
    task.title = title;
    writeList(list);

    ctx.stdout.write('Renamed task ' + id + '\n');
  },
};
