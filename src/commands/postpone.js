'use strict';

const { parseArgs, parseId } = require('../args');
const { TtcError } = require('../errors');
const { nextDay } = require('../rules');
const { localToday } = require('../overdue');
const { readList, writeList } = require('../storage');
const { withLock } = require('../lock');

// PD-0011: the new due date is one day after the later of the task's due date
// and today (the local date). Checks run in this order: arguments, id, read,
// task lookup, no due date, date limit. Works on open and done tasks. Every
// refusal throws before writeList, so the file stays byte-identical.
module.exports = {
  name: 'postpone',
  usage: 'ttc postpone <id>',
  run(args, ctx) {
    const parsed = parseArgs(args, { positionals: ['<id>'], options: {} });
    const id = parseId(parsed.positionals[0]);

    const message = withLock(() => {
      const list = readList();
      const task = list.tasks.find((t) => t.id === id);
      if (task === undefined) throw new TtcError('no task with id ' + id);
      if (task.due === null) throw new TtcError('task ' + id + ' has no due date');
      if (task.due === '9999-12-31') {
        throw new TtcError('task ' + id + ' cannot be postponed past 9999-12-31');
      }
      const today = localToday();
      const later = task.due < today ? today : task.due;
      task.due = nextDay(later);
      writeList(list);
      return 'Postponed task ' + id + ' to ' + task.due + '\n';
    });
    ctx.stdout.write(message);
  },
};
