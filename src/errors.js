'use strict';

// The only error type for user-facing failures. The message has no "ttc: "
// prefix and never contains a line break; the CLI adds the prefix.
class TtcError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TtcError';
  }
}

function oneLine(text) {
  return String(text).replace(/[\r\n\u0085\u2028\u2029]+/g, ' ');
}

// The single stderr line every failure prints: "ttc: <message>\n".
function failureLine(err) {
  const message = err instanceof TtcError ? err.message : (err && err.message) || String(err);
  return 'ttc: ' + oneLine(message) + '\n';
}

module.exports = { TtcError, oneLine, failureLine };
