'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { inputTag } = require('../rules');
const { readList, writeList } = require('../storage');

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

    // Every check is done before the read. Nothing is written until the task is found.
    const list = readList();
    const task = list.tasks.find((t) => t.id === id);
    if (task === undefined) throw new TtcError('no task with id ' + id);

    if (sign === '+') {
      if (task.tags.includes(tag)) {
        ctx.stdout.write('Task ' + id + ' already has tag ' + tag + '\n');
        return;
      }
      task.tags.push(tag);
      writeList(list);
      ctx.stdout.write('Added tag ' + tag + ' to task ' + id + '\n');
    } else {
      if (!task.tags.includes(tag)) {
        ctx.stdout.write('Task ' + id + ' has no tag ' + tag + '\n');
        return;
      }
      task.tags = task.tags.filter((t) => t !== tag);
      writeList(list);
      ctx.stdout.write('Removed tag ' + tag + ' from task ' + id + '\n');
    }
  },
};
