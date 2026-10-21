'use strict';

const { parseArgs } = require('../args');
const { isOverdue, localToday } = require('../overdue');
const { readList } = require('../storage');

// Counts of open, done and overdue tasks (PD-0003 items 2, 6, 11, 12, 13, 15).
// Overdue tasks are also counted as open. Stats never writes.
module.exports = {
  name: 'stats',
  usage: 'ttc stats',
  run(args, ctx) {
    parseArgs(args, { positionals: [], options: {} });

    const list = readList();
    const today = localToday();
    let open = 0;
    let done = 0;
    let overdue = 0;
    for (const t of list.tasks) {
      if (t.status === 'open') open++;
      else done++;
      if (isOverdue(t, today)) overdue++;
    }

    ctx.stdout.write(`open: ${open}\ndone: ${done}\noverdue: ${overdue}\n`);
  },
};
