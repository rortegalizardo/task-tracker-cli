'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { readList, writeList } = require('../storage');

// One builder for both commands, so they cannot drift (PD-0003 items 2, 9, 10, 13).
// Checks run in this order: arguments, id, read, task lookup.
function statusCommand({ name, to, changedMessage, alreadyMessage }) {
  return {
    name,
    usage: 'ttc ' + name + ' <id>',
    run(args, ctx) {
      const parsed = parseArgs(args, { positionals: ['<id>'], options: {} });
      const id = parseId(parsed.positionals[0]);

      const list = readList();
      const task = list.tasks.find((t) => t.id === id);
      if (task === undefined) throw new TtcError('no task with id ' + id);

      if (task.status === to) {
        // A no-op never writes: the file stays byte-identical.
        ctx.stdout.write('Task ' + id + ' is already ' + alreadyMessage + '\n');
        return;
      }
      task.status = to;
      writeList(list);
      ctx.stdout.write(changedMessage + ' task ' + id + '\n');
    },
  };
}

module.exports = {
  done: statusCommand({ name: 'done', to: 'done', changedMessage: 'Completed', alreadyMessage: 'done' }),
  reopen: statusCommand({ name: 'reopen', to: 'open', changedMessage: 'Reopened', alreadyMessage: 'open' }),
};
