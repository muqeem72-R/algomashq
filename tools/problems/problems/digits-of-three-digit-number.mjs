import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'digits-of-three-digit-number',
  title: 'Digits of a Three-Digit Number',
  topic: 'basics',
  difficulty: 'easy',
  order: 18,
  tags: ['arithmetic', 'digits'],

  concept: {
    title: 'Taking a number apart',
    body: [
      'With `% 10` you get the last digit and with `/ 10` you remove it. Doing this twice reaches the middle digit, and the first digit is what remains.',
      'For `n = 472`: the last digit is `472 % 10 = 2`. Removing it gives `472 / 10 = 47`, whose last digit is `47 % 10 = 7`. Removing again gives `47 / 10 = 4`, which is the first digit.',
      'A shortcut for the first digit of a three-digit number is `n / 100`. Writing the steps out slowly first makes the shortcut easy to trust.'
    ]
  },

  statement: ['You are given a three-digit number. Print its digits from left to right, separated by spaces.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Three digits separated by spaces.'],
  constraints: ['100 <= n <= 999'],
  examples: [{ input: '472\n', note: 'The digits are 4, 7 and 2.' }, { input: '305\n', note: 'A digit can be 0: 3 0 5.' }],
  hints: [
    'The last digit is `n % 10`.',
    'Remove the last digit with `n / 10` (in Python `n // 10`) and repeat to get the middle digit.',
    'Print the first digit, the middle digit and the last digit, in this order, separated by spaces.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      last = n % 10
      n = n // 10
      middle = n % 10
      first = n // 10
      print(first, middle, last)`,
    cpp: r`
      long long last = n % 10;
      n = n / 10;
      long long middle = n % 10;
      long long first = n / 10;
      cout << first << " " << middle << " " << last << endl;`,
    java: r`
      long last = n % 10;
      n = n / 10;
      long middle = n % 10;
      long first = n / 10;
      System.out.println(first + " " + middle + " " + last);`
  },
  solution: {
    explanation: ['Take the last digit, remove it, take the new last digit (the middle one), remove it again; what is left is the first digit. Print them in left-to-right order.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return input.trim().split('').join(' '); },
  tests() {
    const g = rng(18);
    return ['472\n', '305\n', '100\n', '999\n', '110\n', '909\n', '500\n', ...many(6, () => `${randInt(g, 100, 999)}\n`)];
  }
};
