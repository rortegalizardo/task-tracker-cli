'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { inputTag } = require('../rules');
const { readList, writeList } = require('../storage');
const { withLock } = require('../lock');

module.exports = {
  name: 'tag',
  usage: 'ttc tag <id> +<t> | -<t>',
  run(args, ctx) {
    const { positionals } = parseArgs(args, {
      positionals: ['<id>', '+<t>|-<t>'],
      options: {},
    });
    const id = parseId(positionals[0]);

    const signed = positionals[1];
    const sign = signed[0];
    if ((sign !== '+' && sign !== '-') || signed.length === 1) {
      throw new TtcError('tag must be +<t> or -<t>: ' + signed);
    }
    const tag = inputTag(signed.slice(1));

    // Every check is done before the lock. Nothing is written until the task is found.
    const message = withLock(() => {
      const list = readList();
      const task = list.tasks.find((t) => t.id === id);
      if (task === undefined) throw new TtcError('no task with id ' + id);

      if (sign === '+') {
        if (task.tags.includes(tag)) return 'Task ' + id + ' already has tag ' + tag + '\n';
        task.tags.push(tag);
        writeList(list);
        return 'Added tag ' + tag + ' to task ' + id + '\n';
      }
      if (!task.tags.includes(tag)) return 'Task ' + id + ' has no tag ' + tag + '\n';
      task.tags = task.tags.filter((t) => t !== tag);
      writeList(list);
      return 'Removed tag ' + tag + ' from task ' + id + '\n';
    });
    ctx.stdout.write(message);
  },
};
