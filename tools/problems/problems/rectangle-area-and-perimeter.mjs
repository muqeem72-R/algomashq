import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'rectangle-area-and-perimeter',
  title: 'Rectangle Area and Perimeter',
  topic: 'basics',
  difficulty: 'easy',
  order: 12,
  tags: ['arithmetic', 'formulas'],

  concept: {
    title: 'From a formula to code',
    body: [
      'Turning a formula into code is mostly translation. The area of a rectangle is `width * height`, the perimeter is `2 * (width + height)`. Parentheses decide the order, so `2 * (w + h)` and `2 * w + h` are very different.',
      'Give intermediate results their own variables (`area`, `perimeter`). The program then reads like the formulas and you can print the values in any order.',
      'The largest area here is 10^9 * 10^9 = 10^18, which fits in a 64-bit integer but not in a 32-bit one.'
    ]
  },

  statement: ['A rectangle has width `w` and height `h`. Print its area and its perimeter on one line, separated by a space.'],
  inputFormat: ['One line with two integers `w` and `h`.'],
  outputFormat: ['Print `area perimeter`.'],
  constraints: ['1 <= w, h <= 10^9'],
  examples: [{ input: '3 4\n', note: 'Area 3 * 4 = 12, perimeter 2 * (3 + 4) = 14.' }, { input: '1 1\n', note: 'A unit square: area 1, perimeter 4.' }],
  hints: [
    'Area = width times height.',
    'Perimeter = 2 times (width plus height). Do not forget the parentheses.',
    'Print both values on one line, area first.'
  ],
  program: {
    io: ['w:int h:int'],
    python: r`
      area = w * h
      perimeter = 2 * (w + h)
      print(area, perimeter)`,
    cpp: r`
      long long area = w * h;
      long long perimeter = 2 * (w + h);
      cout << area << " " << perimeter << endl;`,
    java: r`
      long area = w * h;
      long perimeter = 2 * (w + h);
      System.out.println(area + " " + perimeter);`
  },
  solution: {
    explanation: ['Two formulas stored in variables and printed together. The area can be as large as 10^18, so 64-bit variables are needed.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [w, h] = input.trim().split(/\s+/).map(BigInt); return `${w * h} ${2n * (w + h)}`; },
  tests() {
    const g = rng(12);
    return ['3 4\n', '1 1\n', '1 1000000000\n', '1000000000 1\n', '1000000000 1000000000\n', '7 7\n', '65536 65536\n', ...many(5, () => `${randInt(g, 1, 1e9)} ${randInt(g, 1, 1e9)}\n`)];
  }
};
