'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { inputNote } = require('../rules');
const { readList, writeList } = require('../storage');
const { withLock } = require('../lock');

function find(list, id) {
  const task = list.tasks.find((t) => t.id === id);
  if (task === undefined) throw new TtcError('no task with id ' + id);
  return task;
}

module.exports = {
  name: 'note',
  usage: 'ttc note <id> ["<text>" | --clear]',
  run(args, ctx) {
    const { positionals, options } = parseArgs(args, {
      positionals: ['<id>', '[<text>]'],
      options: { '--clear': { value: false } },
    });
    const id = parseId(positionals[0]);
    const clear = Object.hasOwn(options, '--clear');
    const typed = positionals[1];
    if (clear && typed !== undefined) throw new TtcError('note text and --clear cannot be combined');
    const text = typed === undefined ? undefined : inputNote(typed);

    // Every check is done before the read and the lock.
    if (!clear && text === undefined) {
      // Show: never writes, takes no lock.
      const task = find(readList(), id);
      ctx.stdout.write(task.note === null ? 'Task ' + id + ' has no note\n' : task.note + '\n');
      return;
    }

    const message = withLock(() => {
      const list = readList();
      const task = find(list, id);
      if (!clear) {
        task.note = text;
        writeList(list);
        return 'Set note on task ' + id + '\n';
      }
      if (task.note === null) return 'Task ' + id + ' has no note\n';
      task.note = null;
      writeList(list);
      return 'Cleared note on task ' + id + '\n';
    });
    ctx.stdout.write(message);
  },
};
