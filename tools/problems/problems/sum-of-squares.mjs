import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'sum-of-squares',
  title: 'Sum of Squares',
  topic: 'basics',
  difficulty: 'easy',
  order: 38,
  tags: ['loops', 'accumulator'],

  concept: {
    title: 'An expression inside the accumulator',
    body: [
      'The accumulator pattern does not only add the counter. It can add any expression built from the counter: `i * i` for squares, `2 * i` for even numbers, `i % 3` for remainders.',
      'Think about the size of the answer before you choose the type. The squares add up to about `n^3 / 3`. For `n = 100000` that is more than 3 * 10^14, far above the 2 * 10^9 that a 32-bit `int` can hold.',
      'It is also good practice to compute the first few values by hand (here 1, 5, 14, 30) and compare them with what your program prints for small `n`.'
    ]
  },

  statement: ['Given a positive integer `n`, print `1^2 + 2^2 + ... + n^2`, the sum of the squares of the numbers from 1 to `n`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The sum of the squares.'],
  constraints: ['1 <= n <= 100000'],
  examples: [{ input: '3\n', note: '1 + 4 + 9 = 14.' }, { input: '1\n', note: 'Only 1.' }],
  hints: [
    'Use an accumulator that starts at 0.',
    'In each round add `i * i`, the square of the counter.',
    'The total reaches about 3 * 10^14, so use a 64-bit variable. Also make `i` 64-bit in C++ and Java, so that `i * i` cannot overflow.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      total = 0
      for i in range(1, n + 1):
          total += i * i
      print(total)`,
    cpp: r`
      long long total = 0;
      for (long long i = 1; i <= n; i++) {
          total += i * i;
      }
      cout << total << endl;`,
    java: r`
      long total = 0;
      for (long i = 1; i <= n; i++) {
          total += i * i;
      }
      System.out.println(total);`
  },
  solution: {
    explanation: ['Each round adds the square of the counter to the running total. Using 64-bit variables for both the counter and the total avoids overflow.'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { const n = BigInt(input.trim()); return String((n * (n + 1n) * (2n * n + 1n)) / 6n); },
  tests() {
    const g = rng(38);
    return ['3\n', '1\n', '2\n', '10\n', '100\n', '46341\n', '100000\n', '99999\n', ...many(4, () => `${randInt(g, 1, 100000)}\n`)];
  }
};
