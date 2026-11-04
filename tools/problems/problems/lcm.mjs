import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const gcdBig = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };

export default {
  slug: 'lcm',
  title: 'Least Common Multiple',
  topic: 'basics',
  difficulty: 'medium',
  order: 63,
  tags: ['math', 'euclid', 'overflow'],

  concept: {
    title: 'From gcd to lcm, and a word about overflow',
    body: [
      'The **least common multiple** (lcm) of `a` and `b` is the smallest positive number that both divide. It is linked to the gcd by a neat identity: `lcm(a, b) * gcd(a, b) = a * b`, so `lcm = a / gcd * b`.',
      'Write it as `a / gcd * b` and not as `a * b / gcd`. The two are mathematically equal, but the second one multiplies first and the intermediate value `a * b` can be far larger than the final answer. When the numbers are close to the limit of the type, that intermediate value overflows. Dividing first keeps every intermediate value no bigger than the result.',
      'The division `a / gcd` is exact (the gcd divides `a`), so no digits are lost.'
    ]
  },

  statement: ['Given two positive integers `a` and `b`, print their least common multiple.'],
  inputFormat: ['One line with two integers `a` and `b`.'],
  outputFormat: ['The lcm of `a` and `b`.'],
  constraints: ['1 <= a, b <= 10^9'],
  examples: [{ input: '4 6\n', note: 'The multiples of 4 are 4, 8, 12 and of 6 are 6, 12: the smallest common one is 12.' }, { input: '7 7\n', note: 'lcm(7, 7) = 7.' }],
  hints: [
    'First compute the gcd with Euclid\'s algorithm (the previous problem).',
    'Then lcm = a / gcd * b.',
    'Divide before you multiply to keep numbers small. The answer can be as large as 10^18.'
  ],
  program: {
    io: ['a:int b:int'],
    python: r`
      x, y = a, b
      while y != 0:
          x, y = y, x % y
      print(a // x * b)`,
    cpp: r`
      long long x = a, y = b;
      while (y != 0) {
          long long rest = x % y;
          x = y;
          y = rest;
      }
      cout << a / x * b << endl;`,
    java: r`
      long x = a, y = b;
      while (y != 0) {
          long rest = x % y;
          x = y;
          y = rest;
      }
      System.out.println(a / x * b);`
  },
  solution: {
    explanation: ['Euclid\'s algorithm runs on copies `x` and `y`, so `a` and `b` stay available. After the loop `x` is the gcd, and the lcm is `a / gcd * b`.'],
    complexity: 'Time O(log(min(a, b))), space O(1).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(BigInt); return String((a / gcdBig(a, b)) * b); },
  tests() {
    const g = rng(63);
    return ['4 6\n', '7 7\n', '1 1\n', '1 1000000000\n', '1000000000 1000000000\n', '999999937 999999929\n', '1000000000 999999999\n', '12 18\n', ...many(6, () => `${randInt(g, 1, 1e9)} ${randInt(g, 1, 1e9)}\n`)];
  }
};
