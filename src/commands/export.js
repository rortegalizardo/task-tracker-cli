'use strict';

const { parseArgs } = require('../args');
const { formatCsv } = require('../csv');
const { TtcError } = require('../errors');
const { FILTER_OPTIONS, parseFilter, taskFilter } = require('../filter');
const { localToday } = require('../overdue');
const { readList, serializeList, replaceFile, reasonOf } = require('../storage');

module.exports = {
  name: 'export',
  usage:
    'ttc export [<file>] [--format json|csv] [--open|--done|--all|--overdue] [--no-due] [--tag <t>] [--due-from YYYY-MM-DD] [--due-to YYYY-MM-DD] [--search <text>]',
  run(args, ctx) {
    const parsed = parseArgs(args, {
      positionals: ['[<file>]'],
      options: { ...FILTER_OPTIONS, '--format': { value: true } },
    });
    const file = parsed.positionals[0];

    const format = Object.hasOwn(parsed.options, '--format') ? parsed.options['--format'] : 'json';
    if (format !== 'json' && format !== 'csv') {
      throw new TtcError('invalid format: ' + format + ' (use json or csv)');
    }
    const filter = parseFilter(parsed.options, '--all');

    // Every check is done before the read. Never creates TTC_HOME or tasks.json.
    const list = readList();
    // Stored order; the CSV writer sorts by id itself.
    const matching = list.tasks.filter(taskFilter(filter, localToday()));
    const text =
      format === 'csv' ? formatCsv(matching) : serializeList({ nextId: list.nextId, tasks: matching });

    if (file === undefined) {
      ctx.stdout.write(text);
      return;
    }
    try {
      // No mode: the export gets default permissions. The path is relative to
      // the working folder, not to TTC_HOME.
      replaceFile(file, text);
    } catch (err) {
      throw new TtcError('cannot write ' + file + ': ' + reasonOf(err));
    }
    ctx.stdout.write('Exported ' + matching.length + ' tasks to ' + file + '\n');
  },
};
