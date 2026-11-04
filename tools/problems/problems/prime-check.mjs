import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };

export default {
  slug: 'prime-check',
  title: 'Is It Prime?',
  topic: 'basics',
  difficulty: 'medium',
  order: 64,
  tags: ['math', 'primes', 'complexity'],

  concept: {
    title: 'Why you only need to look up to the square root',
    body: [
      'A **prime** is a number greater than 1 whose only divisors are 1 and itself. The direct test is to try every candidate `d` from 2 to `n - 1` and check whether `n % d == 0`. For `n` around 10^9 that is a billion steps, too slow.',
      'Divisors come in pairs: if `d` divides `n` then so does `n / d`, and one of the two is at most the square root of `n`. So if `n` has any divisor besides 1 and itself, it has one that is **at most sqrt(n)**. It is enough to test `d = 2, 3, ..., sqrt(n)`.',
      { code: 'd = 2\nwhile d * d <= n:      # same as d <= sqrt(n), without decimals\n    if n % d == 0:\n        # found a divisor: n is not prime\n    d += 1' },
      'The loop condition `d * d <= n` avoids the square root function, whose decimal result can be slightly off. For `n = 10^9` the loop runs about 31,600 times instead of a billion: the running time is **O(sqrt n)**.',
      'Remember that 1 is not prime.'
    ]
  },

  statement: ['Given an integer `n`, print `prime` if it is a prime number and `not prime` otherwise.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `prime` or `not prime`.'],
  constraints: ['1 <= n <= 10^9'],
  examples: [{ input: '17\n', note: '17 has no divisor between 2 and 4: prime.' }, { input: '1\n', note: '1 is not prime.' }],
  hints: [
    'Handle `n = 1` separately: it is not prime.',
    'Try the divisors `d = 2, 3, ...` while `d * d <= n`. If any `d` divides `n`, it is not prime.',
    'If no divisor was found, it is prime. `n * n` will not overflow because you use `d * d` with `d` around 31,623 at most.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      prime = n >= 2
      d = 2
      while d * d <= n:
          if n % d == 0:
              prime = False
              break
          d += 1
      print("prime" if prime else "not prime")`,
    cpp: r`
      bool prime = n >= 2;
      for (long long d = 2; d * d <= n; d++) {
          if (n % d == 0) {
              prime = false;
              break;
          }
      }
      cout << (prime ? "prime" : "not prime") << endl;`,
    java: r`
      boolean prime = n >= 2;
      for (long d = 2; d * d <= n; d++) {
          if (n % d == 0) {
              prime = false;
              break;
          }
      }
      System.out.println(prime ? "prime" : "not prime");`
  },
  solution: {
    explanation: ['Any composite number has a divisor not larger than its square root, so testing the candidates up to `sqrt(n)` is enough. The loop stops at the first divisor found. The number 1 is excluded from the start.'],
    complexity: 'Time O(sqrt n), space O(1).'
  },
  solve(input) { return isPrime(Number(input.trim())) ? 'prime' : 'not prime'; },
  tests() {
    const g = rng(64);
    return ['17\n', '1\n', '2\n', '3\n', '4\n', '9\n', '25\n', '97\n', '561\n', '999999937\n', '999999929\n', '1000000000\n', '999950884\n', '999999999\n', '961\n', ...many(4, () => `${randInt(g, 1, 1e9)}\n`)];
  }
};
