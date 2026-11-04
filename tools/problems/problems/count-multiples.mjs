import { many, rng, randBig, randInt } from '../lib.mjs';
const r = String.raw;

const gcdBig = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };

export default {
  slug: 'count-multiples',
  title: 'Divisible by A or B',
  topic: 'basics',
  difficulty: 'hard',
  order: 83,
  tags: ['complexity', 'math', 'inclusion-exclusion', 'gcd'],

  concept: {
    title: 'Counting without visiting',
    body: [
      'How many numbers from 1 to `n` are divisible by `a`? There is no need to look at them: the multiples of `a` are `a, 2a, 3a, ...`, and the last one that fits is `(n / a) * a`, so there are exactly `n / a` of them (whole-number division).',
      'For "divisible by `a` **or** `b`", adding `n / a` and `n / b` counts some numbers twice: those divisible by both. A number is divisible by both exactly when it is divisible by the least common multiple. So subtract them once:',
      { code: 'answer = n/a + n/b - n/lcm(a, b)' },
      'This is the *inclusion-exclusion* principle for two sets: |A or B| = |A| + |B| - |A and B|. It turns a loop over 10^18 numbers into a few divisions, using the gcd and lcm you already know.',
      'Watch the sizes: with `a, b` up to 10^9 the lcm can reach 10^18, which still fits in 64 bits as long as you compute it as `a / gcd * b` and not as `a * b / gcd`. Dividing `n` by an lcm larger than `n` is fine and gives 0.'
    ]
  },

  statement: ['Given `n`, `a` and `b`, print how many integers from 1 to `n` are divisible by `a` or by `b` (or both).'],
  inputFormat: ['One line with three integers `n`, `a` and `b`.'],
  outputFormat: ['The count.'],
  constraints: ['1 <= n <= 10^18', '1 <= a, b <= 10^9'],
  examples: [{ input: '20 3 5\n', note: 'Multiples of 3: 6 numbers, of 5: 4 numbers, of 15: 1. 6 + 4 - 1 = 9.' }, { input: '10 2 4\n', note: 'Every multiple of 4 is also a multiple of 2: 5 numbers.' }],
  hints: [
    'There are `n / a` multiples of `a` up to `n`, and `n / b` multiples of `b`.',
    'The numbers divisible by both are the multiples of `lcm(a, b)`. They were counted twice.',
    'Compute the lcm as `a / gcd(a, b) * b` (it fits in 64 bits) and print `n/a + n/b - n/lcm`.'
  ],
  program: {
    io: ['n:int a:int b:int'],
    python: r`
      x, y = a, b
      while y != 0:
          x, y = y, x % y
      lcm = a // x * b
      print(n // a + n // b - n // lcm)`,
    cpp: r`
      long long x = a, y = b;
      while (y != 0) {
          long long rest = x % y;
          x = y;
          y = rest;
      }
      long long lcm = a / x * b;
      cout << n / a + n / b - n / lcm << endl;`,
    java: r`
      long x = a, y = b;
      while (y != 0) {
          long rest = x % y;
          x = y;
          y = rest;
      }
      long lcm = a / x * b;
      System.out.println(n / a + n / b - n / lcm);`
  },
  solution: {
    explanation: ['Multiples of `a` plus multiples of `b` count the common multiples twice, so those (the multiples of the lcm) are subtracted once. The gcd comes from Euclid\'s algorithm, and the lcm is computed by dividing first to avoid overflow. The result is at most 2 * 10^18, which fits in 64 bits.'],
    complexity: 'Time O(log(min(a, b))), space O(1).'
  },
  solve(input) { const [n, a, b] = input.trim().split(/\s+/).map(BigInt); const l = (a / gcdBig(a, b)) * b; return String(n / a + n / b - n / l); },
  tests() {
    const g = rng(83);
    const T18 = 10n ** 18n;
    return ['20 3 5\n', '10 2 4\n', '1 1 1\n', '1 2 3\n', '100 7 7\n', `${T18} 1 1\n`, `${T18} 1000000000 999999999\n`, `${T18} 2 3\n`, `${T18} 999999937 999999929\n`, '30 6 10\n', ...many(6, () => `${randBig(g, 1n, T18)} ${randInt(g, 1, 1e9)} ${randInt(g, 1, 1e9)}\n`)];
  }
};
