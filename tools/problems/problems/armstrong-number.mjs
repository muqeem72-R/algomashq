import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const isArmstrong = (n) => { const d = String(n); return [...d].reduce((s, c) => s + BigInt(c) ** BigInt(d.length), 0n) === BigInt(n); };

export default {
  slug: 'armstrong-number',
  title: 'Armstrong Number',
  topic: 'basics',
  difficulty: 'medium',
  order: 67,
  tags: ['digits', 'loops', 'power'],

  concept: {
    title: 'Combining small tools',
    body: [
      'An **Armstrong number** (or narcissistic number) equals the sum of its digits, each raised to the power of the number of digits. For example `153` has 3 digits and `1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153`.',
      'Nothing new is needed; three problems you solved already fit together:',
      { list: ['count the digits of `n` (a while loop with `/ 10`)', 'take the digits apart (`% 10` and `/ 10`)', 'raise each digit to a power by repeated multiplication'] },
      'Keep a copy of the original number, since the digit loop destroys it. Count the digits in a first loop, then run a second loop for the sum. Plan the two passes on paper before you write the code.',
      'The biggest value is `9^10`, about 3.5 * 10^9, which needs a 64-bit variable.'
    ]
  },

  statement: ['Given a non-negative integer `n`, print `yes` if it is equal to the sum of its digits, each raised to the power of the number of digits, and `no` otherwise. Single-digit numbers count (for example 5 = 5^1).'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `yes` or `no`.'],
  constraints: ['0 <= n <= 10^9'],
  examples: [{ input: '153\n', note: '1^3 + 5^3 + 3^3 = 153.' }, { input: '154\n', note: '1 + 125 + 64 = 190, not 154.' }],
  hints: [
    'Count the digits first. Remember that 0 has one digit.',
    'Then take the digits apart; for each digit multiply it by itself as many times as there are digits, and add the result to the sum.',
    'Compare the sum with the original number, which you saved before the loops.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      original = n
      digits = len(str(n))
      total = 0
      while n > 0:
          digit = n % 10
          power = 1
          for _ in range(digits):
              power *= digit
          total += power
          n //= 10
      print("yes" if total == original else "no")`,
    cpp: r`
      long long original = n;
      int digits = 0;
      for (long long t = n; t > 0; t /= 10) {
          digits++;
      }
      long long total = 0;
      while (n > 0) {
          long long digit = n % 10;
          long long power = 1;
          for (int i = 0; i < digits; i++) {
              power *= digit;
          }
          total += power;
          n /= 10;
      }
      cout << (total == original ? "yes" : "no") << endl;`,
    java: r`
      long original = n;
      int digits = 0;
      for (long t = n; t > 0; t /= 10) {
          digits++;
      }
      long total = 0;
      while (n > 0) {
          long digit = n % 10;
          long power = 1;
          for (int i = 0; i < digits; i++) {
              power *= digit;
          }
          total += power;
          n /= 10;
      }
      System.out.println(total == original ? "yes" : "no");`
  },
  solution: {
    explanation: ['The first loop counts the digits. The second loop peels the digits off, raises each to that power by repeated multiplication and adds them up. The sum is compared with the saved original. For `n = 0` the loops do not run, the sum stays 0 and equals `n`, so 0 is an Armstrong number.'],
    complexity: 'Time O(d^2) for d digits (at most 10), space O(1).'
  },
  solve(input) { return isArmstrong(input.trim()) ? 'yes' : 'no'; },
  tests() {
    const g = rng(67);
    return ['153\n', '154\n', '0\n', '5\n', '10\n', '370\n', '371\n', '407\n', '1634\n', '9474\n', '9475\n', '548834\n', '472335975\n', '912985153\n', '912985154\n', '1000000000\n', ...many(3, () => `${randInt(g, 1, 1e9)}\n`)];
  }
};
