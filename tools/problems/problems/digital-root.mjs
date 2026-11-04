import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

const digitSum = (n) => [...String(n)].reduce((s, c) => s + Number(c), 0);
const root = (s) => { let n = BigInt(s); if (n === 0n) return 0; return Number(1n + ((n - 1n) % 9n)); };

export default {
  slug: 'digital-root',
  title: 'Digital Root',
  topic: 'basics',
  difficulty: 'medium',
  order: 71,
  tags: ['digits', 'loops', 'math'],

  concept: {
    title: 'A loop inside a loop',
    body: [
      'The **digital root** of a number is what you get when you add its digits, then add the digits of that result, and so on until a single digit is left. For `9875`: `9+8+7+5 = 29`, then `2+9 = 11`, then `1+1 = 2`. The digital root is 2.',
      'Structure the program in two levels. The inner loop computes the digit sum of the current number (you wrote it already). The outer loop repeats that as long as the result still has more than one digit, that is while `n >= 10`.',
      { code: 'while n >= 10:\n    s = 0\n    while n > 0:\n        s += n % 10\n        n //= 10\n    n = s' },
      'Each round makes the number far smaller, so the outer loop runs very few times (at most about 3 for numbers up to 10^18). There is also a closed formula, `1 + (n - 1) % 9` for `n > 0`, which comes from the fact that a number and its digit sum leave the same remainder when divided by 9. Try the loop first, then see if you can prove the formula to yourself.'
    ]
  },

  statement: ['Given a non-negative integer `n`, repeatedly replace it by the sum of its digits until only one digit is left. Print that digit.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The digital root of `n`.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '9875\n', note: '9875 -> 29 -> 11 -> 2.' }, { input: '7\n', note: 'A single digit stays as it is.' }],
  hints: [
    'First write the code that adds the digits of a number.',
    'Put it inside an outer loop that runs while `n` has two or more digits (`n >= 10`).',
    'In every round of the outer loop replace `n` by the digit sum. Print `n` at the end.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      while n >= 10:
          total = 0
          while n > 0:
              total += n % 10
              n //= 10
          n = total
      print(n)`,
    cpp: r`
      while (n >= 10) {
          long long total = 0;
          while (n > 0) {
              total += n % 10;
              n /= 10;
          }
          n = total;
      }
      cout << n << endl;`,
    java: r`
      while (n >= 10) {
          long total = 0;
          while (n > 0) {
              total += n % 10;
              n /= 10;
          }
          n = total;
      }
      System.out.println(n);`
  },
  solution: {
    explanation: ['The inner loop computes the digit sum, the outer loop replaces the number by it until a single digit remains. Zero and single digits skip the outer loop and are printed as they are.'],
    complexity: 'Time O(d) where d is the number of digits (the outer loop runs only a few times), space O(1).'
  },
  solve(input) { return String(root(input.trim())); },
  tests() {
    const g = rng(71);
    return ['9875\n', '7\n', '0\n', '9\n', '10\n', '18\n', '99\n', '999999999999999999\n', '1000000000000000000\n', '123456789\n', ...many(5, () => `${randBig(g, 0n, 10n ** 18n)}\n`)];
  }
};
