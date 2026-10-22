'use strict';
// Test-only. Patches fs so the process kills itself with SIGKILL at the given
// step of writeList.
const fs = require('node:fs');

const kill = () => process.kill(process.pid, 'SIGKILL');

function wrap(name, after) {
  const original = fs[name];
  fs[name] = (...args) => {
    const result = original(...args);
    after(args);
    return result;
  };
}

function killAtStep(step) {
  switch (step) {
    case 'after-mkdir':
      wrap('mkdirSync', kill);
      break;
    case 'after-open':
      wrap('openSync', ([p]) => {
        if (String(p).endsWith('.tmp')) kill();
      });
      break;
    case 'mid-write': {
      const original = fs.writeSync;
      fs.writeSync = (fd, buf, offset, length) => {
        original(fd, buf, offset, Math.floor(length / 2));
        kill();
      };
      break;
    }
    case 'after-fsync':
      wrap('fsyncSync', kill);
      break;
    case 'before-rename':
      fs.renameSync = kill;
      break;
    case 'after-rename':
      wrap('renameSync', kill);
      break;
    default:
      throw new Error('unknown step: ' + step);
  }
}

module.exports = { killAtStep };
