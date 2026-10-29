'use strict';

const { parseArgs } = require('../args');
const { FILTER_OPTIONS, parseFilter, taskFilter } = require('../filter');
const { isOverdue, localToday } = require('../overdue');
const { readList } = require('../storage');

// One task line (PD-0003 item 8, PD-0002 item 6, PD-0009 item 5):
// #<id> [ ]|[x] <title> [due:<date>] [!overdue] [!important] [+<tag>]...
// Tags are sorted on a copy, in code-unit order (stored tags are [a-z0-9_-]).
function formatTask(task, today) {
  const parts = ['#' + task.id, task.status === 'done' ? '[x]' : '[ ]', task.title];
  if (task.due !== null) parts.push('due:' + task.due);
  if (isOverdue(task, today)) parts.push('!overdue');
  if (task.important) parts.push('!important');
  for (const tag of [...task.tags].sort()) parts.push('+' + tag);
  return parts.join(' ');
}

module.exports = {
  name: 'list',
  usage:
    'ttc list [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]',
  run(args, ctx) {
    const parsed = parseArgs(args, { positionals: [], options: FILTER_OPTIONS });
    const filter = parseFilter(parsed.options);

    // Every check is done before the read. List never writes.
    const list = readList();
    const today = localToday();
    const shown = [...list.tasks].filter(taskFilter(filter, today)).sort((a, b) => b.important - a.important || a.id - b.id);

    ctx.stdout.write(
      shown.length === 0 ? 'No tasks.\n' : shown.map((t) => formatTask(t, today) + '\n').join(''),
    );
  },
};
