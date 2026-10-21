'use strict';

// Property 2: a valid command against corrupted stored data (or a corrupted
// import file). The reference model decides whether the damaged bytes still
// form a valid list.

const { defineFuzzProperty } = require('./support/fuzz-harness');
const { genDataCase, DATA_KINDS } = require('./support/fuzz-gen');

defineFuzzProperty({
  name: 'fuzz-data',
  generate: genDataCase,
  labels: DATA_KINDS,
  minPerLabel: 50,
});
