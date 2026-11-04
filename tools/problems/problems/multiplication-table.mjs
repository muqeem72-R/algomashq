import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'multiplication-table',
  title: 'Multiplication Table',
  topic: 'basics',
  difficulty: 'easy',
  order: 37,
  tags: ['loops', 'output'],

  concept: {
    title: 'Formatted lines inside a loop',
    body: [
      'A loop body can print a line that is built from several pieces: numbers and fixed text mixed together. The pieces that change (here the counter and the product) are variables, the rest is text in quotes.',
      { code: '# Python: print() puts a space between the pieces\nprint(n, "x", i, "=", n * i)\n\n// C++\ncout << n << " x " << i << " = " << n * i << endl;\n\n// Java\nSystem.out.println(n + " x " + i + " = " + n * i);' },
      'Watch the exact text: the letter `x` (not the multiplication sign), spaces around it and around `=`. The judge splits the output into words, so each piece must be separated by a space.'
    ]
  },

  statement: ['Given an integer `n`, print its multiplication table from 1 to 10. Each line has the form `n x i = result`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Ten lines, for `i` = 1, 2, ..., 10.'],
  constraints: ['1 <= n <= 10^6'],
  examples: [{ input: '7\n', note: 'The first line is `7 x 1 = 7`, the last is `7 x 10 = 70`.' }],
  hints: [
    'Loop `i` from 1 to 10 (inclusive).',
    'In each round print `n`, the letter x, `i`, an equals sign and the product `n * i`.',
    'Put a space between all the pieces, for example `7 x 3 = 21`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      for i in range(1, 11):
          print(n, "x", i, "=", n * i)`,
    cpp: r`
      for (int i = 1; i <= 10; i++) {
          cout << n << " x " << i << " = " << n * i << endl;
      }`,
    java: r`
      for (int i = 1; i <= 10; i++) {
          System.out.println(n + " x " + i + " = " + n * i);
      }`
  },
  solution: {
    explanation: ['The loop runs ten times; each round prints one line of the table using the current value of `i`.'],
    complexity: 'Time O(1) (always ten lines), space O(1).'
  },
  solve(input) { const n = Number(input.trim()); return Array.from({ length: 10 }, (_, k) => `${n} x ${k + 1} = ${n * (k + 1)}`).join('\n'); },
  tests() {
    const g = rng(37);
    return ['7\n', '1\n', '2\n', '10\n', '12\n', '1000000\n', '999983\n', ...many(4, () => `${randInt(g, 1, 1e6)}\n`)];
  }
};
