import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

const gcdBig = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };

export default {
  slug: 'gcd',
  title: 'Greatest Common Divisor',
  topic: 'basics',
  difficulty: 'medium',
  order: 62,
  tags: ['math', 'euclid', 'loops'],

  concept: {
    title: "Euclid's algorithm",
    body: [
      'The **greatest common divisor** (gcd) of two numbers is the largest number that divides both. You could try every number downwards from the smaller one, but for numbers near 10^18 that would take forever.',
      'Euclid found a much faster way 2300 years ago. If you replace the bigger number by its remainder when divided by the smaller one, the gcd does not change: `gcd(a, b) = gcd(b, a % b)`. Repeat until the remainder is 0; the last non-zero number is the answer.',
      { code: 'while b != 0:\n    a, b = b, a % b\n# now a is the gcd' },
      'Example: `gcd(48, 18)`: (48, 18) -> (18, 12) -> (12, 6) -> (6, 0). The answer is 6. Each step at least halves the numbers in two rounds, so even for numbers near 10^18 only about 90 steps are needed. We say the running time is **O(log n)**: it grows with the number of digits, not with the size of the number.'
    ]
  },

  statement: ['Given two positive integers `a` and `b`, print their greatest common divisor.'],
  inputFormat: ['One line with two integers `a` and `b`.'],
  outputFormat: ['The gcd of `a` and `b`.'],
  constraints: ['1 <= a, b <= 10^18'],
  examples: [{ input: '48 18\n', note: 'The largest number dividing both is 6.' }, { input: '17 5\n', note: 'They have no common divisor except 1.' }],
  hints: [
    'Do not test all possible divisors; the numbers are too large.',
    'Use `gcd(a, b) = gcd(b, a % b)` and repeat while `b` is not zero.',
    'When `b` becomes 0, the answer is `a`.'
  ],
  program: {
    io: ['a:int b:int'],
    python: r`
      while b != 0:
          a, b = b, a % b
      print(a)`,
    cpp: r`
      while (b != 0) {
          long long rest = a % b;
          a = b;
          b = rest;
      }
      cout << a << endl;`,
    java: r`
      while (b != 0) {
          long rest = a % b;
          a = b;
          b = rest;
      }
      System.out.println(a);`
  },
  solution: {
    explanation: ['Replacing `(a, b)` by `(b, a % b)` keeps the gcd the same but makes the numbers shrink quickly. When the second number reaches 0, the first one is the gcd.'],
    complexity: 'Time O(log(min(a, b))), space O(1).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(BigInt); return String(gcdBig(a, b)); },
  tests() {
    const g = rng(62);
    const fib = [1n, 1n]; while (fib.length < 88) fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    return ['48 18\n', '17 5\n', '1 1\n', '12 12\n', '100 10\n', '10 100\n', '1000000000000000000 1\n', '1000000000000000000 500000000000000000\n', `${fib[86]} ${fib[85]}\n`, '999999999999999989 999999999999999967\n', ...many(5, () => `${randBig(g, 1n, 10n ** 18n)} ${randBig(g, 1n, 10n ** 18n)}\n`)];
  }
};
