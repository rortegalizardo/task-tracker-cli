'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const CHECKER = path.join(__dirname, '..', 'scripts', 'check-syntax.js');

function makeTree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

function runChecker(root) {
  return spawnSync(process.execPath, [CHECKER, root], { encoding: 'utf8' });
}

test('a file with a syntax error is reported by path', () => {
  const root = makeTree({
    'src/ok.js': 'module.exports = 1;\n',
    'test/fixtures/broken.js': 'function (\n',
  });
  const res = runChecker(root);
  assert.notEqual(res.status, 0);
  assert.ok(res.stderr.includes(path.join('test', 'fixtures', 'broken.js')));
  assert.ok(!res.stderr.includes('ok.js'));
});

test('node_modules is never checked', () => {
  const root = makeTree({
    'src/ok.js': 'module.exports = 1;\n',
    'src/node_modules/bad.js': 'function (\n',
  });
  const res = runChecker(root);
  assert.equal(res.status, 0);
});
