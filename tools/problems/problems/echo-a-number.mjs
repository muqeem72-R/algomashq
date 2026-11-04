import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'echo-a-number',
  title: 'Echo a Number',
  topic: 'basics',
  difficulty: 'easy',
  order: 5,
  tags: ['input', 'syntax'],

  concept: {
    title: 'Reading input',
    body: [
      'Until now the programs had no input. Most problems give you data: the judge types it into your program, and your program must read it. You store what you read in a **variable**, a named box that holds a value.',
      { code: '# Python: input() returns text, int() turns it into a number\nn = int(input())\nprint(n)\n\n// C++\nlong long n;\ncin >> n;\ncout << n << endl;\n\n// Java\nScanner sc = new Scanner(System.in);\nlong n = sc.nextLong();\nSystem.out.println(n);' },
      'The type of a variable decides which numbers fit. A 32-bit `int` holds up to about 2 billion. This course uses 64-bit integers (`long long` in C++, `long` in Java; Python has no limit), which hold up to about 9 * 10^18. The starter code already uses them.'
    ]
  },

  statement: ['You are given one integer. Read it and print it back.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `n`.'],
  constraints: ['-10^18 <= n <= 10^18'],
  examples: [{ input: '42\n', note: 'The program prints what it read.' }, { input: '-7\n', note: 'Negative numbers work the same way.' }],
  hints: [
    'The starter code already reads the number into the variable `n`.',
    'Now print the variable, without quotes. With quotes you would print the letter n.',
    'Nothing else is needed: no calculation, just read and print.'
  ],
  program: {
    io: ['n:int'],
    python: 'print(n)',
    cpp: r`cout << n << endl;`,
    java: 'System.out.println(n);'
  },
  solution: {
    explanation: ['The variable `n` holds the number that was read. Printing the variable (not the text "n") shows its value.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return input.trim(); },
  tests() {
    const g = rng(5);
    return ['0\n', '1\n', '-1\n', '42\n', '1000000000000000000\n', '-1000000000000000000\n', '2147483648\n', ...many(5, () => `${randInt(g, -1e9, 1e9)}\n`)];
  }
};
