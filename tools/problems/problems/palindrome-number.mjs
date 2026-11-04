import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

const isPal = (s) => s === [...s].reverse().join('');

export default {
  slug: 'palindrome-number',
  title: 'Palindrome Number',
  topic: 'basics',
  difficulty: 'easy',
  order: 42,
  tags: ['loops', 'digits', 'palindrome'],

  concept: {
    title: 'Reuse what you built',
    body: [
      'A **palindrome** reads the same from both sides: 121, 4554, 7. A number is a palindrome exactly when it is equal to its own reverse.',
      'That turns the problem into two steps you already know: reverse the number, then compare the result with the original. One catch: the loop that reverses destroys `n` (it divides it down to 0), so save the original value in another variable first.',
      'Breaking a new problem into pieces that you have already solved is the most important habit in programming.'
    ]
  },

  statement: ['Given a non-negative integer `n`, print `yes` if it reads the same forwards and backwards, and `no` otherwise.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `yes` or `no`.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '12321\n', note: 'The reverse is 12321: a palindrome.' }, { input: '120\n', note: 'The reverse is 21, which is not 120.' }],
  hints: [
    'Reverse the number with the loop from the previous problem.',
    'Keep a copy of the original in another variable before the loop changes `n`.',
    'Compare the reverse with the copy: equal means `yes`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      original = n
      rev = 0
      while n > 0:
          rev = rev * 10 + n % 10
          n = n // 10
      if rev == original:
          print("yes")
      else:
          print("no")`,
    cpp: r`
      long long original = n;
      long long rev = 0;
      while (n > 0) {
          rev = rev * 10 + n % 10;
          n = n / 10;
      }
      if (rev == original) {
          cout << "yes" << endl;
      } else {
          cout << "no" << endl;
      }`,
    java: r`
      long original = n;
      long rev = 0;
      while (n > 0) {
          rev = rev * 10 + n % 10;
          n = n / 10;
      }
      if (rev == original) {
          System.out.println("yes");
      } else {
          System.out.println("no");
      }`
  },
  solution: {
    explanation: ['The number is reversed digit by digit and compared with the saved original. Numbers that end in 0 (except 0 itself) can never be palindromes, and the comparison handles this without special code.'],
    complexity: 'Time O(d) where d is the number of digits, space O(1).'
  },
  solve(input) { return isPal(input.trim()) ? 'yes' : 'no'; },
  tests() {
    const g = rng(42);
    const mirror = (x) => { const s = String(x); return BigInt(s + [...s].reverse().join('')); };
    return ['12321\n', '120\n', '0\n', '7\n', '10\n', '11\n', '1221\n', '1000000000000000000\n', '999999999999999999\n', `${mirror(123456789)}\n`, ...many(3, () => `${mirror(randBig(g, 1n, 999999999n))}\n`), ...many(3, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
