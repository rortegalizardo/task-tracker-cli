'use strict';

const { parseArgs } = require('../args');
const { readList, writeList } = require('../storage');
const { withLock } = require('../lock');

// PD-0012: removes every done task in one atomic write; open tasks keep their
// stored order and every field, and nextId is never lowered. Checks run in this
// order: arguments, then under the lock read and remove. When nothing is
// removed it returns before writeList, so the file stays byte-identical (a
// v1-v3 file is not upgraded and a missing file stays missing).
module.exports = {
  name: 'clean',
  usage: 'ttc clean',
  run(args, ctx) {
    parseArgs(args, { positionals: [], options: {} });

    const message = withLock(() => {
      const list = readList();
      const kept = list.tasks.filter((t) => t.status === 'open');
      const removed = list.tasks.length - kept.length;
      if (removed > 0) {
        list.tasks = kept;
        writeList(list);
      }
      return 'Removed ' + removed + ' done tasks\n';
    });
    ctx.stdout.write(message);
  },
};
