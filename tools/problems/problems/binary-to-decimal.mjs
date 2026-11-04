import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const bits = (g, len) => '1' + Array.from({ length: len - 1 }, () => randInt(g, 0, 1)).join('');

export default {
  slug: 'binary-to-decimal',
  title: 'Binary to Decimal',
  topic: 'basics',
  difficulty: 'medium',
  order: 70,
  tags: ['number-systems', 'strings', 'loops'],

  concept: {
    title: 'Reading a number left to right',
    body: [
      'Read a binary number from the left. Every time you step one digit to the right, everything you have read so far becomes worth twice as much, and the new digit is added at the end. This is the exact mirror image of what happens in decimal, where each step to the right multiplies by 10.',
      { code: 'value = 0\nfor ch in s:\n    value = value * 2 + int(ch)' },
      'Try `1101`: start 0 -> `0*2+1 = 1` -> `1*2+1 = 3` -> `3*2+0 = 6` -> `6*2+1 = 13`. No powers of two are needed, and the method (called Horner\'s method) works for any base.',
      'In C++ and Java a digit character `\'7\'` is turned into the number 7 by subtracting `\'0\'`: `ch - \'0\'`.'
    ]
  },

  statement: ['You are given a binary number as a string of 0 and 1 characters. Print its value as an ordinary (decimal) integer.'],
  inputFormat: ['A single word `s` made of the characters 0 and 1.'],
  outputFormat: ['The decimal value.'],
  constraints: ['1 <= length of s <= 60'],
  examples: [{ input: '1101\n', note: '8 + 4 + 0 + 1 = 13.' }, { input: '0\n', note: 'Zero.' }],
  hints: [
    'Keep a variable `value` that starts at 0.',
    'For each character from left to right, double `value` and add the digit.',
    'A digit character becomes a number with `int(ch)` in Python and `ch - \'0\'` in C++ and Java. 60 binary digits fit in a 64-bit integer.'
  ],
  program: {
    io: ['s:word'],
    python: r`
      value = 0
      for ch in s:
          value = value * 2 + int(ch)
      print(value)`,
    cpp: r`
      long long value = 0;
      for (char ch : s) {
          value = value * 2 + (ch - '0');
      }
      cout << value << endl;`,
    java: r`
      long value = 0;
      for (int i = 0; i < s.length(); i++) {
          value = value * 2 + (s.charAt(i) - '0');
      }
      System.out.println(value);`
  },
  solution: {
    explanation: ['At each digit the value read so far is doubled and the new digit is added. After the last digit `value` is the whole number. A string of 60 binary digits is below 2^60, which fits in 64 bits.'],
    complexity: 'Time O(length of s), space O(1).'
  },
  solve(input) { return BigInt('0b' + input.trim()).toString(); },
  tests() {
    const g = rng(70);
    return ['1101\n', '0\n', '1\n', '10\n', '111\n', '100000\n', `${'1'.repeat(60)}\n`, `1${'0'.repeat(59)}\n`, ...many(5, () => `${bits(g, randInt(g, 2, 60))}\n`)];
  }
};
