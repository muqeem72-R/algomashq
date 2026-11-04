import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

function sieve(n) {
  const p = new Uint8Array(n + 1).fill(1);
  p[0] = 0; if (n >= 1) p[1] = 0;
  for (let i = 2; i * i <= n; i++) if (p[i]) for (let j = i * i; j <= n; j += i) p[j] = 0;
  return p;
}

export default {
  slug: 'goldbach-pair',
  title: 'Sum of Two Primes',
  topic: 'basics',
  difficulty: 'hard',
  order: 89,
  tags: ['primes', 'sieve', 'arrays'],

  concept: {
    title: 'Use a sieve as a lookup table',
    body: [
      'Goldbach\'s conjecture says that every even number above 2 is the sum of two primes. Nobody has proved it, but it has been checked far beyond the numbers of this problem, so a pair always exists here.',
      'To find a pair for `n` you try the first prime `p = 2, 3, 5, ...` and ask "is `n - p` prime too?". That question is asked many times, so testing each number by trial division would be slow. Instead build a table once: the **sieve of Eratosthenes** marks every number up to `n` as prime or not prime in about `n log log n` steps.',
      { code: 'is_prime = [True] * (n + 1)          # then 0 and 1 are not prime\ni = 2\nwhile i * i <= n:\n    if is_prime[i]:\n        for j in range(i * i, n + 1, i):   # cross out the multiples of i\n            is_prime[j] = False\n    i += 1' },
      'After the sieve, "is `k` prime?" is a single array lookup. Scanning `p` upwards from 2, the first `p` for which both `p` and `n - p` are marked prime is the answer. You never need to go beyond `n / 2`, because the smaller prime of the pair is at most half of `n`.',
      'Building a table once and then answering many questions by lookup is an idea you will use in nearly every topic.'
    ]
  },

  statement: ['Given an even number `n`, find two primes `p` and `q` with `p + q = n`, where `p <= q` and `p` is as small as possible. Print `p` and `q` separated by a space.'],
  inputFormat: ['A single even integer `n`.'],
  outputFormat: ['`p q`'],
  constraints: ['4 <= n <= 10^6, n is even'],
  examples: [{ input: '10\n', note: '3 + 7 = 10. (5 + 5 also works, but 3 is the smaller first prime.)' }, { input: '4\n', note: '2 + 2.' }],
  hints: [
    'Build a sieve of Eratosthenes up to `n` so that you can check any number for primality in one step.',
    'Loop `p` from 2 upwards. The first `p` for which both `p` and `n - p` are prime gives the answer.',
    'You can stop the search at `p = n / 2`. Print `p` and `n - p`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      is_prime = [True] * (n + 1)
      is_prime[0] = False
      is_prime[1] = False
      i = 2
      while i * i <= n:
          if is_prime[i]:
              for j in range(i * i, n + 1, i):
                  is_prime[j] = False
          i += 1
      for p in range(2, n // 2 + 1):
          if is_prime[p] and is_prime[n - p]:
              print(p, n - p)
              break`,
    cpp: r`
      vector<bool> isPrime(n + 1, true);
      isPrime[0] = false;
      isPrime[1] = false;
      for (long long i = 2; i * i <= n; i++) {
          if (isPrime[i]) {
              for (long long j = i * i; j <= n; j += i) {
                  isPrime[j] = false;
              }
          }
      }
      for (long long p = 2; p <= n / 2; p++) {
          if (isPrime[p] && isPrime[n - p]) {
              cout << p << " " << n - p << endl;
              break;
          }
      }`,
    java: r`
      boolean[] isPrime = new boolean[(int) n + 1];
      Arrays.fill(isPrime, true);
      isPrime[0] = false;
      isPrime[1] = false;
      for (long i = 2; i * i <= n; i++) {
          if (isPrime[(int) i]) {
              for (long j = i * i; j <= n; j += i) {
                  isPrime[(int) j] = false;
              }
          }
      }
      for (int p = 2; p <= n / 2; p++) {
          if (isPrime[p] && isPrime[(int) n - p]) {
              System.out.println(p + " " + (n - p));
              break;
          }
      }`
  },
  solution: {
    explanation: ['The sieve crosses out the multiples of every prime up to the square root of `n`, so afterwards `is_prime[k]` is correct for all `k <= n`. The scan then finds the smallest `p` such that `p` and `n - p` are both prime.'],
    complexity: 'Time O(n log log n), space O(n).'
  },
  solve(input) {
    const n = Number(input.trim());
    const p = sieve(n);
    for (let a = 2; a <= n / 2; a++) if (p[a] && p[n - a]) return `${a} ${n - a}`;
    throw new Error(`no Goldbach pair for ${n}`);
  },
  tests() {
    const g = rng(89);
    return ['10\n', '4\n', '6\n', '8\n', '12\n', '100\n', '1000\n', '998\n', '1000000\n', '999998\n', '123456\n', '786\n', ...many(4, () => `${2 * randInt(g, 2, 500000)}\n`)];
  }
};
