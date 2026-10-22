'use strict';
// Test-only. Preloaded with `node --require` before bin/ttc.js (RCDEV-838).
// Throws from a timer, so the exception escapes run() and reaches the
// process-level handler in bin/ttc.js.
setImmediate(() => {
  throw new Error('simulated failure outside run');
});
