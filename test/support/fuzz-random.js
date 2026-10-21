'use strict';

// Seeded random source for the generated tests. Every generator draws only
// from a Random built here, so a case is fully determined by
// (seed, property name, case index): no Math.random, no Date, no temp names.

const crypto = require('node:crypto');

const MAX_SEED = 4294967295;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Random {
  constructor(seed32) {
    this.next = mulberry32(seed32);
  }

  // Whole number from lo to hi, both included.
  int(lo, hi) {
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }

  pick(array) {
    return array[Math.floor(this.next() * array.length)];
  }

  chance(p) {
    return this.next() < p;
  }

  // len characters (code points) from `alphabet`, a string or an array of strings.
  string(len, alphabet) {
    const chars = Array.from(alphabet);
    let out = '';
    for (let i = 0; i < len; i++) out += this.pick(chars);
    return out;
  }

  // In-place Fisher-Yates; returns the array.
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// TTC_FUZZ_SEED unset: a fresh random seed. Set: it must be a decimal integer
// from 0 to 4294967295, or this throws. It never falls back to a random seed.
function resolveSeed(env = process.env) {
  const raw = env.TTC_FUZZ_SEED;
  if (raw === undefined) return crypto.randomInt(0, 2 ** 32);
  if (!/^[0-9]{1,10}$/.test(raw) || Number(raw) > MAX_SEED) {
    throw new Error(
      'TTC_FUZZ_SEED must be a decimal integer from 0 to ' + MAX_SEED + ', got ' + JSON.stringify(raw),
    );
  }
  return Number(raw);
}

// An independent PRNG per case: case N is the same whatever ran before it.
function caseRandom(seed, propertyName, index) {
  const digest = crypto.createHash('sha256').update(seed + ':' + propertyName + ':' + index).digest();
  return new Random(digest.readUInt32LE(0));
}

module.exports = { Random, resolveSeed, caseRandom };
