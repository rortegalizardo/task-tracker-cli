'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { readList, writeList } = require('../storage');
const { withLock } = require('../lock');

// One builder for both commands, so they cannot drift (PD-0009 item 3).
// Checks run in this order: arguments, id, read, task lookup. Works on open and
// done tasks.
function importantCommand({ name, to, changedMessage, noopMessage }) {
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

        if (task.important === to) {
          // A no-op never writes: the file stays byte-identical.
          return noopMessage(id) + '\n';
        }
        task.important = to;
        writeList(list);
        return changedMessage(id) + '\n';
      });
      ctx.stdout.write(message);
    },
  };
}

module.exports = {
  important: importantCommand({
    name: 'important',
    to: true,
    changedMessage: (id) => 'Marked task ' + id + ' as important',
    noopMessage: (id) => 'Task ' + id + ' is already important',
  }),
  unimportant: importantCommand({
    name: 'unimportant',
    to: false,
    changedMessage: (id) => 'Removed important mark from task ' + id,
    noopMessage: (id) => 'Task ' + id + ' is not important',
  }),
};
