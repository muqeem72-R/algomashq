import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'count-the-digits',
  title: 'Count the Digits',
  topic: 'basics',
  difficulty: 'easy',
  order: 39,
  tags: ['loops', 'while', 'digits'],

  concept: {
    title: 'The while loop',
    body: [
      'A `for` loop is best when you know the number of rounds in advance. When you do not, use a **while loop**: it repeats as long as its condition is true. The condition is checked before every round, including the first.',
      { code: '# Python\nwhile n > 0:\n    n = n // 10\n\n// C++ and Java\nwhile (n > 0) {\n    n = n / 10;\n}' },
      'Something inside the loop must change the condition, otherwise the loop never ends. Here every round cuts the last digit off (`n / 10`), so `n` gets smaller until it reaches 0.',
      'Counting the digits means counting how many times you can cut one off. One special case: the number 0 has one digit, but the loop would not run at all for it, so handle it separately.'
    ]
  },

  statement: ['Given a non-negative integer `n`, print how many digits it has. The number 0 has one digit.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The number of digits.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '40759\n', note: 'Five digits.' }, { input: '0\n', note: 'Zero counts as one digit.' }],
  hints: [
    'Count how many times you can remove the last digit with `n / 10` until nothing is left.',
    'Use a `while n > 0` loop with a counter that goes up by one in every round.',
    'The loop does not run for `n = 0`, so print 1 for that case on its own.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      if n == 0:
          print(1)
      else:
          count = 0
          while n > 0:
              n = n // 10
              count += 1
          print(count)`,
    cpp: r`
      if (n == 0) {
          cout << 1 << endl;
      } else {
          int count = 0;
          while (n > 0) {
              n = n / 10;
              count++;
          }
          cout << count << endl;
      }`,
    java: r`
      if (n == 0) {
          System.out.println(1);
      } else {
          int count = 0;
          while (n > 0) {
              n = n / 10;
              count++;
          }
          System.out.println(count);
      }`
  },
  solution: {
    explanation: ['Every round of the loop removes the last digit and adds one to the counter. When the number reaches 0 the counter holds the number of digits. Zero is answered directly.'],
    complexity: 'Time O(d) where d is the number of digits (at most 19), space O(1).'
  },
  solve(input) { return String(input.trim().length); },
  tests() {
    const g = rng(39);
    return ['40759\n', '0\n', '7\n', '10\n', '99\n', '100\n', '999999999999999999\n', '1000000000000000000\n', '123456789\n', ...many(5, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
