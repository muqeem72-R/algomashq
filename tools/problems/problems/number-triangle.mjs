import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'number-triangle',
  title: 'Number Triangle',
  topic: 'basics',
  difficulty: 'medium',
  order: 56,
  tags: ['loops', 'nested-loops', 'patterns'],

  concept: {
    title: 'The inner loop uses the outer counter',
    body: [
      'In a number pattern the characters are not all the same, so the inner loop prints its **own counter**. For the row with `i` numbers the inner counter runs from 1 to `i`, and it is the counter that you print.',
      { code: '1\n12\n123\n1234' },
      'Two loop variables are involved: `row` (which row we are in) and `col` (which column inside the row). The value printed is `col`; the number of repetitions is controlled by `row`. Naming them clearly avoids mixing them up.',
      'Print the digits of a row next to each other, without separators: the judge reads each row as one word.'
    ]
  },

  statement: ['Given `n`, print `n` rows. Row `i` contains the digits `1, 2, ..., i` written next to each other.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`n` rows, for example `1`, `12`, `123` for `n = 3`.'],
  constraints: ['1 <= n <= 9'],
  examples: [{ input: '4\n', note: 'The rows are 1, 12, 123 and 1234.' }],
  hints: [
    'Use two nested loops, like in the star triangle.',
    'The inner loop counts from 1 to the current row number.',
    'Print the inner counter itself, not a star, and no spaces.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      for row in range(1, n + 1):
          for col in range(1, row + 1):
              print(col, end="")
          print()`,
    cpp: r`
      for (int row = 1; row <= n; row++) {
          for (int col = 1; col <= row; col++) {
              cout << col;
          }
          cout << endl;
      }`,
    java: r`
      for (int row = 1; row <= n; row++) {
          for (int col = 1; col <= row; col++) {
              System.out.print(col);
          }
          System.out.println();
      }`
  },
  solution: {
    explanation: ['The outer loop picks the row; the inner loop prints the numbers 1 to `row` next to each other; a line break ends the row.'],
    complexity: 'Time O(n^2), space O(1).'
  },
  solve(input) { const n = Number(input.trim()); return Array.from({ length: n }, (_, i) => Array.from({ length: i + 1 }, (_, c) => c + 1).join('')).join('\n'); },
  tests() {
    const g = rng(56);
    return ['4\n', '1\n', '2\n', '3\n', '5\n', '9\n', ...many(4, () => `${randInt(g, 1, 9)}\n`)];
  }
};
