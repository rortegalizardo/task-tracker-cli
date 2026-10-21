'use strict';

const { parseArgs, MAX_ID } = require('../args');
const { TtcError } = require('../errors');
const { inputTitle, inputTag, isValidDate } = require('../rules');
const { readList, writeList } = require('../storage');

module.exports = {
  name: 'add',
  usage: 'ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]...',
  run(args, ctx) {
    const parsed = parseArgs(args, {
      positionals: ['<title>'],
      options: { '--due': { value: true }, '--tag': { value: true, repeat: true } },
    });
    const title = inputTitle(parsed.positionals[0]);

    let due = null;
    if (Object.hasOwn(parsed.options, '--due')) {
      due = parsed.options['--due'];
      if (!isValidDate(due)) throw new TtcError('invalid date: ' + due);
    }

    const typed = parsed.options['--tag'] || [];
    const tags = [...new Set(typed.map(inputTag))];

    // Every check is done before the first read or write.
    const list = readList();
    if (list.nextId > MAX_ID) throw new TtcError('no task id is left');
    const id = list.nextId;
    list.tasks.push({ id, title, status: 'open', due, tags });
    list.nextId = id + 1;
    writeList(list);

    ctx.stdout.write('Added task ' + id + '\n');
  },
};
