import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

function factors(n) {
  const out = [];
  for (let d = 2; d * d <= n; d++) while (n % d === 0) { out.push(d); n /= d; }
  if (n > 1) out.push(n);
  return out;
}

export default {
  slug: 'prime-factorization',
  title: 'Prime Factors',
  topic: 'basics',
  difficulty: 'medium',
  order: 68,
  tags: ['math', 'primes', 'divisors'],

  concept: {
    title: 'Dividing the factors out',
    body: [
      'Every number above 1 is a product of primes in exactly one way: `360 = 2 * 2 * 2 * 3 * 3 * 5`. To find them, try the candidates `d = 2, 3, 4, ...` in order. When `d` divides `n`, record `d` and replace `n` by `n / d`; stay on the same `d` because it may divide again. Otherwise move on to the next `d`.',
      { code: 'd = 2\nwhile d * d <= n:\n    while n % d == 0:\n        # d is a factor\n        n = n // d\n    d += 1\n# what is left (if > 1) is a prime factor itself' },
      'Why is it enough to stop at `d * d <= n`? When every factor up to the square root has been divided out, whatever remains cannot have two factors larger than its square root, so it is itself a prime (or 1). Print it if it is bigger than 1.',
      'Composite candidates such as 4 or 6 never divide `n`, because their prime parts were already divided out earlier. The loop runs up to the square root of the *remaining* `n`, which is at most 10^6 steps for `n` up to 10^12.'
    ]
  },

  statement: ['Given an integer `n` greater than 1, print its prime factors in increasing order, with repetitions, separated by spaces.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The prime factors in non-decreasing order, separated by spaces.'],
  constraints: ['2 <= n <= 10^12'],
  examples: [{ input: '360\n', note: '2 2 2 3 3 5 (360 = 8 * 9 * 5).' }, { input: '13\n', note: 'A prime has only itself: 13.' }],
  hints: [
    'Try d = 2, 3, 4, ... in increasing order, as long as `d * d <= n`.',
    'While `d` divides `n`, print `d` and divide `n` by `d`. Then go to the next `d`.',
    'After the loop, if `n` is still greater than 1 it is one last prime factor: print it too.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      d = 2
      while d * d <= n:
          while n % d == 0:
              print(d, end=" ")
              n //= d
          d += 1
      if n > 1:
          print(n, end=" ")
      print()`,
    cpp: r`
      for (long long d = 2; d * d <= n; d++) {
          while (n % d == 0) {
              cout << d << " ";
              n /= d;
          }
      }
      if (n > 1) {
          cout << n << " ";
      }
      cout << endl;`,
    java: r`
      for (long d = 2; d * d <= n; d++) {
          while (n % d == 0) {
              System.out.print(d + " ");
              n /= d;
          }
      }
      if (n > 1) {
          System.out.print(n + " ");
      }
      System.out.println();`
  },
  solution: {
    explanation: ['Each candidate `d` is divided out as often as possible before moving on, so only primes ever divide `n`. The loop stops when `d * d` exceeds the remaining `n`; a remaining value above 1 is the largest prime factor.'],
    complexity: 'Time O(sqrt n), space O(1).'
  },
  solve(input) { return factors(Number(input.trim())).join(' '); },
  tests() {
    const g = rng(68);
    return ['360\n', '13\n', '2\n', '4\n', '12\n', '97\n', '1000000000000\n', '999999999989\n', '549755813888\n', '999999000001\n', '600851475143\n', '1000000007\n', ...many(4, () => `${randInt(g, 2, 1e12)}\n`)];
  }
};
