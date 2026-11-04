import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'star-triangle',
  title: 'Triangle of Any Size',
  topic: 'basics',
  difficulty: 'medium',
  order: 54,
  tags: ['loops', 'nested-loops', 'patterns'],

  concept: {
    title: 'Loops inside loops',
    body: [
      'You printed a four-row triangle by hand in an early problem. A loop can print any size. A pattern has **rows**, and every row has **columns**: that calls for one loop inside another. The outer loop walks over the rows; for each row the inner loop prints the characters of that row; after the inner loop, a new line starts.',
      { code: '# Python (end="" keeps the cursor on the same line)\nfor row in range(1, n + 1):\n    for col in range(row):\n        print("*", end="")\n    print()\n\n// C++\nfor (int row = 1; row <= n; row++) {\n    for (int col = 0; col < row; col++) cout << "*";\n    cout << endl;\n}' },
      'The key question for every pattern: how many characters does row number `r` have? Here exactly `r`. Work it out on paper for the first three rows before you write the loops.',
      'The total work is 1 + 2 + ... + n, about n^2 / 2 steps. Nested loops multiply their counts.'
    ]
  },

  statement: ['Given `n`, print a triangle of stars with `n` rows. Row number `i` (starting from 1) has `i` stars.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`n` rows of stars, without spaces inside a row.'],
  constraints: ['1 <= n <= 50'],
  examples: [{ input: '3\n', note: 'The rows are `*`, `**` and `***`.' }],
  hints: [
    'Use an outer loop for the rows, from 1 to `n`.',
    'Row `i` needs an inner loop that prints one star `i` times, without a new line.',
    'After the inner loop, print an empty line break to start the next row.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      for row in range(1, n + 1):
          for col in range(row):
              print("*", end="")
          print()`,
    cpp: r`
      for (int row = 1; row <= n; row++) {
          for (int col = 0; col < row; col++) {
              cout << "*";
          }
          cout << endl;
      }`,
    java: r`
      for (int row = 1; row <= n; row++) {
          for (int col = 0; col < row; col++) {
              System.out.print("*");
          }
          System.out.println();
      }`
  },
  solution: {
    explanation: ['The outer loop numbers the rows and the inner loop prints as many stars as the row number. The line break after the inner loop ends the row.'],
    complexity: 'Time O(n^2), space O(1).'
  },
  solve(input) { const n = Number(input.trim()); return Array.from({ length: n }, (_, i) => '*'.repeat(i + 1)).join('\n'); },
  tests() {
    const g = rng(54);
    return ['3\n', '1\n', '2\n', '4\n', '5\n', '10\n', '50\n', ...many(4, () => `${randInt(g, 1, 50)}\n`)];
  }
};
