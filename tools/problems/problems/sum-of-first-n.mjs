import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'sum-of-first-n',
  title: 'Sum of the First N Numbers',
  topic: 'basics',
  difficulty: 'easy',
  order: 35,
  tags: ['loops', 'accumulator'],

  concept: {
    title: 'The accumulator pattern',
    body: [
      'To add many numbers, keep a variable that collects the total: set it to 0 before the loop, and add to it in every round. This is called an **accumulator**. The same idea computes products (start at 1), counts (add 1) and maximums.',
      { code: 'total = 0\nfor i in range(1, n + 1):\n    total = total + i      # or: total += i\nprint(total)' },
      'Always initialize the accumulator before the loop. If it is declared inside the loop, it is reset in every round and you lose the total.',
      'The loop runs `n` times, so the work grows in proportion to `n`. We say the running time is **O(n)**. For `n = 10^6` this is instant. Later in this list you will meet inputs where a loop to `n` is far too slow and a formula is needed.'
    ]
  },

  statement: ['Given a positive integer `n`, print `1 + 2 + 3 + ... + n`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The sum.'],
  constraints: ['1 <= n <= 10^6'],
  examples: [{ input: '5\n', note: '1 + 2 + 3 + 4 + 5 = 15.' }, { input: '1\n', note: 'Only the number 1.' }],
  hints: [
    'You need a variable for the running total, starting at 0.',
    'Loop `i` from 1 to `n` and add `i` to the total.',
    'For `n = 10^6` the answer is about 5 * 10^11, so the total must be a 64-bit variable.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      total = 0
      for i in range(1, n + 1):
          total += i
      print(total)`,
    cpp: r`
      long long total = 0;
      for (long long i = 1; i <= n; i++) {
          total += i;
      }
      cout << total << endl;`,
    java: r`
      long total = 0;
      for (long i = 1; i <= n; i++) {
          total += i;
      }
      System.out.println(total);`
  },
  solution: {
    explanation: ['The accumulator `total` starts at 0 and receives every number from 1 to `n`. It must be 64-bit because the sum reaches about 5 * 10^11. (There is also the formula `n * (n + 1) / 2`, which you will need when `n` is huge.)'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { const n = BigInt(input.trim()); return String((n * (n + 1n)) / 2n); },
  tests() {
    const g = rng(35);
    return ['5\n', '1\n', '2\n', '10\n', '100\n', '65536\n', '1000000\n', '999999\n', ...many(4, () => `${randInt(g, 1, 1e6)}\n`)];
  }
};
