import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

const MOD = 1000000007n;

export default {
  slug: 'sum-to-n-modulo',
  title: 'Sum to a Huge N',
  topic: 'basics',
  difficulty: 'hard',
  order: 82,
  tags: ['complexity', 'math', 'modulo', 'overflow'],

  concept: {
    title: 'When a loop is impossible, use a formula',
    body: [
      'Adding the numbers from 1 to `n` with a loop takes `n` steps. A computer does roughly 10^8 to 10^9 simple steps per second, so for `n = 10^18` the loop would run for about 30 years. Time to use mathematics: the sum is `n * (n + 1) / 2`. It takes one multiplication, no loop.',
      'The answer is asked **modulo** 1,000,000,007, because the true sum has 36 digits. But here is the trap. You cannot compute `n * (n + 1)` first: the product is about 10^36, far beyond 64 bits (about 9.2 * 10^18), and it overflows silently in C++ and Java.',
      'Taking the remainder before dividing by 2 does not work either, since `(x % m) / 2` is not `(x / 2) % m`. The way out: one of `n` and `n + 1` is always even. Divide **that one** by 2 first (exactly, no rounding), then take each factor modulo `m` and multiply the two remainders. Each remainder is below 10^9 + 7, so their product stays below about 10^18 and fits.',
      { code: 'a, b = n, n + 1\nif a is even: a = a / 2   else: b = b / 2\nanswer = (a % m) * (b % m) % m' },
      'The time is now O(1). The same thinking, "do not compute the huge number, compute what is asked and keep every intermediate value small", solves many contest problems.'
    ]
  },

  statement: ['Given `n`, print `(1 + 2 + ... + n)` modulo 1000000007.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The sum modulo 1000000007.'],
  constraints: ['1 <= n <= 10^18'],
  examples: [{ input: '10\n', note: '1 + ... + 10 = 55.' }, { input: '1000000000000000000\n', note: 'The real sum is about 5 * 10^35; the answer is its remainder.' }],
  hints: [
    'A loop up to 10^18 is far too slow. Use the formula `n * (n + 1) / 2`.',
    'The product `n * (n + 1)` overflows 64 bits. Divide the even one of `n` and `n + 1` by 2 before multiplying.',
    'Then reduce both factors modulo 1000000007 and multiply them: `(a % m) * (b % m) % m`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      MOD = 1000000007
      a, b = n, n + 1
      if a % 2 == 0:
          a //= 2
      else:
          b //= 2
      print(a % MOD * (b % MOD) % MOD)`,
    cpp: r`
      const long long MOD = 1000000007LL;
      long long a = n, b = n + 1;
      if (a % 2 == 0) {
          a /= 2;
      } else {
          b /= 2;
      }
      cout << (a % MOD) * (b % MOD) % MOD << endl;`,
    java: r`
      final long MOD = 1000000007L;
      long a = n, b = n + 1;
      if (a % 2 == 0) {
          a /= 2;
      } else {
          b /= 2;
      }
      System.out.println((a % MOD) * (b % MOD) % MOD);`
  },
  solution: {
    explanation: ['Exactly one of `n` and `n + 1` is even; halving it first keeps the arithmetic exact. Both factors are then reduced modulo 10^9 + 7 (so each is below 1.0000001 * 10^9), and their product stays below about 10^18, which fits in a signed 64-bit integer.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const n = BigInt(input.trim()); return String(((n * (n + 1n)) / 2n) % MOD); },
  tests() {
    const g = rng(82);
    const T18 = 10n ** 18n;
    return ['10\n', '1\n', '2\n', '3\n', '1000000006\n', '1000000007\n', '1000000008\n', `${T18}\n`, `${T18 - 1n}\n`, '999999999999999999\n', '576460752303423487\n', ...many(5, () => `${randBig(g, 1n, T18)}\n`)];
  }
};
