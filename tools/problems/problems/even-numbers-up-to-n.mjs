import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'even-numbers-up-to-n',
  title: 'Even Numbers',
  topic: 'basics',
  difficulty: 'easy',
  order: 36,
  tags: ['loops', 'conditions'],

  concept: {
    title: 'Loops with a step, or loops with a condition',
    body: [
      'There are two ways to visit only some of the numbers. You can change the **step** of the loop: start at 2 and add 2 each time. Or you can visit every number and use an `if` inside the loop to pick the ones you want.',
      { code: '# step of 2\nfor i in range(2, n + 1, 2):\n    print(i)\n\n# every number, with a condition\nfor i in range(1, n + 1):\n    if i % 2 == 0:\n        print(i)\n\n// C++ and Java: the step is the last part of the for\nfor (int i = 2; i <= n; i += 2) { ... }' },
      'Both are correct. The first does half as many rounds. The second is more flexible, because the condition can be anything: "multiples of 7", "numbers that end in 3", and so on.'
    ]
  },

  statement: ['Given an integer `n`, print all even numbers from 2 to `n` (inclusive), each on its own line.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The even numbers in increasing order, one per line.'],
  constraints: ['2 <= n <= 1000'],
  examples: [{ input: '7\n', note: 'Prints 2, 4 and 6.' }, { input: '8\n', note: 'Prints 2, 4, 6 and 8: n itself is included when it is even.' }],
  hints: [
    'The first even number is 2.',
    'Either step by 2 starting from 2, or loop over everything and test `i % 2 == 0`.',
    'Make sure `n` itself is printed when it is even.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      for i in range(2, n + 1, 2):
          print(i)`,
    cpp: r`
      for (int i = 2; i <= n; i += 2) {
          cout << i << endl;
      }`,
    java: r`
      for (int i = 2; i <= n; i += 2) {
          System.out.println(i);
      }`
  },
  solution: {
    explanation: ['Starting at 2 and adding 2 in each round visits exactly the even numbers up to `n`.'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { const n = Number(input.trim()); const out = []; for (let i = 2; i <= n; i += 2) out.push(i); return out.join('\n'); },
  tests() {
    const g = rng(36);
    return ['7\n', '8\n', '2\n', '3\n', '4\n', '999\n', '1000\n', ...many(4, () => `${randInt(g, 2, 1000)}\n`)];
  }
};
