'use strict';

const { parseArgs } = require('../args');
const { TtcError } = require('../errors');
const { isOverdue, localToday } = require('../overdue');
const { inputTag } = require('../rules');
const { readList } = require('../storage');

const STATUS_OPTIONS = ['--open', '--done', '--all', '--overdue'];

// One task line (PD-0003 item 8, PD-0002 item 6):
// #<id> [ ]|[x] <title> [due:<date>] [!overdue] [+<tag>]...
// Tags are sorted on a copy, in code-unit order (stored tags are [a-z0-9_-]).
function formatTask(task, today) {
  const parts = ['#' + task.id, task.status === 'done' ? '[x]' : '[ ]', task.title];
  if (task.due !== null) parts.push('due:' + task.due);
  if (isOverdue(task, today)) parts.push('!overdue');
  for (const tag of [...task.tags].sort()) parts.push('+' + tag);
  return parts.join(' ');
}

module.exports = {
  name: 'list',
  usage: 'ttc list [--open|--done|--all|--overdue] [--tag <t>]',
  run(args, ctx) {
    const parsed = parseArgs(args, {
      positionals: [],
      options: {
        '--open': { value: false },
        '--done': { value: false },
        '--all': { value: false },
        '--overdue': { value: false },
        '--tag': { value: true },
      },
    });

    const given = STATUS_OPTIONS.filter((o) => Object.hasOwn(parsed.options, o));
    if (given.length > 1) {
      throw new TtcError('options cannot be combined: ' + given.join(' '));
    }
    const view = given.length === 1 ? given[0] : '--open';

    let tag = null;
    if (Object.hasOwn(parsed.options, '--tag')) tag = inputTag(parsed.options['--tag']);

    // Every check is done before the read. List never writes.
    const list = readList();
    const today = localToday();
    const inView = (t) => {
      if (view === '--all') return true;
      if (view === '--overdue') return isOverdue(t, today);
      return t.status === (view === '--done' ? 'done' : 'open');
    };
    const shown = [...list.tasks]
      .filter(inView)
      .filter((t) => tag === null || t.tags.includes(tag))
      .sort((a, b) => a.id - b.id);

    ctx.stdout.write(
      shown.length === 0 ? 'No tasks.\n' : shown.map((t) => formatTask(t, today) + '\n').join(''),
    );
  },
};
