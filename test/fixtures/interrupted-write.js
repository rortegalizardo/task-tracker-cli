'use strict';
// Test-only. Run as a child process: node interrupted-write.js <dataDir> <step>
// Kills itself with SIGKILL at the given step of writeList.
const path = require('node:path');
const { writeList } = require('../../src/storage');
const { killAtStep } = require('./kill-at-step');

const [dataDir, step] = process.argv.slice(2);
killAtStep(step);

const list = {
  nextId: 3,
  tasks: [{ id: 2, title: 'new task written by the fixture', status: 'open', due: null, tags: ['x'], note: null, important: false }],
};
writeList(list, { TTC_HOME: path.resolve(dataDir) });
