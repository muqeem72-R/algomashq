import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'basic-operations',
  title: 'Sum, Difference and Product',
  topic: 'basics',
  difficulty: 'easy',
  order: 8,
  tags: ['arithmetic', 'output'],

  concept: {
    title: 'Several results from the same input',
    body: [
      'You may print as many lines as the problem asks for: one print command per line. The values you read stay in their variables, so you can use them again and again.',
      'Watch the size of results. The product of two numbers up to 10^9 can reach 10^18. That still fits in a 64-bit integer (limit about 9.2 * 10^18), but it would overflow a 32-bit `int`. When you are not sure, work out the largest possible result from the limits in the statement before choosing a type.'
    ]
  },

  statement: ['You are given two integers `a` and `b`. Print `a + b`, `a - b` and `a * b`, each on its own line.'],
  inputFormat: ['One line with two integers `a` and `b`.'],
  outputFormat: ['Three lines: the sum, the difference `a - b`, and the product.'],
  constraints: ['-10^9 <= a, b <= 10^9'],
  examples: [{ input: '7 3\n', note: '7 + 3 = 10, 7 - 3 = 4 and 7 * 3 = 21.' }, { input: '-4 5\n', note: 'Negative numbers are fine: 1, then -9, then -20.' }],
  hints: [
    'You need three print commands, one for each result.',
    'The order of the lines is: sum, difference, product. The difference is `a - b`, not `b - a`.',
    'The largest product is 10^18, so use 64-bit variables (the starter already does).'
  ],
  program: {
    io: ['a:int b:int'],
    python: r`
      print(a + b)
      print(a - b)
      print(a * b)`,
    cpp: r`
      cout << a + b << endl;
      cout << a - b << endl;
      cout << a * b << endl;`,
    java: r`
      System.out.println(a + b);
      System.out.println(a - b);
      System.out.println(a * b);`
  },
  solution: {
    explanation: ['Three expressions, three prints. With 64-bit variables nothing overflows: the product of two numbers of size 10^9 is at most 10^18.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(BigInt); return `${a + b}\n${a - b}\n${a * b}`; },
  tests() {
    const g = rng(8);
    return ['0 0\n', '1 1\n', '-1 1\n', '1000000000 1000000000\n', '-1000000000 1000000000\n', '-1000000000 -1000000000\n', '5 0\n', ...many(5, () => `${randInt(g, -1e9, 1e9)} ${randInt(g, -1e9, 1e9)}\n`)];
  }
};
