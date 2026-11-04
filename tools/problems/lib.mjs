// Small helpers for writing problems.

// A seeded random number generator, so a rebuild produces exactly the same tests.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

// A random BigInt in [lo, hi].
export function randBig(r, lo, hi) {
  const span = hi - lo + 1n;
  let value = 0n;
  for (let i = 0; i < 6; i++) value = (value << 32n) | BigInt(Math.floor(r() * 4294967296));
  return lo + (value % span);
}

// Modular exponentiation with BigInt (used by the reference solutions).
export function modPow(base, exp, mod) {
  let result = 1n % mod;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

// The words (separated by spaces or new lines) of a test input.
export const words = (input) => input.split(/\s+/).filter(Boolean);

// The numbers of a test input, as BigInt so that nothing is lost.
export const bigs = (input) => words(input).map(BigInt);

// An array made by calling fn(0), fn(1), ... fn(count - 1): handy for building lists of tests.
export const many = (count, fn) => Array.from({ length: count }, (_, i) => fn(i));

// The two input lines of an array problem: its length, then its elements.
export const arr = (a) => `${a.length}\n${a.join(' ')}\n`;

// Random array of `length` integers in [lo, hi].
export const randArray = (r, length, lo, hi) => Array.from({ length }, () => randInt(r, lo, hi));
