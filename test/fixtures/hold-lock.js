'use strict';
// Test-only. Run as a child process with TTC_HOME in the environment.
// Takes the lock, prints "locked", and holds it for up to 60 seconds.
const { withLock } = require('../../src/lock');

withLock(() => {
  process.stdout.write('locked\n');
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60000);
});
