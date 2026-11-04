import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'last-digit',
  title: 'Last Digit',
  topic: 'basics',
  difficulty: 'easy',
  order: 17,
  tags: ['arithmetic', 'digits'],

  concept: {
    title: 'The remainder by 10',
    body: [
      'In our decimal system the last digit of a number is what is left when you take away all the tens. That is exactly the remainder of the division by 10: `n % 10`. For `n = 4075` the remainder is `5`.',
      'The partner operation is `n / 10` (whole-number division), which cuts the last digit off: `4075 / 10 = 407`. Together these two let you take a number apart digit by digit. You will use that idea in many problems later.',
      'The remainder is also a great tool in other bases: the remainder by 2 gives the last binary digit.'
    ]
  },

  statement: ['Given a non-negative integer `n`, print its last digit.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print the last digit of `n`.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '4075\n', note: 'The last digit is 5.' }, { input: '90\n', note: 'The last digit can be 0.' }],
  hints: [
    'Think about what is left when you divide the number by 10.',
    'The remainder operator gives it directly.',
    'Print `n % 10`.'
  ],
  program: {
    io: ['n:int'],
    python: 'print(n % 10)',
    cpp: r`cout << n % 10 << endl;`,
    java: 'System.out.println(n % 10);'
  },
  solution: {
    explanation: ['Dividing by 10 leaves the last digit as the remainder, so `n % 10` is the answer.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return String(BigInt(input.trim()) % 10n); },
  tests() {
    const g = rng(17);
    return ['4075\n', '90\n', '0\n', '7\n', '10\n', '999999999999999999\n', '1000000000000000000\n', '123456789\n', ...many(5, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
