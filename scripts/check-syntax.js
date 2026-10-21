'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOTS = ['bin', 'scripts', 'src', 'test'];
const EXTENSIONS = ['.js', '.cjs', '.mjs'];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') walk(full, out);
    } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
}

function main() {
  const rootDir = path.resolve(process.argv[2] ?? path.join(__dirname, '..'));
  const files = [];
  for (const name of ROOTS) {
    const dir = path.join(rootDir, name);
    if (fs.existsSync(dir)) walk(dir, files);
  }
  files.sort();

  if (files.length === 0) {
    console.error(`check-syntax: no JavaScript files found under ${rootDir}`);
    process.exit(1);
  }

  let failed = 0;
  for (const file of files) {
    const res = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (res.status !== 0) {
      failed += 1;
      process.stderr.write(`syntax error: ${path.relative(rootDir, file)}\n${res.stderr}\n`);
    }
  }
  if (failed > 0) process.exit(1);
  console.log(`check-syntax: ${files.length} files OK`);
}

main();
