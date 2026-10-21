'use strict';

// The local calendar date (YYYY-MM-DD) in the process's time zone (PD-0002 item 6).
// Not toISOString(): that gives the UTC date.
function localToday(now = new Date()) {
  const y = String(now.getFullYear()).padStart(4, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Overdue: open, has a due date, and the due date is before today. A task due
// today is not overdue and a done task never is. Stored dates are YYYY-MM-DD,
// so comparing the strings gives date order.
function isOverdue(task, today) {
  return task.status === 'open' && task.due !== null && task.due < today;
}

module.exports = { localToday, isOverdue };
