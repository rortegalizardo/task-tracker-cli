'use strict';

const { TtcError } = require('./errors');
const { isOverdue } = require('./overdue');
const { inputTag, isValidDate } = require('./rules');

const STATUS_OPTIONS = ['--open', '--done', '--all', '--overdue'];

// The parseArgs option specs for every filter option. None is repeatable.
const FILTER_OPTIONS = {
  '--open': { value: false },
  '--done': { value: false },
  '--all': { value: false },
  '--overdue': { value: false },
  '--no-due': { value: false },
  '--tag': { value: true },
  '--due-from': { value: true },
  '--due-to': { value: true },
  '--search': { value: true },
};

// Validates the options parseArgs returned and returns the filter:
// { view, noDue, tag, dueFrom, dueTo, search }; noDue is boolean and absent
// tag/date/search values are null. `defaultView` is the status view when no
// status option is given.
function parseFilter(options, defaultView = '--open') {
  const given = STATUS_OPTIONS.filter((o) => Object.hasOwn(options, o));
  if (given.length > 1) {
    throw new TtcError('options cannot be combined: ' + given.join(' '));
  }
  const noDue = Object.hasOwn(options, '--no-due');
  if (noDue) {
    const conflicts = ['--overdue', '--no-due', '--due-from', '--due-to']
      .filter((o) => Object.hasOwn(options, o));
    if (conflicts.length > 1) {
      throw new TtcError('options cannot be combined: ' + conflicts.join(' '));
    }
  }
  const view = given.length === 1 ? given[0] : defaultView;

  const tag = Object.hasOwn(options, '--tag') ? inputTag(options['--tag']) : null;

  const dueFrom = Object.hasOwn(options, '--due-from') ? options['--due-from'] : null;
  if (dueFrom !== null && !isValidDate(dueFrom)) throw new TtcError('invalid date: ' + dueFrom);
  const dueTo = Object.hasOwn(options, '--due-to') ? options['--due-to'] : null;
  if (dueTo !== null && !isValidDate(dueTo)) throw new TtcError('invalid date: ' + dueTo);
  if (dueFrom !== null && dueTo !== null && dueFrom > dueTo) {
    throw new TtcError(`--due-from ${dueFrom} is later than --due-to ${dueTo}`);
  }

  const search = Object.hasOwn(options, '--search') ? options['--search'] : null;
  if (search === '') throw new TtcError('--search text must not be empty');

  return { view, noDue, tag, dueFrom, dueTo, search };
}

// The predicate for a parsed filter: true when a task passes the status view,
// no due date when requested, the tag, the due range and the search (all
// AND-combined). Stored dates are YYYY-MM-DD, so string comparison gives date
// order. The search is a literal,
// case-insensitive substring match against the title or, when there is one,
// the note.
function taskFilter(filter, today) {
  const { view, noDue, tag, dueFrom, dueTo, search } = filter;
  const needle = search === null ? null : search.toLowerCase();
  return (task) => {
    if (view === '--overdue') {
      if (!isOverdue(task, today)) return false;
    } else if (view !== '--all' && task.status !== (view === '--done' ? 'done' : 'open')) {
      return false;
    }
    if (noDue && task.due !== null) return false;
    if (tag !== null && !task.tags.includes(tag)) return false;
    if (dueFrom !== null || dueTo !== null) {
      if (task.due === null) return false;
      if (dueFrom !== null && task.due < dueFrom) return false;
      if (dueTo !== null && task.due > dueTo) return false;
    }
    if (needle !== null) {
      const inTitle = task.title.toLowerCase().includes(needle);
      const inNote = task.note !== null && task.note.toLowerCase().includes(needle);
      if (!inTitle && !inNote) return false;
    }
    return true;
  };
}

module.exports = { FILTER_OPTIONS, parseFilter, taskFilter };
