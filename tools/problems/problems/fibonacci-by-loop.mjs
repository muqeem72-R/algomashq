import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'fibonacci-by-loop',
  title: 'Fibonacci with a Loop',
  topic: 'basics',
  difficulty: 'medium',
  order: 73,
  tags: ['loops', 'fibonacci', 'sequences'],

  concept: {
    title: 'Keeping only what you still need',
    body: [
      'The Fibonacci numbers start `0, 1, 1, 2, 3, 5, 8, ...`; every number is the sum of the two before it: `F(n) = F(n-1) + F(n-2)` with `F(0) = 0` and `F(1) = 1`.',
      'You do not need to store the whole sequence to get `F(n)`. Each new number depends only on the last two, so two variables are enough: `a = F(i)` and `b = F(i+1)`. In every round the pair moves one place along the sequence: the new `a` is the old `b`, and the new `b` is the sum of the old two.',
      { code: 'a, b = 0, 1            # F(0), F(1)\nfor _ in range(n):\n    a, b = b, a + b    # move the pair one step\n# a is now F(n)' },
      'In C++ and Java the update needs a temporary variable, because you cannot assign `a` and `b` at the same moment: `long long next = a + b; a = b; b = next;`. Another reason to use 64-bit integers: `F(90)` has 19 digits.',
      'This loop needs `n` steps, which is fine for `n` up to 90. In the last problems of this list you will compute Fibonacci numbers for `n` up to 10^18, which needs a much faster idea.'
    ]
  },

  statement: ['Given `n`, print the `n`-th Fibonacci number `F(n)`, where `F(0) = 0`, `F(1) = 1` and `F(n) = F(n-1) + F(n-2)`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`F(n)`.'],
  constraints: ['0 <= n <= 90'],
  examples: [{ input: '10\n', note: 'F(10) = 55.' }, { input: '0\n', note: 'F(0) = 0.' }],
  hints: [
    'Keep two variables: the current Fibonacci number and the next one.',
    'In each round move the pair forward: the new first is the old second, the new second is their sum.',
    'After `n` rounds the first variable is `F(n)`. For `n = 0` the loop does not run and it is 0, which is right.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      a, b = 0, 1
      for _ in range(n):
          a, b = b, a + b
      print(a)`,
    cpp: r`
      long long a = 0, b = 1;
      for (int i = 0; i < n; i++) {
          long long next = a + b;
          a = b;
          b = next;
      }
      cout << a << endl;`,
    java: r`
      long a = 0, b = 1;
      for (int i = 0; i < n; i++) {
          long next = a + b;
          a = b;
          b = next;
      }
      System.out.println(a);`
  },
  solution: {
    explanation: ['The pair `(a, b)` holds two consecutive Fibonacci numbers and is moved forward `n` times. `F(90)` is about 2.9 * 10^18, so 64-bit integers are enough.'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { let a = 0n, b = 1n; for (let i = 0; i < Number(input.trim()); i++) [a, b] = [b, a + b]; return String(a); },
  tests() {
    const g = rng(73);
    return ['10\n', '0\n', '1\n', '2\n', '3\n', '20\n', '50\n', '89\n', '90\n', ...many(4, () => `${randInt(g, 0, 90)}\n`)];
  }
};
