'use strict';
// Test-only. Run as a child process: node interrupted-write.js <dataDir> <step>
// Kills itself with SIGKILL at the given step of writeList.
const fs = require('node:fs');
const path = require('node:path');
const { writeList } = require('../../src/storage');

const [dataDir, step] = process.argv.slice(2);
const kill = () => process.kill(process.pid, 'SIGKILL');

function wrap(name, after) {
  const original = fs[name];
  fs[name] = (...args) => {
    const result = original(...args);
    after(args);
    return result;
  };
}

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
  default:
    throw new Error('unknown step: ' + step);
}

const list = {
  nextId: 3,
  tasks: [{ id: 2, title: 'new task written by the fixture', status: 'open', due: null, tags: ['x'] }],
};
writeList(list, { TTC_HOME: path.resolve(dataDir) });
