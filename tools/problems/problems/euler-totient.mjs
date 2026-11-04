import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

function phi(n) {
  let result = n;
  for (let d = 2n; d * d <= n; d++) {
    if (n % d === 0n) {
      while (n % d === 0n) n /= d;
      result -= result / d;
    }
  }
  if (n > 1n) result -= result / n;
  return result;
}

const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };

export default {
  slug: 'euler-totient',
  title: "Euler's Totient",
  topic: 'basics',
  difficulty: 'hard',
  order: 91,
  tags: ['math', 'primes', 'gcd', 'complexity'],

  concept: {
    title: 'Counting numbers that share no factor with n',
    body: [
      'Euler\'s totient function `phi(n)` counts the numbers from 1 to `n` that have no common divisor with `n` other than 1 (their gcd with `n` is 1). For `n = 12`: the numbers 1, 5, 7 and 11 qualify, so `phi(12) = 4`.',
      'Checking every number with a gcd is a loop of `n` rounds, impossible for `n = 10^12`. The prime factors give a shortcut. A number shares a factor with `n` exactly when it is divisible by one of the primes of `n`. Throw out the multiples of each prime `p`, which are a fraction `1/p` of all numbers:',
      { code: 'phi(n) = n * (1 - 1/p1) * (1 - 1/p2) * ...      over the distinct primes of n' },
      'With whole numbers: start with `result = n`, and for every distinct prime `p` of `n` do `result = result - result / p`. This subtraction is always exact, since `result` stays divisible by `p`. For `12 = 2^2 * 3`: `12 - 12/2 = 6`, then `6 - 6/3 = 4`.',
      'Find the primes with the same trial division as before. Only *distinct* primes matter, so divide each prime out completely before moving on, and apply the subtraction once per prime.'
    ]
  },

  statement: ['Given a positive integer `n`, print `phi(n)`: how many integers `k` with `1 <= k <= n` satisfy `gcd(k, n) = 1`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`phi(n)`.'],
  constraints: ['1 <= n <= 10^12'],
  examples: [{ input: '12\n', note: 'The numbers 1, 5, 7 and 11: four of them.' }, { input: '13\n', note: 'A prime p has p - 1 such numbers: 12.' }],
  hints: [
    'Start with `result = n`.',
    'For each distinct prime `p` that divides `n`, replace `result` by `result - result / p`.',
    'Find the primes by trial division up to the square root; do not forget the leftover prime above it. `phi(1) = 1`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      result = n
      d = 2
      while d * d <= n:
          if n % d == 0:
              while n % d == 0:
                  n //= d
              result -= result // d
          d += 1
      if n > 1:
          result -= result // n
      print(result)`,
    cpp: r`
      long long result = n;
      for (long long d = 2; d * d <= n; d++) {
          if (n % d == 0) {
              while (n % d == 0) {
                  n /= d;
              }
              result -= result / d;
          }
      }
      if (n > 1) {
          result -= result / n;
      }
      cout << result << endl;`,
    java: r`
      long result = n;
      for (long d = 2; d * d <= n; d++) {
          if (n % d == 0) {
              while (n % d == 0) {
                  n /= d;
              }
              result -= result / d;
          }
      }
      if (n > 1) {
          result -= result / n;
      }
      System.out.println(result);`
  },
  solution: {
    explanation: ['For each distinct prime `p` of `n`, the multiples of `p` are removed from the count, i.e. `result` shrinks by a factor `(1 - 1/p)`. The primes are found by trial division up to the square root; the prime that remains afterwards (if `n > 1`) is handled once more at the end.'],
    complexity: 'Time O(sqrt n), space O(1).'
  },
  solve(input) { return String(phi(BigInt(input.trim()))); },
  tests() {
    const g = rng(91);
    // The formula must agree with the definition on small numbers.
    for (let n = 1; n <= 400; n++) {
      let c = 0; for (let k = 1; k <= n; k++) if (gcd(BigInt(k), BigInt(n)) === 1n) c++;
      if (phi(BigInt(n)) !== BigInt(c)) throw new Error(`phi formula disagrees with the definition at n=${n}`);
    }
    return ['12\n', '13\n', '1\n', '2\n', '9\n', '36\n', '1000000000000\n', '999999999989\n', '549755813888\n', '963761198400\n', '999999000001\n', ...many(4, () => `${randBig(g, 1n, 10n ** 12n)}\n`)];
  }
};
