import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'largest-of-three',
  title: 'Largest of Three Numbers',
  topic: 'basics',
  difficulty: 'easy',
  order: 22,
  tags: ['conditions', 'comparison'],

  concept: {
    title: 'Keep the best so far',
    body: [
      'With two numbers one comparison is enough. With three you could write a long condition for every case, but there is a cleaner idea: keep a variable `largest` that holds the best value seen so far, and compare each new number against it.',
      { code: 'largest = a\nif b > largest:\n    largest = b\nif c > largest:\n    largest = c' },
      'Each `if` is independent (no `else`), because every new number must be checked. This "best so far" pattern does not change when the list grows from three numbers to a million, which is why it is worth learning now.'
    ]
  },

  statement: ['Given three integers, print the largest of them.'],
  inputFormat: ['One line with three integers `a`, `b` and `c`.'],
  outputFormat: ['The largest of the three numbers.'],
  constraints: ['-10^9 <= a, b, c <= 10^9'],
  examples: [{ input: '3 9 4\n', note: '9 is the largest.' }, { input: '-1 -5 -3\n', note: 'All negative: -1 is the largest.' }],
  hints: [
    'Start by assuming that `a` is the largest.',
    'If `b` is larger than the current best, update the best. Do the same for `c`.',
    'Use two separate `if` statements, not `else if`: both new numbers must be checked.'
  ],
  program: {
    io: ['a:int b:int c:int'],
    python: r`
      largest = a
      if b > largest:
          largest = b
      if c > largest:
          largest = c
      print(largest)`,
    cpp: r`
      long long largest = a;
      if (b > largest) {
          largest = b;
      }
      if (c > largest) {
          largest = c;
      }
      cout << largest << endl;`,
    java: r`
      long largest = a;
      if (b > largest) {
          largest = b;
      }
      if (c > largest) {
          largest = c;
      }
      System.out.println(largest);`
  },
  solution: {
    explanation: ['`largest` starts as `a`. Each of the other numbers replaces it when it is bigger. After both checks `largest` is the maximum.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return String(Math.max(...input.trim().split(/\s+/).map(Number))); },
  tests() {
    const g = rng(22);
    return ['3 9 4\n', '-1 -5 -3\n', '5 5 5\n', '9 3 4\n', '4 3 9\n', '0 0 -1\n', '1000000000 -1000000000 0\n', ...many(5, () => `${randInt(g, -1e9, 1e9)} ${randInt(g, -1e9, 1e9)} ${randInt(g, -1e9, 1e9)}\n`)];
  }
};
