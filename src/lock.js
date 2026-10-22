'use strict';

// The exclusive lock around a read-change-write cycle (RCDEV-835).
//
// The lock is a file next to tasks.json, created exclusively and holding only
// the process id of its owner. A lock whose owner is gone is taken over; the
// takeover is done by one process at a time, under a second short-lived guard
// file. The lock is released on every path, and a folder this call created is
// removed again when nothing else lives in it.
//
// fs.* is always called through the module object, so tests can patch it.

const fs = require('node:fs');
const path = require('node:path');
const { TtcError } = require('./errors');
const { dataPaths, reasonOf } = require('./storage');

const WAIT_LIMIT_MS = 10000; // how long a changing command waits for a live lock
const EMPTY_LOCK_MS = 500; // an unreadable or pid-less lock is stale after this age
const GUARD_STALE_MS = 1000; // a takeover guard is stale after this age
const PID_TEXT = /^[1-9][0-9]*\n?$/;

const sleepCell = new Int32Array(new SharedArrayBuffer(4));

function sleepJittered() {
  Atomics.wait(sleepCell, 0, 0, 20 + Math.floor(Math.random() * 21));
}

// 'gone' (no lock file), 'stale' (nobody holds it) or 'live'.
function judge(lock) {
  let text;
  let stat;
  let readable = true;
  try {
    stat = fs.statSync(lock);
  } catch {
    return 'gone';
  }
  try {
    text = fs.readFileSync(lock, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return 'gone';
    readable = false;
  }
  if (readable && PID_TEXT.test(text)) {
    const pid = Number(text.trim());
    if (pid === process.pid) return 'stale'; // cannot be ours: a call acquires once
    try {
      process.kill(pid, 0);
    } catch (err) {
      if (err.code === 'ESRCH') return 'stale';
    }
    return 'live';
  }
  // Empty, not a pid, or unreadable. A live holder writes its pid right after
  // creating the file, so only an old one is stale.
  return Date.now() - stat.mtimeMs >= EMPTY_LOCK_MS ? 'stale' : 'live';
}

// Removes a stale lock, once, under the guard. Returns when the caller should
// go back to the acquire loop.
function takeOver(lock, guard, fail) {
  let fd;
  try {
    fd = fs.openSync(guard, 'wx');
  } catch (err) {
    if (err.code === 'ENOENT') return;
    if (err.code !== 'EEXIST') throw fail(err);
    try {
      if (Date.now() - fs.statSync(guard).mtimeMs >= GUARD_STALE_MS) fs.unlinkSync(guard);
      else sleepJittered();
    } catch {
      // the guard vanished meanwhile; just try again
    }
    return;
  }
  fs.closeSync(fd);
  try {
    // The lock may have been replaced by a live one since it was judged.
    if (judge(lock) === 'stale') {
      try {
        fs.unlinkSync(lock);
      } catch (err) {
        if (err.code !== 'ENOENT') throw fail(err);
      }
    }
  } finally {
    try {
      fs.unlinkSync(guard);
    } catch {
      // best effort
    }
  }
}

function ensureFolder(dir, file, made) {
  try {
    const now = fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    // Only a folder this call created; the umask cannot weaken it.
    if (now !== undefined) fs.chmodSync(dir, 0o700);
    return made === undefined ? now : made;
  } catch (err) {
    throw new TtcError('cannot write ' + file + ': ' + reasonOf(err));
  }
}

function acquire(dir, file, lock, guard, state) {
  const fail = (err) => new TtcError('cannot write ' + file + ': ' + reasonOf(err));
  const start = performance.now();
  for (;;) {
    try {
      const fd = fs.openSync(lock, 'wx', 0o600);
      state.created = true;
      try {
        fs.writeFileSync(fd, process.pid + '\n');
      } finally {
        fs.closeSync(fd);
      }
      return;
    } catch (err) {
      if (state.created) throw fail(err);
      if (err.code === 'ENOENT') {
        // Another command removed the folder it had just made.
        state.made = ensureFolder(dir, file, state.made);
        continue;
      }
      if (err.code !== 'EEXIST') throw fail(err);
    }
    const verdict = judge(lock);
    if (verdict === 'gone') continue;
    if (verdict === 'stale') {
      takeOver(lock, guard, fail);
      continue;
    }
    if (performance.now() - start >= WAIT_LIMIT_MS) {
      throw new TtcError('cannot write ' + file + ': busy, another ttc command holds ' + lock);
    }
    sleepJittered();
  }
}

function release(dir, lock, state) {
  if (state.created) {
    try {
      fs.unlinkSync(lock);
    } catch {
      // best effort
    }
  }
  if (state.made === undefined) return;
  // Up to and including the outermost folder this call made. A folder that
  // still holds tasks.json or another command's lock stays.
  let current = dir;
  const stop = path.resolve(state.made);
  for (;;) {
    try {
      fs.rmdirSync(current);
    } catch {
      return;
    }
    if (path.resolve(current) === stop) return;
    const parent = path.dirname(current);
    if (parent === current) return;
    current = parent;
  }
}

// Runs fn() while holding the lock and returns its result. Errors from fn
// propagate unchanged.
function withLock(fn, env = process.env) {
  const { dir, file } = dataPaths(env);
  const lock = file + '.lock';
  const guard = file + '.lock.takeover';
  const state = { made: undefined, created: false };
  try {
    state.made = ensureFolder(dir, file, undefined);
    acquire(dir, file, lock, guard, state);
    return fn();
  } finally {
    release(dir, lock, state);
  }
}

module.exports = { withLock };
