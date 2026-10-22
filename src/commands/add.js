'use strict';

const { parseArgs, MAX_ID } = require('../args');
const { TtcError } = require('../errors');
const { inputTitle, inputTag, inputNote, isValidDate } = require('../rules');
const { readList, writeList } = require('../storage');
const { withLock } = require('../lock');

module.exports = {
  name: 'add',
  usage: 'ttc add "<title>" [--due YYYY-MM-DD] [--tag <t>]... [--note "<text>"]',
  run(args, ctx) {
    const parsed = parseArgs(args, {
      positionals: ['<title>'],
      options: {
        '--due': { value: true },
        '--tag': { value: true, repeat: true },
        '--note': { value: true },
      },
    });
    const title = inputTitle(parsed.positionals[0]);

    let due = null;
    if (Object.hasOwn(parsed.options, '--due')) {
      due = parsed.options['--due'];
      if (!isValidDate(due)) throw new TtcError('invalid date: ' + due);
    }

    const typed = parsed.options['--tag'] || [];
    const tags = [...new Set(typed.map(inputTag))];

    const note = Object.hasOwn(parsed.options, '--note') ? inputNote(parsed.options['--note']) : null;

    // Every check is done before the lock, the read and the write.
    const id = withLock(() => {
      const list = readList();
      if (list.nextId > MAX_ID) throw new TtcError('no task id is left');
      const newId = list.nextId;
      list.tasks.push({ id: newId, title, status: 'open', due, tags, note });
      list.nextId = newId + 1;
      writeList(list);
      return newId;
    });

    ctx.stdout.write('Added task ' + id + '\n');
  },
};
