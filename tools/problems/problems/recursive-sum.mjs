import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'recursive-sum',
  title: 'Recursive Sum',
  topic: 'basics',
  difficulty: 'medium',
  order: 75,
  tags: ['recursion', 'call-stack'],

  concept: {
    title: 'What happens on the call stack',
    body: [
      'You met recursion in the factorial problem: a function that solves a problem by calling itself on a smaller one. Let us look at what the computer does. Every call gets its own small workspace (a *stack frame*) with its own copy of the parameters. The calls pile up like plates, and the last plate is washed first.',
      'For `total(3)` defined as `total(n) = n + total(n - 1)` with `total(0) = 0`:',
      { code: 'total(3) waits for total(2)\n  total(2) waits for total(1)\n    total(1) waits for total(0)\n      total(0) returns 0          <- base case\n    total(1) returns 1 + 0 = 1\n  total(2) returns 2 + 1 = 3\ntotal(3) returns 3 + 3 = 6' },
      'Two things are essential: a **base case** that returns without calling again (here `n == 0`), and a recursive call on a **smaller** input (`n - 1`), so that the base case is eventually reached. Forgetting either gives an endless recursion, which crashes with a stack overflow.',
      'The depth of the recursion is `n`, and every level uses memory. That is why `n` is limited to 500 here. In practice a loop would do this job better; the point is to practise thinking recursively.'
    ]
  },

  statement: ['Write a recursive function `total(n)` that returns `1 + 2 + ... + n`, and print `total(n)`. Do not use a loop.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The sum of the numbers from 1 to `n`.'],
  constraints: ['0 <= n <= 500'],
  examples: [{ input: '4\n', note: '1 + 2 + 3 + 4 = 10.' }, { input: '0\n', note: 'The empty sum is 0.' }],
  hints: [
    'What is `total(0)`? That is your base case.',
    'For larger `n`, the sum is `n` plus the sum of the numbers up to `n - 1`.',
    'The function returns `n + total(n - 1)`, and calls itself with a smaller argument.'
  ],
  program: {
    io: ['n:int'],
    helpers: {
      python: r`
        def total(n):
            if n == 0:
                return 0
            return n + total(n - 1)`,
      cpp: r`
        long long total(long long n) {
            if (n == 0) {
                return 0;
            }
            return n + total(n - 1);
        }`,
      java: r`
        static long total(long n) {
            if (n == 0) {
                return 0;
            }
            return n + total(n - 1);
        }`
    },
    starterHelpers: {
      python: r`
        def total(n):
            # Your code here
            pass`,
      cpp: r`
        long long total(long long n) {
            // Your code here
            return 0;
        }`,
      java: r`
        static long total(long n) {
            // Your code here
            return 0;
        }`
    },
    starterBody: {
      python: 'print(total(n))',
      cpp: r`cout << total(n) << endl;`,
      java: 'System.out.println(total(n));'
    },
    python: 'print(total(n))',
    cpp: r`cout << total(n) << endl;`,
    java: 'System.out.println(total(n));'
  },
  solution: {
    explanation: ['The base case `n == 0` returns 0. Any other `n` adds itself to the answer for the smaller problem `n - 1`. The calls pile up to a depth of `n` and then return one by one, adding the numbers on the way back.'],
    complexity: 'Time O(n), space O(n) for the call stack.'
  },
  solve(input) { const n = Number(input.trim()); return String((n * (n + 1)) / 2); },
  tests() {
    const g = rng(75);
    return ['4\n', '0\n', '1\n', '2\n', '10\n', '100\n', '499\n', '500\n', ...many(4, () => `${randInt(g, 0, 500)}\n`)];
  }
};
