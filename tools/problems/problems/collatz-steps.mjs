import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

function steps(n) { let c = 0; while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; c++; } return c; }

export default {
  slug: 'collatz-steps',
  title: 'Collatz Steps',
  topic: 'basics',
  difficulty: 'medium',
  order: 72,
  tags: ['loops', 'simulation', 'overflow'],

  concept: {
    title: 'Simulating a process',
    body: [
      'Many programs just follow a rule until a goal is reached. The Collatz rule: if the number is even, halve it; if it is odd, multiply by 3 and add 1. Repeat until the number is 1. For 6: 6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1, which takes 8 steps.',
      'Nobody knows if every starting number reaches 1, but it has been checked for numbers beyond 10^20. For the numbers in this problem the path is always finite, and a `while n != 1` loop with a step counter is all you need.',
      'Do not forget the size of the values in between. The path of a small start can climb very high: starting from 837799 the numbers reach about 2.9 * 10^9, which no longer fits in a 32-bit integer, so use 64-bit variables.',
      'In the loop, `3 * n + 1` is for odd `n` only: use `if / else`, not two separate ifs. Otherwise a number that becomes even in the first `if` would be halved again in the same round.'
    ]
  },

  statement: ['Start with a positive integer `n`. While `n` is not 1: if `n` is even, replace it by `n / 2`, otherwise replace it by `3 * n + 1`. Print how many replacements were needed to reach 1.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The number of steps.'],
  constraints: ['1 <= n <= 10^6'],
  examples: [{ input: '6\n', note: '6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1: 8 steps.' }, { input: '1\n', note: 'Already 1: 0 steps.' }],
  hints: [
    'Use a `while n != 1` loop and a counter.',
    'Inside the loop use one `if / else`: even numbers are halved, odd numbers become `3 * n + 1`.',
    'Count one step for every replacement. Use 64-bit variables, because the value can get large on the way.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      steps = 0
      while n != 1:
          if n % 2 == 0:
              n = n // 2
          else:
              n = 3 * n + 1
          steps += 1
      print(steps)`,
    cpp: r`
      int steps = 0;
      while (n != 1) {
          if (n % 2 == 0) {
              n = n / 2;
          } else {
              n = 3 * n + 1;
          }
          steps++;
      }
      cout << steps << endl;`,
    java: r`
      int steps = 0;
      while (n != 1) {
          if (n % 2 == 0) {
              n = n / 2;
          } else {
              n = 3 * n + 1;
          }
          steps++;
      }
      System.out.println(steps);`
  },
  solution: {
    explanation: ['The loop applies the rule and counts the steps until the number is 1. The largest start (below 10^6) takes 524 steps and the values stay below 6 * 10^10, so 64-bit integers are enough.'],
    complexity: 'Time O(steps) (at most 524 here), space O(1).'
  },
  solve(input) { return String(steps(Number(input.trim()))); },
  tests() {
    const g = rng(72);
    return ['6\n', '1\n', '2\n', '3\n', '7\n', '27\n', '97\n', '871\n', '6171\n', '77031\n', '837799\n', '999999\n', '1000000\n', ...many(3, () => `${randInt(g, 1, 1e6)}\n`)];
  }
};
