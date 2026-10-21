'use strict';

const { TtcError } = require('./errors');
const commands = require('./commands');

function oneLine(text) {
  return String(text).replace(/[\r\n\u0085\u2028\u2029]+/g, ' ');
}

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
    const message = err instanceof TtcError ? err.message : (err && err.message) || String(err);
    stderr.write('ttc: ' + oneLine(message) + '\n');
    return 1;
  }
}

module.exports = { run };
