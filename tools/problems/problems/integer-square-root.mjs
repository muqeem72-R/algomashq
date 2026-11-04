import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

function isqrt(n) {
  if (n < 2n) return n;
  let x = n, y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x;
}

export default {
  slug: 'integer-square-root',
  title: 'Integer Square Root',
  topic: 'basics',
  difficulty: 'hard',
  order: 84,
  tags: ['complexity', 'binary-search', 'math'],

  concept: {
    title: 'Binary search on the answer',
    body: [
      'We want the largest whole number `x` with `x * x <= n`. Trying every `x` from 0 upwards needs up to 10^9 steps for `n = 10^18`. But there is a pattern to exploit: if `x * x <= n` is true for some `x`, it is true for every smaller number as well. The answers to the question "is `x` small enough?" look like `yes yes yes ... yes no no no ...`.',
      'When the answers switch only once, you can find the switching point by **halving the search range**: look at the middle; if the answer there is "yes", the border is at the middle or to its right; otherwise it is to its left. Each question throws away half of the candidates, so 10^9 candidates need only about 30 questions. This is **binary search**.',
      { code: 'low, high = 0, 10**9                 # the answer is somewhere in [low, high]\nwhile low < high:\n    mid = (low + high + 1) // 2      # round UP, so the range always shrinks\n    if mid * mid <= n:\n        low = mid                    # mid is small enough: the answer is mid or more\n    else:\n        high = mid - 1               # mid is too big' },
      'Rounding the middle up matters. With `low = mid` and a rounded-down middle, a range like `[4, 5]` would give `mid = 4` again and the loop would never end. The running time is **O(log n)**, and `mid * mid` stays below about 10^18, which fits in 64 bits.'
    ]
  },

  statement: ['Given a non-negative integer `n`, print the largest integer `x` such that `x * x <= n` (the square root, rounded down).'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The integer square root of `n`.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '17\n', note: '4 * 4 = 16 <= 17 but 5 * 5 = 25 > 17.' }, { input: '49\n', note: '7 * 7 = 49 exactly.' }],
  hints: [
    'The answer is between 0 and 10^9, because (10^9)^2 = 10^18.',
    'Look at the middle of the range. If `mid * mid <= n`, the answer is at least `mid`; otherwise it is smaller.',
    'Use `mid = (low + high + 1) / 2` (rounded up), set `low = mid` or `high = mid - 1`, and stop when `low == high`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      low = 0
      high = 1000000000
      while low < high:
          mid = (low + high + 1) // 2
          if mid * mid <= n:
              low = mid
          else:
              high = mid - 1
      print(low)`,
    cpp: r`
      long long low = 0, high = 1000000000;
      while (low < high) {
          long long mid = (low + high + 1) / 2;
          if (mid * mid <= n) {
              low = mid;
          } else {
              high = mid - 1;
          }
      }
      cout << low << endl;`,
    java: r`
      long low = 0, high = 1000000000;
      while (low < high) {
          long mid = (low + high + 1) / 2;
          if (mid * mid <= n) {
              low = mid;
          } else {
              high = mid - 1;
          }
      }
      System.out.println(low);`
  },
  solution: {
    explanation: ['The invariant is: the answer is always inside `[low, high]`. A "yes" at `mid` moves `low` up to `mid`, a "no" moves `high` below `mid`. About 30 rounds are needed for a range of 10^9. (A floating-point `sqrt` can be off by one for big numbers, which is why the exact integer search is preferred.)'],
    complexity: 'Time O(log n), space O(1).'
  },
  solve(input) { return String(isqrt(BigInt(input.trim()))); },
  tests() {
    const g = rng(84);
    const T9 = 10n ** 9n;
    return ['17\n', '49\n', '0\n', '1\n', '2\n', '3\n', '4\n', '15\n', '16\n', `${10n ** 18n}\n`, `${T9 * T9 - 1n}\n`, `${(T9 - 1n) * (T9 - 1n)}\n`, `${(T9 - 1n) * (T9 - 1n) - 1n}\n`, '999999999999999999\n', ...many(5, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
