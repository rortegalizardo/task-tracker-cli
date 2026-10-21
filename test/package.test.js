'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

function sourceFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(full));
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

test('package.json declares no runtime dependencies (criterion 23)', () => {
  assert.deepEqual(Object.keys(pkg.dependencies ?? {}), []);
});

test('no source file imports a network module (criterion 24)', () => {
  const mods = 'net|http|https|http2|dgram|tls';
  const patterns = [
    new RegExp(`require\\(\\s*['"\`](?:node:)?(?:${mods})['"\`]\\s*\\)`),
    new RegExp(`from\\s+['"\`](?:node:)?(?:${mods})['"\`]`),
    new RegExp(`import\\(\\s*['"\`](?:node:)?(?:${mods})['"\`]\\s*\\)`),
  ];
  const files = [...sourceFiles(path.join(ROOT, 'bin')), ...sourceFiles(path.join(ROOT, 'src'))];
  assert.ok(files.length > 0);
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const p of patterns) assert.doesNotMatch(text, p, file);
  }
});

test('the declared ttc command runs with node (criterion 25)', () => {
  assert.equal(typeof pkg.bin.ttc, 'string');
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
  const r = spawnSync(process.execPath, [path.join(ROOT, pkg.bin.ttc), 'help'], {
    env: { PATH: process.env.PATH, HOME: home, TTC_HOME: path.join(home, 'data') },
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  assert.ok(r.stdout.split('\n').map((l) => l.trim()).includes('ttc help'));
});

test('npm install --global from the clone makes ttc runnable by name (criterion 26)', { timeout: 120000 }, () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ttc-'));
  const prefix = path.join(tmp, 'prefix');
  const nodeDir = path.dirname(process.execPath);
  const basePath = [nodeDir, '/usr/bin', '/bin'].join(path.delimiter);
  const env = { PATH: basePath, HOME: tmp, TTC_HOME: path.join(tmp, 'data') };
  const install = spawnSync(
    path.join(nodeDir, 'npm'),
    ['install', '--global', ROOT, '--prefix', prefix, '--cache', path.join(tmp, 'cache'), '--offline', '--no-audit', '--no-fund'],
    { env, encoding: 'utf8', timeout: 60000 },
  );
  assert.equal(install.status, 0, install.stderr);
  const r = spawnSync('ttc', ['help'], {
    env: { ...env, PATH: path.join(prefix, 'bin') + path.delimiter + basePath },
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.split('\n').map((l) => l.trim()).includes('ttc help'));
});
