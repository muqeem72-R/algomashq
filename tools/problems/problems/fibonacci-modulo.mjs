import { rng, randBig } from '../lib.mjs';

const MOD = 1000000007n;

// F(0), F(1), ... computed one by one. Slow, but obviously correct: it checks the fast version on small inputs.
function slowFib(n) {
  let a = 0n, b = 1n;
  for (let i = 0; i < n; i++) [a, b] = [b, (a + b) % MOD];
  return a;
}

// Fast doubling: returns [F(k), F(k+1)] modulo MOD.
function fibPair(k) {
  if (k === 0n) return [0n, 1n];
  const [a, b] = fibPair(k >> 1n);
  const c = (a * (((2n * b - a) % MOD + MOD) % MOD)) % MOD;
  const d = (a * a + b * b) % MOD;
  return k & 1n ? [d, (c + d) % MOD] : [c, d];
}

export default {
  slug: 'fibonacci-modulo',
  title: 'Gigantic Fibonacci',
  topic: 'basics',
  difficulty: 'hard',
  order: 6,
  tags: ['recursion', 'math', 'complexity'],

  concept: {
    title: 'Doubling instead of stepping',
    body: [
      'The Fibonacci numbers are `F(0) = 0`, `F(1) = 1` and `F(n) = F(n-1) + F(n-2)`. A loop that walks from 0 to `n` needs `n` steps. For `n` up to 10^18 that is impossible, so we need to jump.',
      'There are identities that jump from `k` to `2k`. If you know the pair `(F(k), F(k+1))` then `F(2k) = F(k) * (2 * F(k+1) - F(k))` and `F(2k+1) = F(k)^2 + F(k+1)^2`. One more Fibonacci step turns an odd `n` into the next pair.',
      'So to get the pair for `n`, first get the pair for `n / 2` (a recursive call on half the size), then apply the identities. The depth of the recursion is about `log2(n)`, which is only 60 for 10^18. This is the **fast doubling** method, and its time is **O(log n)**.',
      'The answer is needed modulo 1000000007 because the true numbers have trillions of digits. Take `% 1000000007` after every multiplication, and make sure the result of a subtraction is not negative before you multiply.'
    ]
  },

  statement: [
    'The Fibonacci sequence is defined by `F(0) = 0`, `F(1) = 1` and `F(n) = F(n-1) + F(n-2)` for `n >= 2`.',
    'Given `n`, print `F(n)` modulo 1000000007.'
  ],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `F(n) mod 1000000007`.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [
    { input: '10\n', note: 'The sequence starts 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, so F(10) = 55.' },
    { input: '0\n', note: 'F(0) = 0.' },
    { input: '100\n', note: 'F(100) is a 21-digit number; we print it modulo 1000000007.' }
  ],
  hints: [
    'A loop that runs `n` times would take ages for `n = 10^18`.',
    'Can you jump from the pair `(F(k), F(k+1))` straight to `(F(2k), F(2k+1))`? Read the identities in the Concept tab.',
    'Write a function that returns the pair `(F(k), F(k+1))` mod p. It calls itself with `k // 2`, applies the two identities, and moves one step further if `k` is odd. Keep every number non-negative before multiplying.'
  ],
  starter: {
    python: '# Read n and print F(n) mod 1000000007\nMOD = 1000000007\nn = int(input())\n\n# Your code here\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nconst long long MOD = 1000000007LL;\n\nint main() {\n    long long n;\n    cin >> n;\n    // Print F(n) mod MOD\n    return 0;\n}\n'
  },
  solution: {
    explanation: [
      '`fib_pair(k)` returns `(F(k), F(k+1))` modulo p. For `k = 0` it returns `(0, 1)`. Otherwise it asks for the pair of `k // 2`, call it `(a, b)`, and computes `c = a * (2b - a)` and `d = a^2 + b^2`, which are `F(2m)` and `F(2m + 1)` for `m = k // 2`.',
      'If `k` is even the answer pair is `(c, d)`. If `k` is odd it is `(d, c + d)`, one step further. Each call halves `k`, so there are at most about 60 calls.',
      'In C++ the subtraction `2b - a` can be negative, so add `MOD` before taking the remainder.'
    ],
    complexity: 'Time O(log n), space O(log n) for the recursion.',
    code: {
      python: 'MOD = 1_000_000_007\n\ndef fib_pair(k):\n    # returns (F(k), F(k+1)) modulo MOD\n    if k == 0:\n        return (0, 1)\n    a, b = fib_pair(k >> 1)\n    c = a * ((2 * b - a) % MOD) % MOD\n    d = (a * a + b * b) % MOD\n    if k & 1:\n        return (d, (c + d) % MOD)\n    return (c, d)\n\nn = int(input())\nprint(fib_pair(n)[0])\n',
      cpp: '#include <iostream>\n#include <utility>\nusing namespace std;\n\nconst long long MOD = 1000000007LL;\n\n// returns (F(k), F(k+1)) modulo MOD\npair<long long, long long> fibPair(long long k) {\n    if (k == 0) return {0, 1};\n    auto [a, b] = fibPair(k >> 1);\n    long long t = (2 * b - a + MOD) % MOD;\n    long long c = a * t % MOD;\n    long long d = (a * a + b * b) % MOD;\n    if (k & 1) return {d, (c + d) % MOD};\n    return {c, d};\n}\n\nint main() {\n    long long n;\n    cin >> n;\n    cout << fibPair(n).first << endl;\n    return 0;\n}\n'
    }
  },

  solve(input) {
    const n = BigInt(input.trim());
    return String(fibPair(n)[0]);
  },

  tests() {
    // The fast version must agree with the slow loop on small inputs.
    for (let n = 0; n <= 3000; n++) if (fibPair(BigInt(n))[0] !== slowFib(n)) throw new Error(`fast doubling disagrees at n=${n}`);
    const r = rng(1006);
    const T18 = 10n ** 18n;
    const out = [0n, 1n, 2n, 3n, 10n, 50n, 90n, 91n, 92n, 100n, 1000n, 1000000n, 1000000000n, T18, T18 - 1n, 576460752303423487n];
    for (let i = 0; i < 6; i++) out.push(randBig(r, 0n, T18));
    return out.map((n) => `${n}\n`);
  }
};
