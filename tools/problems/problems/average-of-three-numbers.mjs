import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'average-of-three-numbers',
  title: 'Average of Three Numbers',
  topic: 'basics',
  difficulty: 'easy',
  order: 13,
  tags: ['decimals', 'formatting'],

  concept: {
    title: 'Decimal numbers and formatted output',
    body: [
      "Whole numbers cannot hold a fraction. The average of 1, 2 and 2 is 1.666..., so you need a decimal type: `float` in Python, `double` in C++ and Java. The division must also be a decimal division. In C++ and Java `5 / 3` is `1`, but `5 / 3.0` is `1.666...` because one side is decimal. Python's `/` is always decimal.",
      'The judge compares text, so you must print exactly the number of digits asked for. Each language has a way to fix the number of decimals:',
      { code: '# Python\nprint(f"{x:.2f}")\n\n// C++ (add #include <iomanip>)\ncout << fixed << setprecision(2) << x << endl;\n\n// Java\nSystem.out.printf("%.2f%n", x);' },
      'Formatting rounds to the nearest value, so 1.666... becomes 1.67.'
    ]
  },

  statement: ['You are given three integers. Print their average with exactly two digits after the decimal point.'],
  inputFormat: ['One line with three integers `a`, `b` and `c`.'],
  outputFormat: ['The average `(a + b + c) / 3` with two decimals.'],
  constraints: ['-1000 <= a, b, c <= 1000'],
  examples: [{ input: '1 2 2\n', note: '(1 + 2 + 2) / 3 = 1.666..., printed as 1.67.' }, { input: '3 3 3\n', note: 'The average is exactly 3, printed as 3.00.' }],
  hints: [
    'First add the three numbers, then divide by 3. Make sure the division is a decimal division.',
    'In C++ and Java divide by `3.0`, not by `3`. In Python the normal `/` is enough.',
    'Print with two decimals, using the formatting from the Concept tab.'
  ],
  program: {
    io: ['a:int b:int c:int'],
    includes: ['<iomanip>'],
    python: r`
      average = (a + b + c) / 3
      print(f"{average:.2f}")`,
    cpp: r`
      double average = (a + b + c) / 3.0;
      cout << fixed << setprecision(2) << average << endl;`,
    java: r`
      double average = (a + b + c) / 3.0;
      System.out.printf("%.2f%n", average);`
  },
  solution: {
    explanation: ['The sum is divided by `3.0` so that the division keeps its fraction, and the result is printed with two decimals. An average of three whole numbers always ends in .00, .33 or .67, so the rounding never lands on a tie.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [a, b, c] = input.trim().split(/\s+/).map(Number); return ((a + b + c) / 3).toFixed(2); },
  tests() {
    const g = rng(13);
    return ['1 2 2\n', '3 3 3\n', '0 0 0\n', '-1 0 0\n', '-1000 -1000 -1000\n', '1000 1000 999\n', '1 1 0\n', '-5 2 -9\n', ...many(5, () => `${randInt(g, -1000, 1000)} ${randInt(g, -1000, 1000)} ${randInt(g, -1000, 1000)}\n`)];
  }
};
