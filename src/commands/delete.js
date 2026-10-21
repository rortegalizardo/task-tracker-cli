'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { readList, writeList } = require('../storage');

module.exports = {
  name: 'delete',
  usage: 'ttc delete <id>',
  run(args, ctx) {
    const parsed = parseArgs(args, { positionals: ['<id>'], options: {} });
    const id = parseId(parsed.positionals[0]);

    // nextId and the other tasks stay as they are: a deleted id is never reused.
    const list = readList();
    const index = list.tasks.findIndex((task) => task.id === id);
    if (index === -1) throw new TtcError('no task with id ' + id);
    list.tasks.splice(index, 1);
    writeList(list);

    ctx.stdout.write('Deleted task ' + id + '\n');
  },
};
