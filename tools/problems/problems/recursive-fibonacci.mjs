import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const fib = (n) => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };

export default {
  slug: 'recursive-fibonacci',
  title: 'Fibonacci by Recursion',
  topic: 'basics',
  difficulty: 'medium',
  order: 78,
  tags: ['recursion', 'fibonacci', 'complexity'],

  concept: {
    title: 'A function that calls itself twice',
    body: [
      'The Fibonacci definition is already recursive: `F(n) = F(n-1) + F(n-2)`, with the base cases `F(0) = 0` and `F(1) = 1`. Now each call makes **two** calls, so the calls form a tree instead of a single chain.',
      { code: '              F(4)\n            /      \\\n        F(3)        F(2)\n       /    \\      /    \\\n    F(2)   F(1)  F(1)  F(0)\n    /   \\\n F(1)  F(0)' },
      'Look at the tree: `F(2)` is computed twice, `F(1)` three times. For bigger `n` the same small values are recomputed over and over, and the number of calls grows by about 1.6 times with every step of `n`. For `n = 25` there are about 250,000 calls; for `n = 50` there would be about 40 billion, which no computer can finish in time.',
      'This is **exponential** time, the typical sign of recursion that repeats work. That is why `n` is limited to 25 here. The fix, remembering results that were already computed (*memoization*), comes later in this list.'
    ]
  },

  statement: ['Compute the `n`-th Fibonacci number with a recursive function that follows the definition exactly: `F(0) = 0`, `F(1) = 1`, `F(n) = F(n-1) + F(n-2)`. Print `F(n)`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`F(n)`.'],
  constraints: ['0 <= n <= 25'],
  examples: [{ input: '10\n', note: 'F(10) = 55.' }, { input: '1\n', note: 'F(1) = 1, a base case.' }],
  hints: [
    'There are two base cases: `F(0)` and `F(1)`. What are their values?',
    'For `n >= 2` return `F(n - 1) + F(n - 2)`, two recursive calls.',
    'You can write both base cases in one line: if `n < 2`, then `F(n)` is `n` itself.'
  ],
  program: {
    io: ['n:int'],
    helpers: {
      python: r`
        def fib(n):
            if n < 2:
                return n
            return fib(n - 1) + fib(n - 2)`,
      cpp: r`
        long long fib(long long n) {
            if (n < 2) {
                return n;
            }
            return fib(n - 1) + fib(n - 2);
        }`,
      java: r`
        static long fib(long n) {
            if (n < 2) {
                return n;
            }
            return fib(n - 1) + fib(n - 2);
        }`
    },
    starterHelpers: {
      python: r`
        def fib(n):
            # Your code here
            pass`,
      cpp: r`
        long long fib(long long n) {
            // Your code here
            return 0;
        }`,
      java: r`
        static long fib(long n) {
            // Your code here
            return 0;
        }`
    },
    starterBody: {
      python: 'print(fib(n))',
      cpp: r`cout << fib(n) << endl;`,
      java: 'System.out.println(fib(n));'
    },
    python: 'print(fib(n))',
    cpp: r`cout << fib(n) << endl;`,
    java: 'System.out.println(fib(n));'
  },
  solution: {
    explanation: ['For `n < 2` the answer is `n`. For larger `n` the function adds the answers of the two smaller problems. It is correct but slow: the same values are recomputed many times, so the running time grows exponentially.'],
    complexity: 'Time O(1.6^n) (exponential), space O(n) for the call stack.'
  },
  solve(input) { return String(fib(Number(input.trim()))); },
  tests() {
    const g = rng(78);
    return ['10\n', '1\n', '0\n', '2\n', '3\n', '15\n', '20\n', '24\n', '25\n', ...many(4, () => `${randInt(g, 0, 25)}\n`)];
  }
};
