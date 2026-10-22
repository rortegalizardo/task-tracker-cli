'use strict';

// CSV text for a list of tasks (RFC 4180). Pure: no I/O.
//
// Header `id,title,status,due,tags,note`; one row per task in ascending id
// order; `due` is YYYY-MM-DD or empty; `tags` is the tags sorted, joined by
// single spaces; `note` is the note or empty. Every line (header and last row included) ends `\r\n`. A field is
// quoted only when it contains `,`, `"`, CR or LF. Values are written as
// stored (no formula escaping). No BOM.

const HEADER = 'id,title,status,due,tags,note';

function field(value) {
  const text = String(value);
  if (!/[,"\r\n]/.test(text)) return text;
  return '"' + text.replaceAll('"', '""') + '"';
}

function formatCsv(tasks) {
  const rows = [...tasks]
    .sort((a, b) => a.id - b.id)
    .map((t) =>
      [t.id, t.title, t.status, t.due === null ? '' : t.due, [...t.tags].sort().join(' '), t.note === null ? '' : t.note]
        .map(field)
        .join(',') + '\r\n');
  return HEADER + '\r\n' + rows.join('');
}

module.exports = { formatCsv };
