import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

function sigma(n) {
  let total = 1n;
  for (let d = 2n; d * d <= n; d++) {
    if (n % d === 0n) {
      let term = 1n, power = 1n;
      while (n % d === 0n) { n /= d; power *= d; term += power; }
      total *= term;
    }
  }
  if (n > 1n) total *= 1n + n;
  return total;
}

export default {
  slug: 'sum-of-divisors',
  title: 'Sum of All Divisors',
  topic: 'basics',
  difficulty: 'hard',
  order: 90,
  tags: ['math', 'primes', 'divisors', 'complexity'],

  concept: {
    title: 'A formula from the prime factors',
    body: [
      'Listing all divisors of a number up to 10^12 is possible, but there is a far more elegant way once you know the prime factorization. If `n = p1^e1 * p2^e2 * ...`, every divisor is a choice of an exponent between 0 and `e` for each prime. Summing over all choices factors into a product:',
      { code: 'sigma(n) = (1 + p1 + p1^2 + ... + p1^e1) * (1 + p2 + ... + p2^e2) * ...' },
      'For `n = 12 = 2^2 * 3`: `(1 + 2 + 4) * (1 + 3) = 7 * 4 = 28`, and indeed `1 + 2 + 3 + 4 + 6 + 12 = 28`.',
      'You already know how to find the prime factors by trial division up to the square root. While dividing out a prime `d`, build its factor `1 + d + d^2 + ...` along the way: keep the current power of `d` and add it to a running term. After the loop, any leftover `n > 1` is a prime with exponent 1 and contributes the factor `1 + n`.',
      'The loop runs up to 10^6 times for `n = 10^12`, which is quick. The answer can be a few times larger than `n`, so it needs 64 bits.'
    ]
  },

  statement: ['Given a positive integer `n`, print the sum of all its positive divisors (1 and `n` included).'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The sum of the divisors.'],
  constraints: ['1 <= n <= 10^12'],
  examples: [{ input: '12\n', note: '1 + 2 + 3 + 4 + 6 + 12 = 28.' }, { input: '13\n', note: 'A prime: 1 + 13 = 14.' }],
  hints: [
    'Factorize `n` by trial division, as in the prime factors problem.',
    'For each prime `d` with exponent `e`, its factor is `1 + d + d^2 + ... + d^e`. Build it while dividing: keep `power` and a `term`.',
    'Multiply all the factors. A leftover `n > 1` after the loop contributes `1 + n`. For `n = 1` the answer is 1.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      total = 1
      d = 2
      while d * d <= n:
          if n % d == 0:
              term = 1
              power = 1
              while n % d == 0:
                  n //= d
                  power *= d
                  term += power
              total *= term
          d += 1
      if n > 1:
          total *= 1 + n
      print(total)`,
    cpp: r`
      long long total = 1;
      for (long long d = 2; d * d <= n; d++) {
          if (n % d == 0) {
              long long term = 1, power = 1;
              while (n % d == 0) {
                  n /= d;
                  power *= d;
                  term += power;
              }
              total *= term;
          }
      }
      if (n > 1) {
          total *= 1 + n;
      }
      cout << total << endl;`,
    java: r`
      long total = 1;
      for (long d = 2; d * d <= n; d++) {
          if (n % d == 0) {
              long term = 1, power = 1;
              while (n % d == 0) {
                  n /= d;
                  power *= d;
                  term += power;
              }
              total *= term;
          }
      }
      if (n > 1) {
          total *= 1 + n;
      }
      System.out.println(total);`
  },
  solution: {
    explanation: ['The sum of the divisors is multiplicative: it is the product, over the prime factors, of `1 + p + p^2 + ... + p^e`. The trial-division loop finds each prime, builds its sum of powers while dividing it out, and multiplies it into the total. A leftover prime above the square root has exponent 1.'],
    complexity: 'Time O(sqrt n), space O(1).'
  },
  solve(input) { return String(sigma(BigInt(input.trim()))); },
  tests() {
    const g = rng(90);
    return ['12\n', '13\n', '1\n', '2\n', '6\n', '28\n', '36\n', '1000000000000\n', '999999999989\n', '549755813888\n', '963761198400\n', '999999000001\n', ...many(4, () => `${randBig(g, 1n, 10n ** 12n)}\n`)];
  }
};
