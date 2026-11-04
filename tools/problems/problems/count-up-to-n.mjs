import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'count-up-to-n',
  title: 'Count Up to N',
  topic: 'basics',
  difficulty: 'easy',
  order: 33,
  tags: ['loops', 'for'],

  concept: {
    title: 'Repeating work with a for loop',
    body: [
      'A **loop** repeats a block of code. The `for` loop is the one to use when you know how many times: it has a counter variable that starts at some value, a condition that says when to stop, and a step that moves the counter forward.',
      { code: '# Python: range(1, n + 1) gives 1, 2, ..., n (the end is not included)\nfor i in range(1, n + 1):\n    print(i)\n\n// C++\nfor (int i = 1; i <= n; i++) {\n    cout << i << endl;\n}\n\n// Java\nfor (int i = 1; i <= n; i++) {\n    System.out.println(i);\n}' },
      'In C++ and Java the three parts in the parentheses are: the start (`int i = 1`), the condition to keep going (`i <= n`) and the step after each round (`i++`, which means `i = i + 1`). Python\'s `range(a, b)` runs from `a` up to, but not including, `b`, which is why we write `n + 1`.',
      'The most common loop mistake is being off by one: stopping at `n - 1` or running to `n + 1`. Check the first and the last value by hand.'
    ]
  },

  statement: ['Given a positive integer `n`, print the numbers from 1 to `n`, each on its own line.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`n` lines: 1, 2, ..., n.'],
  constraints: ['1 <= n <= 1000'],
  examples: [{ input: '3\n', note: 'Prints 1, 2 and 3.' }, { input: '1\n', note: 'A single line: 1.' }],
  hints: [
    'A `for` loop with a counter `i` that starts at 1 will do.',
    'Print `i` inside the loop body.',
    'The loop must include `n` itself: in Python the end of `range` is `n + 1`, in C++ and Java the condition is `i <= n`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      for i in range(1, n + 1):
          print(i)`,
    cpp: r`
      for (int i = 1; i <= n; i++) {
          cout << i << endl;
      }`,
    java: r`
      for (int i = 1; i <= n; i++) {
          System.out.println(i);
      }`
  },
  solution: {
    explanation: ['The counter `i` starts at 1 and is printed in every round until it passes `n`.'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { const n = Number(input.trim()); return Array.from({ length: n }, (_, i) => i + 1).join('\n'); },
  tests() {
    const g = rng(33);
    return ['3\n', '1\n', '2\n', '10\n', '100\n', '1000\n', ...many(4, () => `${randInt(g, 1, 1000)}\n`)];
  }
};
