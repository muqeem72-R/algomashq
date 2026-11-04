import { many, rng, randInt, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'quotient-and-remainder',
  title: 'Quotient and Remainder',
  topic: 'basics',
  difficulty: 'easy',
  order: 9,
  tags: ['arithmetic', 'division'],

  concept: {
    title: 'Whole-number division',
    body: [
      'Dividing `a` by `b` with whole numbers gives a **quotient** `q` and a **remainder** `r` so that `a = q * b + r` and `0 <= r < b`. For example `17 = 3 * 5 + 2`.',
      'In C++ and Java the `/` between two whole numbers gives the quotient and `%` gives the remainder. In Python use `//` for the quotient (a single `/` would give a decimal number) and `%` for the remainder.',
      'The remainder is one of the most useful tools in programming: `n % 2` tells even from odd, `n % 10` is the last digit, and `minutes % 60` is the minutes left on a clock.',
      'This problem only uses non-negative numbers. With negative numbers the languages disagree about rounding, which is a trap for later.'
    ]
  },

  statement: ['Given two integers `a` and `b`, divide `a` by `b` and print the quotient and the remainder, separated by a space.'],
  inputFormat: ['One line with two integers `a` and `b`.'],
  outputFormat: ['Print `q r` on one line: the quotient, a space, the remainder.'],
  constraints: ['0 <= a <= 10^18', '1 <= b <= 10^9'],
  examples: [{ input: '17 5\n', note: '17 = 3 * 5 + 2, so the answer is 3 2.' }, { input: '4 9\n', note: '4 is smaller than 9: the quotient is 0 and the remainder is 4.' }],
  hints: [
    'You need two values: how many times `b` fits into `a`, and what is left over.',
    'In Python the quotient is `a // b`. In C++ and Java it is `a / b`. The remainder is `a % b` everywhere.',
    'Print both on one line with a space between them.'
  ],
  program: {
    io: ['a:int b:int'],
    python: 'print(a // b, a % b)',
    cpp: r`cout << a / b << " " << a % b << endl;`,
    java: 'System.out.println(a / b + " " + a % b);'
  },
  solution: {
    explanation: ['The quotient is `a / b` (whole-number division) and the remainder is `a % b`. Both are printed on one line separated by a space.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(BigInt); return `${a / b} ${a % b}`; },
  tests() {
    const g = rng(9);
    return ['0 1\n', '1 1\n', '17 5\n', '5 17\n', '10 10\n', '1000000000000000000 1\n', '1000000000000000000 1000000000\n', '999999999999999999 7\n', ...many(5, () => `${randBig(g, 0n, 10n ** 18n)} ${randInt(g, 1, 1e9)}\n`)];
  }
};
