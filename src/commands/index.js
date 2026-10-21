'use strict';

const help = require('./help');
const add = require('./add');
const list = require('./list');
const { done, reopen } = require('./status');

// Registry order is the order of the usage (PD-0003 item 12).
module.exports = [help, add, list, done, reopen];
