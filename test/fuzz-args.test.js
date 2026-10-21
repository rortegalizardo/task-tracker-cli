'use strict';

// Property 1: random argument lists against random stored state. Valid input
// matches the reference model's output and bytes; invalid input fails with one
// "ttc: " line and leaves every file as it was.

const { defineFuzzProperty } = require('./support/fuzz-harness');
const { genArgsCase, ARGS_LABELS } = require('./support/fuzz-gen');

defineFuzzProperty({
  name: 'fuzz-args',
  generate: genArgsCase,
  labels: ARGS_LABELS,
  minPerLabel: 100,
  minOkShare: 0.25,
});
