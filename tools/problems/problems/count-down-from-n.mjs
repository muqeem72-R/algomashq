import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'count-down-from-n',
  title: 'Countdown',
  topic: 'basics',
  difficulty: 'easy',
  order: 34,
  tags: ['loops', 'for'],

  concept: {
    title: 'Counting backwards',
    body: [
      'A loop does not have to count up. To count down, start at the high value, keep going while the counter is above the low value, and step by `-1`.',
      { code: '# Python: range(start, stop, step); here from n down to 1\nfor i in range(n, 0, -1):\n    print(i)\n\n// C++ and Java\nfor (int i = n; i >= 1; i--) {\n    ...\n}' },
      'Here `i--` means `i = i - 1`. In Python the third number of `range` is the step and the end value (0 here) is not included.',
      'Code after the loop runs once, when the loop is finished. That is the place for a final message.'
    ]
  },

  statement: ['Given a positive integer `n`, print the numbers from `n` down to 1, each on its own line. After that print `Liftoff!` on a last line.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`n` lines with the numbers `n`, `n - 1`, ..., 1, then the line `Liftoff!`.'],
  constraints: ['1 <= n <= 1000'],
  examples: [{ input: '3\n', note: 'Prints 3, 2, 1 and then Liftoff!.' }],
  hints: [
    'Start the counter at `n` and move it down by one in every round.',
    'The loop must stop after printing 1. In Python the end of `range` is 0 (not included); in C++ and Java the condition is `i >= 1`.',
    'Print `Liftoff!` after the loop, not inside it.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      for i in range(n, 0, -1):
          print(i)
      print("Liftoff!")`,
    cpp: r`
      for (int i = n; i >= 1; i--) {
          cout << i << endl;
      }
      cout << "Liftoff!" << endl;`,
    java: r`
      for (int i = (int) n; i >= 1; i--) {
          System.out.println(i);
      }
      System.out.println("Liftoff!");`
  },
  solution: {
    explanation: ['The counter starts at `n` and decreases until it passes 1. The final message is printed once, after the loop.'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { const n = Number(input.trim()); return [...Array.from({ length: n }, (_, i) => n - i), 'Liftoff!'].join('\n'); },
  tests() {
    const g = rng(34);
    return ['3\n', '1\n', '2\n', '10\n', '100\n', '1000\n', ...many(4, () => `${randInt(g, 1, 1000)}\n`)];
  }
};
