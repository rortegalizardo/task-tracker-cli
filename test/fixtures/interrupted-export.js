'use strict';
// Test-only. Run as a child process: node interrupted-export.js <step>
// Runs `ttc export backup.json` and kills itself with SIGKILL at the given step of the write.
const { killAtStep } = require('./kill-at-step');

killAtStep(process.argv[2]);

const { run } = require('../../src/cli');
process.exitCode = run(['export', 'backup.json'], { stdout: process.stdout, stderr: process.stderr });
