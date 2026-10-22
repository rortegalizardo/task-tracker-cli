'use strict';

const { oneLine, failureLine } = require('./errors');
const commands = require('./commands');

function run(argv, { stdout, stderr }) {
  try {
    let name = argv[0];
    let args = argv.slice(1);
    if (argv.length === 0 || argv[0] === '--help') name = 'help';
    const command = commands.find((c) => c.name === name);
    if (!command) {
      stderr.write('ttc: unknown command: ' + oneLine(name) + ' (see ttc help)\n');
      return 1;
    }
    // Buffer stdout so nothing is written on failure.
    let out = '';
    command.run(args, { stdout: { write: (s) => { out += s; } }, stderr });
    stdout.write(out);
    return 0;
  } catch (err) {
    stderr.write(failureLine(err));
    return 1;
  }
}

module.exports = { run };
