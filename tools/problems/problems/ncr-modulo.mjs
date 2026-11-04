import { many, rng, randInt } from '../lib.mjs';
import { modPow } from '../lib.mjs';
const r = String.raw;

const MOD = 1000000007n;
let factCache = null;
function factorials(upTo) {
  if (!factCache) { factCache = [1n]; for (let i = 1n; i <= 1000000n; i++) factCache.push((factCache[factCache.length - 1] * i) % MOD); }
  return factCache;
}
function binom(n, k) {
  const f = factorials();
  return (f[n] * modPow(f[k], MOD - 2n, MOD) % MOD) * modPow(f[n - k], MOD - 2n, MOD) % MOD;
}

export default {
  slug: 'ncr-modulo',
  title: 'Binomial Coefficient Modulo a Prime',
  topic: 'basics',
  difficulty: 'hard',
  order: 97,
  tags: ['math', 'modulo', 'power', 'combinatorics'],

  concept: {
    title: 'Division in modular arithmetic',
    body: [
      'The binomial coefficient `C(n, r) = n! / (r! * (n - r)!)` counts the ways to choose `r` items out of `n`. The factorials are astronomically large, so you work with remainders modulo `p = 1,000,000,007`. Additions, subtractions and multiplications are easy: take the remainder after each operation. The trouble is the **division**: `(a / b) % p` is *not* `(a % p) / (b % p)`.',
      'Because `p` is prime there is a way out. By **Fermat\'s little theorem**, `b^(p-1) % p = 1` for every `b` not divisible by `p`. Multiply both sides by `b^(-1)` and you get `b^(p-2)` as the **modular inverse** of `b`: the number `x` with `b * x % p = 1`. Dividing by `b` modulo `p` means multiplying by `b^(p-2) % p`.',
      'Computing `b^(p-2)` with a loop would take a billion steps, but the fast power method from the earlier problem needs only about 30 multiplications. So:',
      { code: 'C(n, r) = fact[n] * power(fact[r], p - 2) * power(fact[n - r], p - 2)     (all modulo p)' },
      'Precompute the table `fact[i] = i! % p` for `i = 0 .. n` in one loop: `fact[i] = fact[i-1] * i % p`. Every product of two remainders is below about 10^18 and fits in 64 bits, but take the remainder after **every** multiplication, never after two.',
      'This recipe is used in a large share of counting problems in programming contests.'
    ]
  },

  statement: ['Given `n` and `r`, print the number of ways to choose `r` items from `n` items, `C(n, r)`, modulo 1000000007.'],
  inputFormat: ['One line with two integers `n` and `r`.'],
  outputFormat: ['`C(n, r) mod 1000000007`.'],
  constraints: ['0 <= r <= n <= 10^6'],
  examples: [{ input: '5 2\n', note: 'C(5, 2) = 10.' }, { input: '100 50\n', note: 'C(100, 50) is a 30-digit number; its remainder is 538992043.' }],
  hints: [
    'Build `fact[0..n]` with `fact[i] = fact[i - 1] * i % p`.',
    'Division by `b` modulo the prime `p` is multiplication by `b^(p-2) % p`. Compute that with fast exponentiation (repeated squaring).',
    'Answer: `fact[n] * inverse(fact[r]) % p * inverse(fact[n - r]) % p`. Reduce after every multiplication.'
  ],
  program: {
    io: ['n:int r:int'],
    helpers: {
      python: r`
        MOD = 1000000007

        def power(base, exp):
            result = 1
            base %= MOD
            while exp > 0:
                if exp % 2 == 1:
                    result = result * base % MOD
                base = base * base % MOD
                exp //= 2
            return result`,
      cpp: r`
        const long long MOD = 1000000007LL;

        long long power(long long base, long long exp) {
            long long result = 1;
            base %= MOD;
            while (exp > 0) {
                if (exp % 2 == 1) {
                    result = result * base % MOD;
                }
                base = base * base % MOD;
                exp /= 2;
            }
            return result;
        }`,
      java: r`
        static final long MOD = 1000000007L;

        static long power(long base, long exp) {
            long result = 1;
            base %= MOD;
            while (exp > 0) {
                if (exp % 2 == 1) {
                    result = result * base % MOD;
                }
                base = base * base % MOD;
                exp /= 2;
            }
            return result;
        }`
    },
    python: r`
      fact = [1] * (n + 1)
      for i in range(1, n + 1):
          fact[i] = fact[i - 1] * i % MOD
      answer = fact[n] * power(fact[r], MOD - 2) % MOD * power(fact[n - r], MOD - 2) % MOD
      print(answer)`,
    cpp: r`
      vector<long long> fact(n + 1, 1);
      for (long long i = 1; i <= n; i++) {
          fact[i] = fact[i - 1] * i % MOD;
      }
      long long answer = fact[n] * power(fact[r], MOD - 2) % MOD * power(fact[n - r], MOD - 2) % MOD;
      cout << answer << endl;`,
    java: r`
      long[] fact = new long[(int) n + 1];
      fact[0] = 1;
      for (int i = 1; i <= n; i++) {
          fact[i] = fact[i - 1] * i % MOD;
      }
      long answer = fact[(int) n] * power(fact[(int) r], MOD - 2) % MOD * power(fact[(int) (n - r)], MOD - 2) % MOD;
      System.out.println(answer);`
  },
  solution: {
    explanation: ['The factorial table is built once. `fact[r]` and `fact[n - r]` are inverted with Fermat\'s little theorem (`x^(p-2)` is the inverse of `x` modulo the prime `p`), computed by repeated squaring in about 30 steps. Because `n <= 10^6 < p`, no factorial is divisible by `p`, so the inverses exist.'],
    complexity: 'Time O(n + log p), space O(n).'
  },
  solve(input) { const [n, k] = input.trim().split(/\s+/).map(Number); return String(binom(n, k)); },
  tests() {
    const g = rng(97);
    return ['5 2\n', '100 50\n', '0 0\n', '1 0\n', '1 1\n', '10 10\n', '10 0\n', '1000000 500000\n', '1000000 1\n', '1000000 1000000\n', '999999 3\n', ...many(5, () => { const n = randInt(g, 0, 1e6); return `${n} ${randInt(g, 0, n)}\n`; })];
  }
};
