'use strict';

const help = require('./help');
const add = require('./add');
const list = require('./list');
const { done, reopen } = require('./status');
const { important, unimportant } = require('./important');
const postpone = require('./postpone');
const rename = require('./rename');
const del = require('./delete');
const clean = require('./clean');
const tag = require('./tag');
const note = require('./note');
const exportCmd = require('./export');
const importCmd = require('./import');
const stats = require('./stats');

// Registry order is the order of the usage (PD-0003 item 12).
module.exports = [help, add, list, done, reopen, important, unimportant, postpone, rename, del, clean, tag, note, exportCmd, importCmd, stats];
