'use strict';

const { parseArgs } = require('../args');

module.exports = {
  name: 'help',
  usage: 'ttc help',
  run(args, ctx) {
    parseArgs(args, { positionals: [], options: {} });
    // Required lazily: the registry requires this module.
    const commands = require('./index');
    const lines = commands.map((c) => '  ' + c.usage + '\n');
    ctx.stdout.write('Usage:\n' + lines.join(''));
  },
};
