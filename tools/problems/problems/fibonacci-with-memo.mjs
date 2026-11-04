import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const fib = (n) => { let a = 0n, b = 1n; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };

export default {
  slug: 'fibonacci-with-memo',
  title: 'Fibonacci with Memory',
  topic: 'basics',
  difficulty: 'hard',
  order: 85,
  tags: ['recursion', 'memoization', 'fibonacci'],

  concept: {
    title: 'Memoization: never solve the same problem twice',
    body: [
      'The recursive Fibonacci from the earlier problem recomputes the same values again and again: `F(n)` calls `F(n-1)` and `F(n-2)`, and both of them call `F(n-3)`... For `n = 90` it would make about 10^18 calls.',
      'The cure is simple: when a result has been computed, **store it in a table**, and look it up the next time. This is called **memoization** (a "memo" is a note to yourself). Every value is computed once, and all later requests are answered instantly.',
      { code: 'memo = {}\n\ndef fib(n):\n    if n < 2:\n        return n\n    if n in memo:            # already known?\n        return memo[n]\n    memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]' },
      'The code is almost the same as before, plus the table. The number of different problems is only `n + 1`, and each is solved once, so the time drops from exponential to **O(n)**. The table lives outside the function (a global variable or a global array), so that all calls share it.',
      'In C++ and Java an array initialised with 0 works as the table, as long as 0 can never be a real answer; here `F(n)` is at least 1 for every `n >= 1`.'
    ]
  },

  statement: ['Compute `F(n)` with a recursive function that remembers the values it has already computed. `F(0) = 0`, `F(1) = 1`, `F(n) = F(n-1) + F(n-2)`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`F(n)`.'],
  constraints: ['0 <= n <= 90'],
  examples: [{ input: '50\n', note: 'F(50) = 12586269025. Without a memo this would take hours.' }, { input: '5\n', note: 'F(5) = 5.' }],
  hints: [
    'Keep a table of known answers outside the function: a dictionary in Python, an array in C++ and Java.',
    'At the start of the function: if `n < 2` return `n`; if the table already has `n`, return it.',
    'Otherwise compute `fib(n - 1) + fib(n - 2)`, store it in the table and return it. `F(90)` needs a 64-bit number.'
  ],
  program: {
    io: ['n:int'],
    helpers: {
      python: r`
        memo = {}

        def fib(n):
            if n < 2:
                return n
            if n in memo:
                return memo[n]
            memo[n] = fib(n - 1) + fib(n - 2)
            return memo[n]`,
      cpp: r`
        long long memo[100];

        long long fib(int n) {
            if (n < 2) {
                return n;
            }
            if (memo[n] != 0) {
                return memo[n];
            }
            memo[n] = fib(n - 1) + fib(n - 2);
            return memo[n];
        }`,
      java: r`
        static long[] memo = new long[100];

        static long fib(int n) {
            if (n < 2) {
                return n;
            }
            if (memo[n] != 0) {
                return memo[n];
            }
            memo[n] = fib(n - 1) + fib(n - 2);
            return memo[n];
        }`
    },
    starterHelpers: {
      python: r`
        memo = {}

        def fib(n):
            # Your code here
            pass`,
      cpp: r`
        long long memo[100];

        long long fib(int n) {
            // Your code here
            return 0;
        }`,
      java: r`
        static long[] memo = new long[100];

        static long fib(int n) {
            // Your code here
            return 0;
        }`
    },
    starterBody: {
      python: 'print(fib(n))',
      cpp: r`cout << fib(n) << endl;`,
      java: 'System.out.println(fib((int) n));'
    },
    python: 'print(fib(n))',
    cpp: r`cout << fib(n) << endl;`,
    java: 'System.out.println(fib((int) n));'
  },
  solution: {
    explanation: ['The first time `fib(k)` is asked, it is computed from `fib(k-1)` and `fib(k-2)` and stored. Every later request for the same `k` reads the table. There are only `n + 1` different values, so about `2n` calls are made in total. The recursion is `n` levels deep, which is fine for 90.'],
    complexity: 'Time O(n), space O(n).'
  },
  solve(input) { return String(fib(Number(input.trim()))); },
  tests() {
    const g = rng(85);
    return ['50\n', '5\n', '0\n', '1\n', '2\n', '30\n', '60\n', '89\n', '90\n', ...many(4, () => `${randInt(g, 0, 90)}\n`)];
  }
};
