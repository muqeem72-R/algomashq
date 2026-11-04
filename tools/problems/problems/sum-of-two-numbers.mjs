import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'sum-of-two-numbers',
  title: 'Sum of Two Numbers',
  topic: 'basics',
  difficulty: 'easy',
  order: 7,
  tags: ['input', 'arithmetic'],

  concept: {
    title: 'Two numbers on one line',
    body: [
      'When two numbers are written on the same line, you read them one after the other. Python reads the whole line as text and splits it at the spaces; C++ `cin` and Java `Scanner` skip the spaces by themselves.',
      { code: '# Python\na, b = map(int, input().split())\n\n// C++\nlong long a, b;\ncin >> a >> b;\n\n// Java\nlong a = sc.nextLong();\nlong b = sc.nextLong();' },
      'Why 64-bit integers? A 32-bit `int` stops at 2,147,483,647. Add two numbers near one billion and the result no longer fits: in C++ and Java it silently wraps around to a wrong (even negative) number. A 64-bit `long long` / `long` is safe for sums of numbers this size. Python integers never overflow.'
    ]
  },

  statement: ['You are given two integers `a` and `b`. Print their sum.'],
  inputFormat: ['One line with two integers `a` and `b`, separated by a space.'],
  outputFormat: ['Print `a + b`.'],
  constraints: ['-10^9 <= a, b <= 10^9'],
  examples: [
    { input: '3 4\n', note: '3 + 4 = 7.' },
    { input: '1000000000 1000000000\n', note: 'The sum is 2000000000, more than a 32-bit int can hold.' }
  ],
  hints: [
    'The starter code already reads both numbers into `a` and `b`.',
    'Print `a + b`.',
    'If your answer is wrong only for big numbers, check that your variables are 64-bit (`long long` in C++, `long` in Java).'
  ],
  program: {
    io: ['a:int b:int'],
    python: 'print(a + b)',
    cpp: r`cout << a + b << endl;`,
    java: 'System.out.println(a + b);'
  },
  solution: {
    explanation: ['Add the two variables and print the result. The only care needed is the type: with 64-bit variables the sum of two numbers up to 10^9 can never overflow.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(BigInt); return String(a + b); },
  tests() {
    const g = rng(7);
    return ['0 0\n', '1 2\n', '-5 5\n', '-3 -4\n', '1000000000 1000000000\n', '-1000000000 -1000000000\n', '999999999 1\n', ...many(6, () => `${randInt(g, -1e9, 1e9)} ${randInt(g, -1e9, 1e9)}\n`)];
  }
};
