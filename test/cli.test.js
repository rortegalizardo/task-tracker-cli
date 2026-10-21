'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'ttc.js');

function ttc(args, { ttcHome } = {}) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
  const env = { PATH: process.env.PATH, HOME: home };
  if (ttcHome !== undefined) env.TTC_HOME = ttcHome;
  const r = spawnSync(process.execPath, [BIN, ...args], { env, encoding: 'utf8' });
  return { ...r, home };
}

function usageLines(stdout) {
  return stdout.split('\n').map((l) => l.trim());
}

for (const args of [[], ['help'], ['--help']]) {
  test(`ttc ${args.join(' ')} prints the usage and creates nothing (criteria 1-4)`, () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
    const ttcHome = path.join(base, 'missing', 'data');
    const r = ttc(args, { ttcHome });
    assert.equal(r.status, 0);
    assert.equal(r.stderr, '');
    assert.ok(usageLines(r.stdout).includes('ttc help'));
    assert.equal(fs.existsSync(path.join(base, 'missing')), false);
    assert.equal(fs.existsSync(path.join(r.home, '.ttc')), false);
  });
}

test('ttc help extra is a one-line error (criterion 5)', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
  const r = ttc(['help', 'extra'], { ttcHome: path.join(base, 'data') });
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /^ttc: [^\n]+\n$/);
});

test('ttc frobnicate is the exact unknown-command line (criterion 6)', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
  const ttcHome = path.join(base, 'data');
  const r = ttc(['frobnicate'], { ttcHome });
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, 'ttc: unknown command: frobnicate (see ttc help)\n');
  assert.equal(fs.existsSync(ttcHome), false);
  assert.equal(fs.existsSync(path.join(r.home, '.ttc')), false);
});

test('ttc help lists the add, list, export and import usages (RCDEV-830 AC31)', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
  const r = ttc(['help'], { ttcHome: path.join(base, 'data') });
  assert.equal(r.status, 0);
  const lines = usageLines(r.stdout);
  assert.ok(lines.includes('ttc help'));
  assert.ok(lines.some((l) => l.startsWith('ttc add ')));
  assert.ok(lines.some((l) => l.startsWith('ttc list ')));
  assert.ok(lines.some((l) => l.startsWith('ttc rename ')));
  assert.ok(lines.includes('ttc export <file>'));
  assert.ok(lines.includes('ttc import <file>'));
});
