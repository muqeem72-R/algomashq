import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'reverse-a-number',
  title: 'Reverse a Number',
  topic: 'basics',
  difficulty: 'easy',
  order: 41,
  tags: ['loops', 'while', 'digits'],

  concept: {
    title: 'Building a number digit by digit',
    body: [
      'To append a digit `d` to the right end of a number `rev` you multiply `rev` by 10 and add `d`: `rev = rev * 10 + d`. For example appending 7 to 45 gives `45 * 10 + 7 = 457`.',
      'A number can be taken apart from the right (with `% 10` and `/ 10`) and rebuilt by appending the digits in the order they come out. Since the last digit of the original comes out first, it ends up first in the new number, and the whole number is reversed.',
      { code: 'rev = 0\nwhile n > 0:\n    rev = rev * 10 + n % 10\n    n = n // 10' },
      'Leading zeros do not exist in numbers, so reversing 1200 gives 21 (the digits 0021 are just 21).'
    ]
  },

  statement: ['Given a non-negative integer `n`, print the number you get by reversing its digits. Zeros at the end of `n` disappear, because a number has no leading zeros.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The reversed number.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '40759\n', note: 'The reverse is 95704.' }, { input: '1200\n', note: 'The digits reversed are 0021, which is the number 21.' }],
  hints: [
    'You need a variable `rev` that starts at 0 and collects the new number.',
    'In each round move the last digit of `n` to the right end of `rev`: `rev = rev * 10 + n % 10`.',
    'Then remove the last digit from `n`. Repeat while `n` is positive.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      rev = 0
      while n > 0:
          rev = rev * 10 + n % 10
          n = n // 10
      print(rev)`,
    cpp: r`
      long long rev = 0;
      while (n > 0) {
          rev = rev * 10 + n % 10;
          n = n / 10;
      }
      cout << rev << endl;`,
    java: r`
      long rev = 0;
      while (n > 0) {
          rev = rev * 10 + n % 10;
          n = n / 10;
      }
      System.out.println(rev);`
  },
  solution: {
    explanation: ['Each round takes the last digit of `n` and appends it to `rev`. The digit that was last in `n` becomes the first digit of `rev`, so at the end `rev` is the reversed number. The result never exceeds 10^18, so 64 bits are enough.'],
    complexity: 'Time O(d) where d is the number of digits, space O(1).'
  },
  solve(input) { return String(BigInt([...input.trim()].reverse().join(''))); },
  tests() {
    const g = rng(41);
    return ['40759\n', '1200\n', '0\n', '5\n', '10\n', '100\n', '121\n', '999999999999999999\n', '1000000000000000000\n', '123456789012345678\n', ...many(5, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
