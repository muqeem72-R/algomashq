import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'recursive-digit-sum',
  title: 'Recursive Digit Sum',
  topic: 'basics',
  difficulty: 'medium',
  order: 76,
  tags: ['recursion', 'digits'],

  concept: {
    title: 'Peeling a number recursively',
    body: [
      'Anything you do with a loop that peels off the last digit can be written recursively. The number `n` is "its last digit" plus "the rest", where the rest is `n / 10`, a smaller number. So:',
      { code: 'digit_sum(n) = n % 10 + digit_sum(n / 10)\ndigit_sum(0) = 0' },
      'The smaller input is the number with one digit less, and the base case is 0 (no digits left, sum 0). The recursion is only as deep as the number has digits, at most 19 here, so memory is no concern.',
      'Compare with the loop version you wrote before: the loop variable `total` that collected the sum is replaced by the value that each call returns to its caller. This is the usual translation: **accumulate in a loop, or combine returned results in recursion**.'
    ]
  },

  statement: ['Write a recursive function that returns the sum of the digits of a non-negative integer `n`, and print its result for the given `n`. Do not use a loop.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The sum of the digits of `n`.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '40759\n', note: '4 + 0 + 7 + 5 + 9 = 25.' }, { input: '0\n', note: 'The sum of no digits is 0.' }],
  hints: [
    'What is the digit sum of 0? That is the base case.',
    'Otherwise the digit sum is the last digit (`n % 10`) plus the digit sum of the number without it (`n / 10`).',
    'In Python the whole-number division is `n // 10`.'
  ],
  program: {
    io: ['n:int'],
    helpers: {
      python: r`
        def digit_sum(n):
            if n == 0:
                return 0
            return n % 10 + digit_sum(n // 10)`,
      cpp: r`
        long long digitSum(long long n) {
            if (n == 0) {
                return 0;
            }
            return n % 10 + digitSum(n / 10);
        }`,
      java: r`
        static long digitSum(long n) {
            if (n == 0) {
                return 0;
            }
            return n % 10 + digitSum(n / 10);
        }`
    },
    starterHelpers: {
      python: r`
        def digit_sum(n):
            # Your code here
            pass`,
      cpp: r`
        long long digitSum(long long n) {
            // Your code here
            return 0;
        }`,
      java: r`
        static long digitSum(long n) {
            // Your code here
            return 0;
        }`
    },
    starterBody: {
      python: 'print(digit_sum(n))',
      cpp: r`cout << digitSum(n) << endl;`,
      java: 'System.out.println(digitSum(n));'
    },
    python: 'print(digit_sum(n))',
    cpp: r`cout << digitSum(n) << endl;`,
    java: 'System.out.println(digitSum(n));'
  },
  solution: {
    explanation: ['Zero has no digits, so its sum is 0 (the base case). Otherwise the last digit is added to the digit sum of the number with that digit removed.'],
    complexity: 'Time O(d) for d digits, space O(d) for the call stack.'
  },
  solve(input) { return String([...input.trim()].reduce((s, c) => s + Number(c), 0)); },
  tests() {
    const g = rng(76);
    return ['40759\n', '0\n', '9\n', '10\n', '999\n', '1000000000000000000\n', '999999999999999999\n', ...many(6, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
