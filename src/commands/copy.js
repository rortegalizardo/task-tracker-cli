'use strict';

const { parseArgs, parseId, MAX_ID } = require('../args');
const { TtcError } = require('../errors');
const { isValidDate } = require('../rules');
const { readList, writeList } = require('../storage');
const { withLock } = require('../lock');

module.exports = {
  name: 'copy',
  usage: 'ttc copy <id> [--due YYYY-MM-DD]',
  run(args, ctx) {
    const parsed = parseArgs(args, {
      positionals: ['<id>'],
      options: { '--due': { value: true } },
    });
    const id = parseId(parsed.positionals[0]);
    const hasDue = Object.hasOwn(parsed.options, '--due');
    const due = parsed.options['--due'];
    if (hasDue && !isValidDate(due)) throw new TtcError('invalid date: ' + due);

    const newId = withLock(() => {
      const list = readList();
      const source = list.tasks.find((task) => task.id === id);
      if (source === undefined) throw new TtcError('no task with id ' + id);
      if (list.nextId > MAX_ID) throw new TtcError('no task id is left');
      const allocatedId = list.nextId;
      list.tasks.push({
        id: allocatedId,
        title: source.title,
        status: 'open',
        due: hasDue ? due : source.due,
        tags: [...source.tags],
        note: source.note,
        important: source.important,
      });
      list.nextId = allocatedId + 1;
      writeList(list);
      return allocatedId;
    });

    ctx.stdout.write('Copied task ' + id + ' as task ' + newId + '\n');
  },
};
