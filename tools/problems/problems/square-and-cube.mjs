import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'square-and-cube',
  title: 'Square and Cube',
  topic: 'basics',
  difficulty: 'easy',
  order: 11,
  tags: ['arithmetic', 'variables'],

  concept: {
    title: 'Using a value more than once',
    body: [
      'The square of `n` is `n * n` and the cube is `n * n * n`. Languages have a power operator (`**` in Python), but C++ and Java do not have one for whole numbers, and their `pow` function works with decimals and can lose precision on big values. For small powers, plain multiplication is the safest tool.',
      'You can also build the cube from the square: `cube = square * n`. Storing a result in a variable with a good name makes the code easier to read and avoids repeating work.',
      'Check the biggest answer before you pick a type: for `n = 10^6` the cube is `10^18`. That fits in 64 bits, not in 32.'
    ]
  },

  statement: ['You are given an integer `n`. Print `n` squared on the first line and `n` cubed on the second line.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Two lines: `n * n` and `n * n * n`.'],
  constraints: ['-10^6 <= n <= 10^6'],
  examples: [{ input: '5\n', note: '25 and 125.' }, { input: '-3\n', note: 'The square is positive (9), the cube keeps the sign (-27).' }],
  hints: [
    'The square is `n * n`.',
    'The cube is the square times `n` again.',
    'Print two lines. For negative `n` the cube is negative; no special code is needed.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      square = n * n
      cube = square * n
      print(square)
      print(cube)`,
    cpp: r`
      long long square = n * n;
      long long cube = square * n;
      cout << square << endl;
      cout << cube << endl;`,
    java: r`
      long square = n * n;
      long cube = square * n;
      System.out.println(square);
      System.out.println(cube);`
  },
  solution: {
    explanation: ['Compute the square once and reuse it for the cube. The largest value is 10^18, which fits in a 64-bit integer.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const n = BigInt(input.trim()); return `${n * n}\n${n * n * n}`; },
  tests() {
    const g = rng(11);
    return ['0\n', '1\n', '-1\n', '5\n', '-3\n', '1000000\n', '-1000000\n', '46341\n', ...many(4, () => `${randInt(g, -1e6, 1e6)}\n`)];
  }
};
