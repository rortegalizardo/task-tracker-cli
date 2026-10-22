'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { readList, writeList } = require('../storage');
const { withLock } = require('../lock');

// One builder for both commands, so they cannot drift (PD-0003 items 2, 9, 10, 13).
// Checks run in this order: arguments, id, read, task lookup.
function statusCommand({ name, to, changedMessage, alreadyMessage }) {
  return {
    name,
    usage: 'ttc ' + name + ' <id>',
    run(args, ctx) {
      const parsed = parseArgs(args, { positionals: ['<id>'], options: {} });
      const id = parseId(parsed.positionals[0]);

      const message = withLock(() => {
        const list = readList();
        const task = list.tasks.find((t) => t.id === id);
        if (task === undefined) throw new TtcError('no task with id ' + id);

        if (task.status === to) {
          // A no-op never writes: the file stays byte-identical.
          return 'Task ' + id + ' is already ' + alreadyMessage + '\n';
        }
        task.status = to;
        writeList(list);
        return changedMessage + ' task ' + id + '\n';
      });
      ctx.stdout.write(message);
    },
  };
}

module.exports = {
  done: statusCommand({ name: 'done', to: 'done', changedMessage: 'Completed', alreadyMessage: 'done' }),
  reopen: statusCommand({ name: 'reopen', to: 'open', changedMessage: 'Reopened', alreadyMessage: 'open' }),
};
