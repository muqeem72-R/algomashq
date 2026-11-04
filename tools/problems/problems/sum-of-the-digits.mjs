import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'sum-of-the-digits',
  title: 'Sum of the Digits',
  topic: 'basics',
  difficulty: 'easy',
  order: 40,
  tags: ['loops', 'while', 'digits'],

  concept: {
    title: 'Peeling a number digit by digit',
    body: [
      'You already know the two moves: `n % 10` reads the last digit and `n / 10` removes it. Put them in a while loop and every digit of the number passes by, from right to left.',
      { code: 'while n > 0:\n    digit = n % 10     # look at the last digit\n    ...                # do something with it\n    n = n // 10        # remove it' },
      'What you do with each digit is the point of the exercise: add it to a total (this problem), count it, compare it with others, or build a new number from it (the next problem).',
      'Here the accumulator is the sum of the digits, starting at 0. The case `n = 0` needs no special treatment: the loop does not run and the sum stays 0, which is the right answer.'
    ]
  },

  statement: ['Given a non-negative integer `n`, print the sum of its digits.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The sum of the digits.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '40759\n', note: '4 + 0 + 7 + 5 + 9 = 25.' }, { input: '0\n', note: 'No digit adds anything: 0.' }],
  hints: [
    'Read the last digit with `n % 10` and add it to a total.',
    'Then remove the last digit with `n / 10` and repeat while `n` is greater than 0.',
    'The total starts at 0, which also gives the right answer for `n = 0`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      total = 0
      while n > 0:
          total += n % 10
          n = n // 10
      print(total)`,
    cpp: r`
      long long total = 0;
      while (n > 0) {
          total += n % 10;
          n = n / 10;
      }
      cout << total << endl;`,
    java: r`
      long total = 0;
      while (n > 0) {
          total += n % 10;
          n = n / 10;
      }
      System.out.println(total);`
  },
  solution: {
    explanation: ['Each round adds the last digit to the total and removes it. When no digits are left the loop ends and the total is printed.'],
    complexity: 'Time O(d) where d is the number of digits (at most 19), space O(1).'
  },
  solve(input) { return String([...input.trim()].reduce((s, c) => s + Number(c), 0)); },
  tests() {
    const g = rng(40);
    return ['40759\n', '0\n', '9\n', '10\n', '999\n', '100000\n', '999999999999999999\n', '1000000000000000000\n', ...many(5, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
