'use strict';

// Pure validation rules: the stored form (titleProblem, tagProblem,
// isValidDate) and the user-typed input forms (inputTitle, inputTag).

const { TtcError } = require('./errors');

// C0 and C1 controls (U+0000-U+001F, U+007F-U+009F), which cover LF, CR and
// U+0085, plus the line and paragraph separators U+2028 and U+2029.
function isControlOrBreak(ch) {
  const c = ch.codePointAt(0);
  return c <= 0x1f || (c >= 0x7f && c <= 0x9f) || c === 0x2028 || c === 0x2029;
}

// Returns null, or a non-empty reason, for a title in stored form.
function titleProblem(t) {
  if (typeof t !== 'string') return 'title is not text';
  if (t === '') return 'title is empty';
  if (t.startsWith(' ') || t.endsWith(' ')) return 'title has a space at its start or end';
  if ([...t].some(isControlOrBreak)) {
    return 'title has a line break or control character';
  }
  return null;
}

// Stored form only: lower case, digits, "_" and "-", 1 to 32 characters.
function tagProblem(t) {
  if (typeof t !== 'string') return 'tag is not text';
  if (/^[a-z0-9][a-z0-9_-]{0,31}$/.test(t)) return null;
  if (/[A-Z]/.test(t)) return 'tag ' + JSON.stringify(t) + ' is not lower case';
  return 'tag ' + JSON.stringify(t) + ' is not a valid tag';
}

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

// YYYY-MM-DD, a real calendar day (Gregorian leap rule). Not Date.UTC, which
// maps years 0-99 to 1900-1999.
function isValidDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(5, 7));
  const d = Number(s.slice(8, 10));
  if (m < 1 || m > 12) return false;
  const days = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  return d >= 1 && d <= days;
}

const LINE_BREAKS = new Set([0x0a, 0x0d, 0x85, 0x2028, 0x2029]);

// A user-typed title to its stored form, or a TtcError. Only U+0020 is
// removed from both ends (not String.prototype.trim, which strips tabs too).
function inputTitle(raw) {
  let start = 0;
  let end = raw.length;
  while (start < end && raw[start] === ' ') start++;
  while (end > start && raw[end - 1] === ' ') end--;
  const title = raw.slice(start, end);
  const chars = [...title];
  // Line breaks first: LF, CR and U+0085 are also control characters.
  if (title === '' || chars.some((ch) => LINE_BREAKS.has(ch.codePointAt(0)))) {
    throw new TtcError('title must be one non-empty line');
  }
  if (chars.some(isControlOrBreak)) {
    throw new TtcError('title must not contain control characters');
  }
  return title;
}

// A user-typed tag to its stored (lower case) form, or a TtcError. ASCII only,
// so lower-casing never maps non-ASCII text.
function inputTag(raw) {
  if (/^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(raw)) return raw.toLowerCase();
  throw new TtcError('invalid tag: ' + raw);
}

module.exports = { titleProblem, tagProblem, isValidDate, inputTitle, inputTag };
