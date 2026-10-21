'use strict';

// The only error type for user-facing failures. The message has no "ttc: "
// prefix and never contains a line break; the CLI adds the prefix.
class TtcError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TtcError';
  }
}

module.exports = { TtcError };
