import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'decimal-to-binary',
  title: 'Decimal to Binary',
  topic: 'basics',
  difficulty: 'medium',
  order: 69,
  tags: ['number-systems', 'loops', 'strings'],

  concept: {
    title: 'Writing a number in base 2',
    body: [
      'Computers store numbers in **binary**, using only the digits 0 and 1. In base 10 the digits are worth 1, 10, 100, ...; in base 2 they are worth 1, 2, 4, 8, .... The binary number `1101` is `8 + 4 + 0 + 1 = 13`.',
      'To convert a number to binary, do what you do to peel decimal digits, but with 2 instead of 10: the remainder `n % 2` is the last binary digit, and `n / 2` removes it. Repeat until `n` is 0. The digits come out **from the right**, so each new digit goes in front of the ones you already have.',
      { code: 'bits = ""\nwhile n > 0:\n    bits = str(n % 2) + bits\n    n = n // 2' },
      'The number 0 produces no digits at all, but its binary form is `0`, so handle it separately. The same method converts to any base: use the base instead of 2 (for bases above 10 the digits need letters).'
    ]
  },

  statement: ['Given a non-negative integer `n`, print it in binary, without leading zeros. The number 0 is written as `0`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The binary representation of `n`.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '13\n', note: '13 = 8 + 4 + 1, so 1101.' }, { input: '0\n', note: 'Zero is written as 0.' }],
  hints: [
    'The last binary digit of `n` is `n % 2`.',
    'Remove it with `n / 2`, and put each new digit in front of the digits collected so far.',
    'The loop does not run for `n = 0`; print `0` for that case.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      bits = ""
      while n > 0:
          bits = str(n % 2) + bits
          n = n // 2
      if bits == "":
          bits = "0"
      print(bits)`,
    cpp: r`
      string bits = "";
      while (n > 0) {
          bits = char('0' + n % 2) + bits;
          n = n / 2;
      }
      if (bits == "") {
          bits = "0";
      }
      cout << bits << endl;`,
    java: r`
      String bits = "";
      while (n > 0) {
          bits = (n % 2) + bits;
          n = n / 2;
      }
      if (bits.equals("")) {
          bits = "0";
      }
      System.out.println(bits);`
  },
  solution: {
    explanation: ['Repeated division by 2 produces the binary digits from the right to the left, so each digit is placed in front of the text built so far. Zero is a special case because the loop never runs.'],
    complexity: 'Time O(log n) (at most 60 steps), space O(log n).'
  },
  solve(input) { return BigInt(input.trim()).toString(2); },
  tests() {
    const g = rng(69);
    return ['13\n', '0\n', '1\n', '2\n', '8\n', '255\n', '1023\n', '1000000000000000000\n', '999999999999999999\n', '576460752303423488\n', ...many(5, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
